var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userProfile = mongoose.model('userConnectionModel',new Schema({userID: String, connectionID: String, rsvp: String}), 'userConnections');
var p = require('./../utilities/userProfile.js')
module.exports.getAllUserConnections = function(usrID){
  try {
return userProfile.find({userID: usrID});
  } catch(err) {
console.log(err);
  }
}
module.exports.deleteConnection =async function(usrID,conID){
  try {
    await userProfile.deleteOne({userID:usrID,connectionID:conID});
  } catch(err) {
console.log(err);
  }
}
module.exports.deleteConnectionfromAll =async function(conID){
  try {
    await userProfile.deleteOne({connectionID:conID});
  } catch(err) {
console.log(err);
  }
}
module.exports.updateConnection = function(usrID, conID,rsvp){
    userProfile.findOneAndUpdate({userID:usrID, connectionID: conID},{$set:{rsvp: rsvp}},function(err,doc){
    console.log(err);
    console.log(doc);
  });
}
module.exports.addConnection = function(usrID,conID,rsvp){
  try {
    var newConnection = new userProfile({userID: usrID, connectionID: conID, rsvp: rsvp})
    newConnection.save(function (err, userProfile) {
      if (err) return console.error(err);
      console.log(userProfile.conID + " saved to bookstore collection.");
    });
  } catch(err) {
console.log(err);
  }
}
