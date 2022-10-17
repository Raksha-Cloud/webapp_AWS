const User = require('../Models/accounts');
const bcrypt = require("bcrypt");

var accountAccess = {
    create: create,
    accountDetails:accountDetails,
     findById: findById,
     updateAccountByID: updateAccountByID
}

function accountDetails(username) {
    return User.findOne({ where: { username: username } });
  }


function findById(id) {
    return User.findByPk(id);
}



function create(account) {
    var newAccount = new User(account);
    return newAccount.save();
}

function updateAccountByID(account, id) {
    var updateAccount = {
      first_name: account.first_name,
      last_name: account.last_name,
      password: account.password,
    };
    return User.update(updateAccount, { where: { id: id } });
}
module.exports = accountAccess;
