const File = require('../Models/fileUploads.js');
// creating the dao file
const fileAccess = {
  createFile: createFile,
  deleteFile: deleteFile,
  checkIfIdExists: checkIfIdExists,
  getFile: getFile,
  getAllFiles: getAllFiles,
};
// method to upload a record with a user name using built in sequilize function
function createFile(fileDetails) {
  var newFile = new File(fileDetails);
  return newFile.save();
}

// method to check if any user with documents exist in Accounts table
function checkIfIdExists(userId) {
  return File.findOne({ where: { user_id: userId } });
}

// method to get all documents for a particular user
function getAllFiles(userId) {
  return File.findAll({ where: { user_id: userId } });
}

// method to get a particular document for a particular user
function getFile(fileId) {
  return File.findOne({ where: { doc_id: fileId } });
}

// method to delete a particular document for a particular user
function deleteFile(fileId) {
  return File.destroy({ where: { doc_id: fileId } });
}
module.exports = fileAccess;