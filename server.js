var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var session = require("express-session");
var PORT = process.env.PORT || 8080;
var Sequelize = require("sequelize");
var sequelize = new Sequelize('my_class_db', 'root');
//create new user in db
// var User = sequelize.define('user', {
//   firstname: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   lastname: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   email: {
//     type: Sequelize.STRING,
//     unique: true,
//     allowNull: false
//   },
//   password: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   status: {
       // type: Sequelize.STRING,
//     allowNull: false
// }
// });

var app = express();
//get css,js, or images from files in public folder
app.use(express.static(process.cwd() + '/public'));
app.use(session({
  secret: "my super secret",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 *30
  },
  saveUninitialized: true,
  resave: false
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.get("/", function(req, res){
  res.render("register");
});

app.post("/register", function(req,res){
  console.log(req.body);
  res.render("login");
});

app.get("/login", function(req, res){
  res.render("login");
});
//query the db to see if user is student or instructor and render correct page
app.post("/login", function(req,res){
  res.render("students");
});

app.listen(PORT, function(){
  console.log("listening on port %s", PORT);
});
