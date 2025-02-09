const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true,
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

// testcase - { "username": "ray", "password": "1234" }
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    //[Debug]console.log("username:" + username + "password:" + password);
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
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ message: 'Logged in', user });
});

//testcase - { "name": "book1", "desc": "cool book!", "price": 55, "category": "commerce", "imageUrl" : "abcde" }
app.post('/product/add', async (req, res) => {
  if (req.session.role !== 'user') return res.status(403).json({ error: 'Unauthorized' });
  const product = await Product.create(req.body);
  res.json({ message: 'Product added', product });
});

app.get('/product/list', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

app.post('/cart/add', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const { productId } = req.body;
  const cartItem = await Cart.findOne({ where: { userId: req.session.userId, productId } });
  if (cartItem) {
    cartItem.quantity += 1;
    await cartItem.save();
  } else {
    await Cart.create({ userId: req.session.userId, productId, quantity: 1 });
  }
  res.json({ message: 'Added to cart' });
});

app.get('/cart/list', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const cartItems = await Cart.findAll({ where: { userId: req.session.userId } });
  console.log("cartItems: " + cartItems);
  res.json(cartItems);
});

app.post('/cart/del', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const { productId } = req.body;
  await Cart.destroy({ where: { userId: req.session.userId, productId } });
  res.json({ message: 'Removed from cart' });
});

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
