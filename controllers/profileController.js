var express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var connectionDB = require('./../models/connectionDB.js')
var userDB = require('./../utilities/userDB.js')
var urlencodedParser = require('urlencoded-parser');
var userProfile = require('./../utilities/userProfile.js')
var app = express();
var bcrypt = require('bcrypt');

var BCRYPT_SALT_ROUNDS = 12;
const { check, validationResult } = require('express-validator');
router.use(bodyParser.json()); // support json encoded bodies
urlencodedParser = bodyParser.urlencoded({ extended: false });
var urlencodedParser = bodyParser.urlencoded({ extended: false });
router.use(session({secret: 'iloveuncc'}));
// logIn get method
router.get('/logIn', async function(req,res,next){
  if(req.query.action === "signUp"){
    res.render('logIn',{flag:1,d2:1});
  }else{
    res.render('logIn',{flag:1,d2:0});
  }
});
//signUp get method
router.get('/signUp', function(req,res,next){
  if(req.query.error === "1"){
    res.render('signUp',{flag:1,er:1});
  }else if(req.query.error === "2"){
    res.render('signUp',{flag:1,er:2});
  }else{
    res.render('signUp',{flag:1,er:0});
  }

});

//savedconnections get method
router.get('/savedconnections', async function(req,res,next){
  //check if session is active
  if (req.session.theUser){
    console.log(req.query);
    //delete the connection from users profile
    if(req.query.action === "delete"){
      var conID = req.query.conID;
      var userID = req.session.theUser;
      await userProfile.deleteConnection(req.session.theUser.userID, conID);
      console.log(req.query);
      for(var i = 0; i< req.session.theUserConnections.length; i++){
        if(req.session.theUserConnections[i].connectionID === conID){
          //return the data matching id
            req.session.theUserConnections.splice(i,1);
            req.session.theUserConnectionsDetails.splice(i,1);
        }
      }
    }
    // update users profile connection list
    if(req.query.action === "update"){
      var conID = req.query.conID;
      console.log(req.session.theUserConnections);
      var flag =0
      for(var i = 0; i< req.session.theUserConnectionsDetails.length; i++){
        if(req.session.theUserConnections[i].connectionID === conID){
          //return the data matching id
            await userProfile.updateConnection(req.session.theUser.userID, conID, req.query.rsvp);
            req.session.theUserConnections[i].rsvp = req.query.rsvp;
            flag =1
            console.log(req.session.theUserConnectionsDetails);
        }
      }
      if (flag !=1){
        await userProfile.addConnection(req.session.theUser.userID, conID, req.query.rsvp);
        req.session.theUserConnections.push({userID:req.session.theUser.userID, connectionID:conID, rsvp: req.query.rsvp});
         req.session.theUserConnectionsDetails.push( await connectionDB.getConnection(conID));
      }
      console.log(req.session.theUserConnections);
    }
    res.render('savedconnections',{data1:req.session.theUserConnections,data2:req.session.theUserConnectionsDetails,data3:req.session.theUser.firstName,flag:1});
    console.log("null");
  }else{
    var theUser = await userDB.getUser("jd1");
    console.log("This is the user",theUser);
    console.log("this is the user ID ", theUser.userID);
    req.session.theUser = theUser;
    var theUserConnections = await userProfile.getAllUserConnections(theUser.userID);
    req.session.theUserConnections = theUserConnections;
    var theUserConnectionsDetails =[]
    console.log(theUserConnections);
    for (var i =0; i< theUserConnections.length; i++){
            theUserConnectionsDetails.push(await connectionDB.getConnection(theUserConnections[i].connectionID));
    }
    req.session.theUserConnectionsDetails = theUserConnectionsDetails;
    console.log(req.session.theUserConnectionsDetails);
    res.render('savedconnections',{data1:req.session.theUserConnections,data2:req.session.theUserConnectionsDetails,data3:req.session.theUser.firstName,flag:1});
  }
});
// login Post method
router.post('/logIn', urlencodedParser, [check('UserName').isEmail().isLength({min:4}),check('Password').isLength({min:5})], async function (request, response, next) {
  console.log(request.body);
    const validation_result = validationResult(request);
    console.log(validation_result);
    if(!validation_result.isEmpty()){
      console.log("THERE WERE ERROR(S)",validation_result);
     response.redirect('/logIn' );
   }else{
     var theUser = await userDB.getUserbyEmail(request.body.UserName);
     console.log(theUser);
     if(theUser){
         bcrypt.compare(request.body.Password, theUser.password, async function (err, result) {
           if (result == true) {
             console.log("This is the user",theUser);
             console.log("this is the user ID ", theUser.userID);
             request.session.theUser = theUser;
             var theUserConnections = await userProfile.getAllUserConnections(theUser.userID);
             request.session.theUserConnections = theUserConnections;
             var theUserConnectionsDetails =[]

             console.log(theUserConnections);
             for (var i =0; i< theUserConnections.length; i++){
                     theUserConnectionsDetails.push(await connectionDB.getConnection(theUserConnections[i].connectionID));
             }
             request.session.theUserConnectionsDetails = theUserConnectionsDetails;
             console.log(request.session.theUserConnectionsDetails);
             response.redirect('savedconnections');
                }else{
             response.redirect('/logIn');
           }
         })
       }else{
             response.redirect('/logIn');
           }
           }



})
router.post('/signup', urlencodedParser,[check('UserName').isEmail().isLength({min:4}),check('Password').isLength({min:5}), check('zipCode').isNumeric()], async function (request, response, next) {
  console.log(request.body);
     const validation_result = validationResult(request);
     if(!validation_result.isEmpty()){
       console.log("THERE WERE ERROR(S)"+JSON.stringify(validation_result));
      response.redirect('/signUp?error=1');
    }else{
      var theUser = await userDB.getUserbyEmail(request.body.UserName);
      if(theUser){
        response.redirect('/signUp?error=2');
      }else{
        var users = await userDB.getAllUsers();
        var num = users.length + 1
        var str = request.body.firstName.charAt(0) + request.body.lastName.charAt(0) + num
        var usrID = str.toLowerCase();
        bcrypt.hash(request.body.Password, BCRYPT_SALT_ROUNDS)
    .then(async function(hashedPassword) {
        var theUser = await userDB.addUser(usrID, request.body.firstName, request.body.lastName, request.body.UserName, hashedPassword, request.body.address1, request.body.address2, request.body.city, request.body.state, request.body.zipCode, request.body.country);
        console.log("123",theUser, hashedPassword);
        })
        if(theUser &&  theUser.password === request.body.Password){
          console.log("This is the user",theUser);
          console.log("this is the user ID ", theUser.userID);
          request.session.theUser = theUser;
          var theUserConnections = await userProfile.getAllUserConnections(theUser.userID);
          request.session.theUserConnections = theUserConnections;
          var theUserConnectionsDetails =[]

          console.log(theUserConnections);
          for (var i =0; i< theUserConnections.length; i++){
                  theUserConnectionsDetails.push(await connectionDB.getConnection(theUserConnections[i].connectionID));
          }
          request.session.theUserConnectionsDetails = theUserConnectionsDetails;
          console.log(request.session.theUserConnectionsDetails);
          response.redirect('/logIn?action=signUp');
        }else{
          response.redirect('/logIn?action=signUp');
        }
      }


      }
})
router.post('/connections',[check('Topic').isLength({min:4}).isAlpha(),check('start').isLength({min:3}),check('end').isLength({min:3}),check('Name').isLength({min:4}).isAlpha(),check('Date').isLength({min:4}),check('Descrition').isLength({min:10}).isAlphanumeric(),check('Location').isLength({min:4}).isAlphanumeric()], urlencodedParser, async function (request, response) {
  const validation_result = validationResult(request);
  if(validation_result.isEmpty() === true){
    console.log("THERE WERE ERROR(S)"+JSON.stringify(validation_result));
   response.redirect('/newConnection');
 }else{
   if(request.query.action === "edit"){
     var test= await connectionDB.getAllConnections();
     var time = request.body.start + " - " + request.body.end;
     await connectionDB.updateConnection(request.query.conID,request.body.Name, request.body.Topic, request.body.Descrition, request.body.Date, time, request.body.Location, request.session.theUser.userID);
     console.log(conID,request.body.Name, request.body.Topic, request.body.Descrition, request.body.Date, time, request.body.Location);
     console.log(request.body);
     var date = new Date(request.body.Date);
     console.log(date.toDateString());
     var theUserConnections = await userProfile.getAllUserConnections(theUser.userID);
     request.session.theUserConnections = theUserConnections;
     var theUserConnectionsDetails =[]

     console.log(theUserConnections);
     for (var i =0; i< theUserConnections.length; i++){
             theUserConnectionsDetails.push(await connectionDB.getConnection(theUserConnections[i].connectionID));
     }
     request.session.theUserConnectionsDetails = theUserConnectionsDetails;
     console.log(request.session.theUserConnectionsDetails);
     var test1= await connectionDB.getAllConnections();
     var italian1 =[];
     var chinese1 = [];
     for(var i =0; i<test1.length; i++){
       // Sort according to Category and store in category array
       if(test1[i].connectionTopic === "Italian"){
         italian1.push(test1[i]);
       }
       if(test1[i].connectionTopic === "Chinese"){
         chinese1.push(test1[i]);
       }
     }
     if(request.session.theUser){
       response.render('connections', {italian:italian1, chinese:chinese1, data3:request.session.theUser.firstName, flag:1});
     }
     else{
       response.render('connections', {italian:italian1, chinese:chinese1, flag: 0});
     }
   }else{
     var test= await connectionDB.getAllConnections();
     var italian =[];
     var chinese = [];
     for(var i =0; i<test.length; i++){
       // Sort according to Category and store in category array
       if(test[i].connectionTopic === "Italian"){
         italian.push(test[i]);
       }
       if(test[i].connectionTopic === "Chinese"){
         chinese.push(test[i]);
       }
     }
     var time = request.body.start + " - " + request.body.end;

     if(request.body.Topic === "Italian"){
       var i = italian.length+1
       var conID = "I" + i;
       await connectionDB.addConnection(conID,request.body.Name, request.body.Topic, request.body.Descrition, request.body.Date, time, request.body.Location, request.session.theUser.userID);
       console.log(conID,request.body.Name, request.body.Topic, request.body.Descrition, request.body.Date, time, request.body.Location);
     }
     if(request.body.Topic === "Chinese"){
       var i = chinese.length+1;
       var conID = "C" + i;
       await connectionDB.addConnection(conID,request.body.Name, request.body.Topic, request.body.Descrition, request.body.Date, time, request.body.Location, request.session.theUser.userID);
       console.log(conID,request.body.Name, request.body.Topic, request.body.Descrition, request.body.Date, time, request.body.Location);
     }
     console.log(request.body);
     var date = new Date(request.body.Date);
     console.log(date.toDateString());

     var test1= await connectionDB.getAllConnections();
     var italian1 =[];
     var chinese1 = [];
     for(var i =0; i<test1.length; i++){
       // Sort according to Category and store in category array
       if(test1[i].connectionTopic === "Italian"){
         italian1.push(test1[i]);
       }
       if(test1[i].connectionTopic === "Chinese"){
         chinese1.push(test1[i]);
       }
     }
     if(request.session.theUser){
       response.render('connections', {italian:italian1, chinese:chinese1, data3:request.session.theUser.firstName, flag:1});
     }
     else{
       response.render('connections', {italian:italian1, chinese:chinese1, flag: 0});
     }
   }
   }



})
router.get('/connections', async function(req,res){
  if(req.query.action === "delete"){
    await connectionDB.deleteConnection(req.query.conID)
    await userProfile.deleteConnectionfromAll(req.query.conID)
    var theUserConnections = await userProfile.getAllUserConnections(theUser.userID);
    request.session.theUserConnections = theUserConnections;
    var theUserConnectionsDetails =[]

    console.log(theUserConnections);
    for (var i =0; i< theUserConnections.length; i++){
            theUserConnectionsDetails.push(await connectionDB.getConnection(theUserConnections[i].connectionID));
    }
    request.session.theUserConnectionsDetails = theUserConnectionsDetails;
    console.log(request.session.theUserConnectionsDetails);
  }
  //get all data from database using the getConnection method from utility
  var test= await connectionDB.getAllConnections();
  var italian =[];
  var chinese = [];
  for(var i =0; i<test.length; i++){
    // Sort according to Category and store in category array
    if(test[i].connectionTopic === "Italian"){
      italian.push(test[i]);
    }
    if(test[i].connectionTopic === "Chinese"){
      chinese.push(test[i]);
    }
  }

  if(req.session.theUser){
    res.render('connections', {italian:italian, chinese:chinese, data3:req.session.theUser.firstName, flag:1});
  }
  else{
    res.render('connections', {italian:italian, chinese:chinese, flag: 0});
  }
});

