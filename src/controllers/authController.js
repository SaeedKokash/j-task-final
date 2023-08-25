const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const base64 = require('base-64');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const { name, address, identification, role, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    address,
    identification,
    role,
    password: hashedPassword
  });

  res.status(201).json({ user });
});

exports.login = asyncHandler(async (req, res) => {
  const basicHeader = req.headers.authorization.split(" ");
  const encodedString = basicHeader.pop();
  const decodedString = base64.decode(encodedString);
  const [loginData, password] = decodedString.split(":");

  const user = await User.findOne({ where: { name: loginData } });

  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);
  res.json({ token });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  console.log("TEST");
  const users = await User.findAll();
  res.json({ users });
}
);
