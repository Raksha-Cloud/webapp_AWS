const { Sequelize, Models } = require('sequelize');
const db = require('../db.js');
// creating a new table files to store user document information
const file = db.define(
  'files',
  {
    doc_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: true,
      },
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: true,
      },
    },
    s3_bucket_path: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: true,
      },
    },
  },
  {
    createdAt: 'date_created',
    updatedAt: false
  }
);

module.exports = file;