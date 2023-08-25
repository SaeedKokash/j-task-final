'use strict';

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();
const POSTGRES_URI = process.env.POSTGRES_URI;

const sequelize = new Sequelize(POSTGRES_URI, {});

module.exports = { sequelize };
