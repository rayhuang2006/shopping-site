const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

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

// 設置關聯
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

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
  res.json({ message: 'Logged in', token });
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
  if (req.user.role !== 'user') return res.status(403).json({ error: 'Unauthorized' });
  const product = await Product.create(req.body);
  res.json({ message: 'Product added', product });
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

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});