var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connection_model = mongoose.model('ConnectionModel',new Schema({connectionID: String, connectionName: String, connectionTopic: String, details: String, date: String, Time: String, Location: String, userID:String}), 'connections');
module.exports.getAllConnections = function(){
  try {
return connection_model.find();
  } catch(err) {
console.log(err);
  }
}
module.exports.getConnection = function(conID){
  try {
return connection_model.findOne({connectionID:conID});
  } catch(err) {
console.log(err);
  }
}
module.exports.addConnection = function(conID,conName, conTopic, details, date, time, location,usrID){
  try {
    var newConnection = new connection_model({connectionID: conID, connectionName: conName, connectionTopic: conTopic, details: details, date: date, Time: time, Location: location, userID:usrID})
    newConnection.save(function (err, connection_model) {
      if (err) return console.error(err);
      console.log(connection_model.conID + " saved to bookstore collection.");
    });
  } catch(err) {
console.log(err);
  }
}
module.exports.deleteConnection =async function(conID){
  try {
    await connection_model.deleteOne({connectionID:conID});
  } catch(err) {
console.log(err);
  }
}
module.exports.updateConnection = function(conID,conName, conTopic, details, date, time, location,usrID){
    connection_model.findOneAndUpdate({connectionID: conID},{$set:{connectionID: conID, connectionName: conName, connectionTopic: conTopic, details: details, date: date, Time: time, Location: location, userID:usrID}},function(err,doc){
    console.log(err);
    console.log(doc);
  });
}
