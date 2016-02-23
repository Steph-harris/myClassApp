var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var session = require("express-session");
var PORT = process.env.PORT || 8080;

var Sequelize = require("sequelize");
var sequelize = new Sequelize('my_class_db', 'root');

var passport = require('passport');
var passportLocal = require('passport-local');

// create new user in db
var Instructor = sequelize.define('instructor', {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: {
       type: Sequelize.STRING,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});

var Student = sequelize.define('student', {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: {
       type: Sequelize.STRING,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: function(input){
      input.password = bcrypt.hashSync(input.password, 10);
    }
  }
});
//Sequelize link instructor to students
Instructor.hasMany(Student);

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
app.use(passport.initialize());
app.use(passport.session());

//Student authentication
passport.use(new passportLocal.Strategy(
  function(email, password, done) {
    //Check password in DB
    Student.findOne({
      where:{
        email: email
      }
    }).then(function(user){
      //check password against hash
      if(user){
        bcrypt.compare(password, user.dataValues.password, function(err, user){
          if(user){
            //if password is correct authenticate the user with cookie
            done(null, {id: email, email:email});
          }else{
            done(null,null);
          }
        });
      }else {
        done(null, null);
      }
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  done(null, { id: id, username: id })
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.get("/", function(req, res){
  res.render("register", { msg: req.query.msg});
});

app.post("/register", function(req,res){
  //create password hash
  // })
  //place new user in either student or instructor table
  if(req.body.status === "student"){
    Student.create(req.body).then(function(result){
    res.render("students", {result});
    }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.errors[0].message);
    });
  } else {
    Instructor.create(req.body).then(function(result){
    res.render("instructors", {result});
    }).catch(function(err) {
    console.log(err);
    res.redirect('/?msg=' + err.errors[0].message);
    });
  }
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/students", function(req, res){
  res.render("students");
});

app.get("/instructors", function(req, res){
  res.render("students");
});

//query the db to see if user is student or instructor and render correct page
app.post("/login", function(req,res){
  if(req.body.status === "student"){
    passport.authenticate('local', {
      successRedirect: "/students",
      failureRedirect: "/login"
    });
  }
  // else {
  //   passport.authenticate('instructor', {
  //     successRedirect: "/instructors",
  //     failureRedirect: "/login"
  //   });
  // };
  // User.findOne({ where: {email: req.body.email} }).then(function(result){
  //   if(result.password === req.body.password){
  //     res.send("You're In");
  //   } else {
  //     res.send("no match found");
  //   }
  // });
});

sequelize.sync().then(function() {
  app.listen(PORT, function(){
    console.log("listening on port %s", PORT);
  });
});
