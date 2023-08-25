"use strict";

const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;

// for production
if (process.env.NODE_ENV === "production") {
  const sequelizeOptions = {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };

  const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);
}

// for development
if (process.env.NODE_ENV === "development") {
  const sequelizeOptions = {};
  const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);
}
module.exports = { sequelize };
