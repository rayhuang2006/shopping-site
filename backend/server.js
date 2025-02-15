const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';
const CLIENT_ID = '873334368949-2fh00u2lq1v5ks9ae96bqdgmnq29opp6.apps.googleusercontent.com';
const CLIENT_URL = 'http://localhost:8080';

app.use(express.json());
app.use(
  cors({
    //origin: "http://localhost:8080",
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost")) {
        callback(null, true);
      } else if (!origin || origin.startsWith("https://localhost")) {
        callback(null, true);
      } else if (!origin || origin.startsWith(`http://192.168`)) {
        callback(null, true);
      } else if (!origin || origin.startsWith(`http://140.115.26.156`)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './shopping.db',
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
});

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  desc: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING },
  imageUrl: { type: DataTypes.STRING },
});

const Cart = sequelize.define('Cart', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
});

User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

app.post('/verify-token', async (req, res) => {
  const client = new OAuth2Client(CLIENT_ID);
  const token = req.body.credential;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // 檢查用戶是否已存在
    let user = await User.findOne({ where: { username: email } });
    if (!user) {
      user = await User.create({ username: email, password: '', role: 'user' });
    }

    const jwtToken = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      token: jwtToken,
      name,
      email,
      picture,
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

// testcase - { "username": "ray", "password": "1234" }
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.json({ message: 'User registered', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// testcase - { "username": "ray", "password": "1234" }
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Logged in', token, role: user.role });
  console.log('Logged in successfully');
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

//testcase - { "name": "book1", "desc": "cool book!", "price": 55, "category": "commerce", "imageUrl" : "abcde" }
app.post('/product/add', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const product = await Product.create(req.body);
  res.json({ message: 'Product added', product });
});

app.delete('/product/delete/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  await Product.destroy({ where: { id } });
  res.json({ message: 'Product deleted' });
});

app.get('/product/list', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

app.post('/cart/add', authenticateJWT, async (req, res) => {
  const { productId } = req.body;
  const cartItem = await Cart.findOne({ where: { userId: req.user.userId, productId } });
  if (cartItem) {
    cartItem.quantity += 1;
    await cartItem.save();
  } else {
    await Cart.create({ userId: req.user.userId, productId, quantity: 1 });
  }
  res.json({ message: 'Added to cart' });
});

app.get('/cart/list', authenticateJWT, async (req, res) => {
  const cartItems = await Cart.findAll({
    where: { userId: req.user.userId },
    include: [{ model: Product }],
  });
  res.json(cartItems);
});

app.post('/cart/del', authenticateJWT, async (req, res) => {
  const { productId } = req.body;
  await Cart.destroy({ where: { userId: req.user.userId, productId } });
  res.json({ message: 'Removed from cart' });
});

app.post('/cart/checkout', authenticateJWT, async (req, res) => {
  await Cart.destroy({ where: { userId: req.user.userId } });
  res.json({ message: 'Checkout successful' });
});

//defaultUser : admin, password : admin
sequelize.sync().then(async () => {
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
    console.log('Admin user created');
  }

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
