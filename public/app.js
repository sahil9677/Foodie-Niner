//require express and other models that we need to use
var mongoose = require('mongoose');
var profileController = require('./../controllers/profileController')
var connectionDB = require('./../models/connectionDB.js')
var express = require('express');
var router = express.Router();
var app = express();
var connectionDB = require('./../models/connectionDB.js')
var userDB = require('./../utilities/userDB.js')
mongoose.connect('mongodb://localhost/foodieNiner',{ useNewUrlParser: true });
var userProfile = require('./../utilities/userProfile.js')
//set the views folder and assets folder to get ejs and css files and images
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async function() {
   console.log("We are connected!");
   console.log(await userProfile.getAllUserConnections("jd1"));
});

app.set('view engine', 'ejs');
app.use('/assets', express.static('./assets'));


//use get method to set views to paths
app.get('/', function(req,res){

  //use render function to render the appropriate ejs file
  res.render('index');
});




//use get method to set views to paths
app.get('/contact', function(req,res){
  res.render('contact');
});
app.get('/about', function(req,res){
  res.render('about');
});
app.use(profileController);


app.listen(3000);
