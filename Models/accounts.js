const Sequelize = require('sequelize');
const db = require('../db.js');

const User = db.define('test', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [1,32],
                msg: "Input length should be between 6 to 32 "
           }
          }
        
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [1,32],
                msg: "Input length should be between 6 to 32 "
           }
          }
    },
   
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: {
                args: true,
                msg: 'Invalid email pattern'
            },
            len: {
                args: [1,32],
                msg: "Input length should be between 6 to 32 "
           }
          },
       
        unique: {
            args: true,
            msg: 'Username already exists'
          }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8,100],
                msg: "Input length should be between 8 to 32 "
           }
          }

    },
    // created_at: {
    // //     allowNull: false,
    // //     type: Sequelize.DATE,
    // //     defaultValue: Sequelize.fn('NOW'),
    // // },
    // // updated_at: {
    // //     allowNull: false,
    // //     type: Sequelize.DATE,
    // //     defaultValue: Sequelize.fn('NOW'),
    // },
    // timestamps: false
});

module.exports = User;

