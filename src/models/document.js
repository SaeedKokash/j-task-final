'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user');

const Document = sequelize.define('Document', {
  monetary_value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'request to create'
  },
  latestUser: {
    type: DataTypes.ENUM('maker', 'middleman', 'checker'),
    allowNull: false,
    defaultValue: 'maker'
  },
  isMakerApproved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isMiddlemanApproved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isCheckerApproved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  makerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  middlemanId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  checkerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  toBeModified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
});

Document.belongsTo(User, { as: 'Maker', foreignKey: 'makerId' });
Document.belongsTo(User, { as: 'Middleman', foreignKey: 'middlemanId' });
Document.belongsTo(User, { as: 'Checker', foreignKey: 'checkerId' });

module.exports = Document;