router.get('/connection', async function(req,res){
  var event = await connectionDB.getConnection(req.query.conID);
  var host_id = event.userID
  var host = await userDB.getUser(host_id)
  if(req.session.theUser){
    if (host_id === req.session.theUser.userID){
      res.render('connection',{event:event,data3:req.session.theUser.firstName, flag:1, host:host.firstName, edit:1});
    }else{
      res.render('connection',{event:event,data3:req.session.theUser.firstName, flag:1, host:host.firstName, edit:0});
    }

}else{
  res.render('connection',{event:event, flag:0,host:host.firstName, edit:0});
}
});
router.get('/logout', function(req,res){
  req.session.destroy(function(err){
    if(err){
      res.negotiate(err);
    }
    res.redirect('/');
  })
})
router.get('/newconnection',async function(req,res){
  if(req.query.conID){
    var event = await connectionDB.getConnection(req.query.conID);
    var host_id = event.userID;
  }
  if (req.query.action === "edit"){
    if (host_id === req.session.theUser.userID){
      res.render('newconnection',{data3:req.session.theUser.firstName, flag:1,event:event, edit:1});
    }
    res.render('newconnection',{data3:req.session.theUser.firstName, flag:1,event:event,edit:0});
  }
  res.render('newconnection',{data3:req.session.theUser.firstName, flag:1, event:event, edit:0}  );
});
module.exports = router;
