var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var user_model = mongoose.model('userModel',new Schema({userID: String, firstName: String, lastName: String, email: String, password: String, optionalFields: {address1:String, address2:String, city:String, state:String, zipCode:Number, country:String }}), 'users');

module.exports.getAllUsers = function(){
  try {
return user_model.find();
  } catch(err) {
console.log(err);
  }
}
module.exports.getUser = function(usrID){
  try {
return user_model.findOne({userID:usrID});
  } catch(err) {
console.log(err);
  }
}
module.exports.getUserbyEmail = function(email){
  try {
return user_model.findOne({email:email});
  } catch(err) {
console.log(err);
  }
}
module.exports.addUser = function(userID, firstName, lastName, email, password, address1, address2, city, state, zipCode, country){
  try {
    var newUser = new user_model({userID: userID, firstName: firstName, lastName: lastName, email: email, password: password, optionalFields: {address1:address1, address2:address2, city:city, state:state, zipCode:zipCode, country:country}})
    newUser.save(function (err, user_model) {
      if (err) return console.error(err);
      console.log(user_model.userID + " saved to bookstore collection.");
      return newUser
    });
  } catch(err) {
console.log(err);
  }
}
