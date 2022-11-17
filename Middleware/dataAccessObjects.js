const User = require('../Models/accounts');

//define all the methods
var accountAccess = {
    create: create,
    accountDetails:accountDetails,
     findById: findById,
     updateAccountByID: updateAccountByID,
     accountDetailsSave:accountDetailsSave
}

//method to fetch a record with a user name using built in sequilize function
function accountDetails(username) {
    return User.findOne({ where: { username: username } });
  }
//method to create a new record using built in sequilize function
function create(account) {
    var newAccount = new User(account);
    return newAccount.save();
}
//method to fetch a record with a id using built in sequilize function
function findById(id) {
    return User.findByPk(id);
}

//method to update a record with a request body and id using built in sequilize function
function updateAccountByID(account, id) {
    var updateAccount = {
      first_name: account.first_name,
      last_name: account.last_name,
      password: account.password,
    };
    return User.update(updateAccount, { where: { id: id } });
}


module.exports = accountAccess;
