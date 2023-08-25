"use strict";

const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;

let sequelize;

// for production
if (process.env.NODE_ENV === "production") {
  let sequelizeOptions = {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };

  sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);
}

// for development
if (process.env.NODE_ENV === "development") {
  let sequelizeOptions = {};
  sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);
}

module.exports = { sequelize };
