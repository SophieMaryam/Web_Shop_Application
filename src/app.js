const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use('/', bodyParser.urlencoded({extended:true}));

// Model Configuration
const Sequelize = require('sequelize');
const connection = new Sequelize('', '', '', {
	host: 'localhost',
	dialect: 'postgres'
});

// bcrypt
const bcrypt = require('bcrypt');

// Setting up Pug
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// CSS PAGE
app.use(express.static(__dirname + "/../public"));

// Sessions

const session = require('express-session');


app.use(session({
	secret: "This is a secret",
	resave:false,
	saveUninitialized: true
}));

// database

const sequelize = new Sequelize('postgres://account1@localhost/web_shop_application',{
	define: {
		timestamps: false
	}
});

const User = sequelize.define('user',{
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
});

const Clothes = sequelize.define('clothes',{
	type: Sequelize.STRING,
	color: Sequelize.STRING,
	male: Sequelize.STRING,
	female: Sequelize.STRING,
	price: Sequelize.STRING,
});

const Shoes = sequelize.define('shoes',{
	name: Sequelize.STRING,
	url: Sequelize.STRING,
	male: Sequelize.BOOLEAN,
	female: Sequelize.BOOLEAN
});

const Pants = sequelize.define('pants',{
	name: Sequelize.STRING,
	url: Sequelize.STRING,
	male: Sequelize.BOOLEAN,
	female: Sequelize.BOOLEAN
});

const Tshirts = sequelize.define('tshirts',{
	name: Sequelize.STRING,
	url: Sequelize.STRING,
	male: Sequelize.BOOLEAN,
	female: Sequelize.BOOLEAN
});
sequelize.sync({force:true})

//rendering register page
app.get('/',(req,res) => {
	res.render('register')
});

// registering and storing new user in the database
app.post('/register',(req,res) => {

	User.create({
		name: req.body.inputName,
		password: req.body.inputPassword,
		email: req.body.inputEmail
	}).then((user) => {
			req.session.user = user;
			res.redirect('/profile');
	});
});

app.get('/login', (req,res) => {
	res.render('login')
});

// profile PAGE

app.get('/profile',(req,res) => {
  var user = req.session.user
  res.render('profile',{user: user})
});

//creating login

app.post('/login', bodyParser.urlencoded({extended:true}),(req,res) => {

  User.findOne({
    where: {
      email: req.body.inputEmail
    }
  }).then ((user) => {
    if (user !== undefined && req.body.inputPassword == user.password) {
      req.session.user = user;
      res.redirect('/profile');
    } else{
        res.redirect('/login?message=' + encodeURIComponent('Invalid email or password'));
      }

  })
  .catch( error => {
      res.redirect('/login?message=' + encodeURIComponent('Invalid email or password'));
    });
});

// log out

app.get('/logout',(req,res) =>{
  req.session.destroy((err) =>{
    if (err){
      throw (err);
    }
    res.redirect('/?login=' + encodeURIComponent('Logged out successfully'));
  });
});


app.listen(3000, () => {
  console.log('App is working on port 3000');
});
