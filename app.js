var express = require("express");
var bodyParser = require("body-parser")
var cookieSession = require("cookie-session")
var path = require("path")
var app = express();
var request = require("request");


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var port =  process.env.PORT || 5000;


app.listen(port, function(){
  console.log("listening on " + port)
})

// MIDDLEWARE

app.use(cookieSession({
  keys: ['secret1']
}));
app.use(bodyParser());

//INDEX

app.get("/", function(req, res){
  var user = req.session.user
  console.log(user)
  if (user) {
    mkreq("http://rocky-reaches-6048.herokuapp.com/tasks",
        "GET", 
        {user_id: user.id},
        function(error, response, body) {
        var json = JSON.parse(body);
          console.log(json)
          res.render("index", {title: req.session.user.name, tasks: json})
        }
         )
  }
  else {
  res.render("index", {title: "No USER logged in"})
  }
})

app.post("/tasks", function(req, res){
  mkreq("http://rocky-reaches-6048.herokuapp.com/tasks",
      "POST",
      {
        content: req.body.task,
        user_id: req.session.user.id
      },
      function(error, response, body) {
      res.redirect("/")
      })

})

// LOGIN

// http://arcane-inlet-5182.herokuapp.com/ <<< users API


app.get("/login", function(req,res){
  res.render("login")
})

app.post("/login", function (req,res){
  mkreq("http://arcane-inlet-5182.herokuapp.com/users/0",
      "GET",
      {
       username: req.body.username,
       password: req.body.password
        },
      function(error, response, body) {
        if (body != "false") {
        var json = JSON.parse(body)
          var user_id = json["id"];
          var name = json["username"]
          req.session.user = {id: user_id, name: name}
          res.redirect("/")
        }
        else {
          console.log(error)
          res.redirect("/")
        }
      })
})

//REGISTER


app.get("/register", function(req,res){
  res.render("register")
})

app.post("/register", function (req,res){
  mkreq("http://arcane-inlet-5182.herokuapp.com/users",
      "POST",
        {
        username: req.body.username,
        password: req.body.password
        },
      function(error, response, body) {
        var json = JSON.parse(body)
          var user_id = json["id"];
          var name = json["username"]
          req.session.user = {id: user_id, name: name}
          res.redirect("/")
      })
})
//LOGOUT

app.post("/logout", function (req,res){
  req.session.user = null
  res.redirect("/")
})

// HELPERS

function mkreq (url,method,form,callback) {
  request({
    url: url,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'curl/7.30.0',
      'Accept': '*/*'
    },
    form: form
  }, callback)
}