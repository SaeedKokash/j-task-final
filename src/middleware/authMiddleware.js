'use strict';
// checking if the user exists or not

const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');

const basicAuth = asyncHandler(async (req, res, next) => {
    const name  = req.body.name;
    const user = await User.findOne({ where: { name } });
    
    if (user) {
        return res.status(400).json({ error: 'User already exists' });
    }

    next();
});

module.exports = basicAuth;