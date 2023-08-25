'use strict';

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = new Sequelize(DATABASE_URL, {});

module.exports = { sequelize };
