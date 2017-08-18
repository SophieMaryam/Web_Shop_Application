const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use('/', bodyParser.urlencoded({extended:true}));

// Sessions

const session = require('express-session');
// Model Configuration

const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sequelize = new Sequelize('web_shop_application','account1',null,  {
	host: 'localhost',
	dialect: 'postgres',
	storage: './session.postgres',
	define: {
		timestamps: false
	}

});

// bcrypt
const bcrypt = require('bcrypt');

// Setting up Pug
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// CSS PAGE
app.use(express.static(__dirname + "/../public"));



app.use(session({
	secret: "This is a secret",
	resave:false,
	saveUninitialized: true,
	store: new SequelizeStore({
		db: sequelize,
		checkExpirationInterval: 30 * 60 * 1000,
		expiration : 24 * 60 * 60 * 1000
	})
}));


const User = sequelize.define('user',{
	name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
});

const Clothes = sequelize.define('clothes',{
	type: Sequelize.STRING,
	name: Sequelize.STRING,
	color: Sequelize.STRING,
	url: Sequelize.STRING,
	male: Sequelize.BOOLEAN,
	female: Sequelize.BOOLEAN,
	price: Sequelize.INTEGER
});

const Wishlist = sequelize.define('wishlist',{
});

app.post('/searchengine', (req,res) => {
    var input = req.body.search;

    Clothes.findOne({
        where: {
            type:req.body.search
        }
    })
})
// relationships

User.belongsToMany(Clothes, {through: Wishlist});
Clothes.belongsToMany(User, {through: Wishlist});
Clothes.belongsTo(Wishlist);
Wishlist.hasMany(Clothes)

sequelize.sync({force:false});


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

app.get('/search',(req,res) =>{
	res.render('search')
});

app.get('/allclothes',(req,res) => {

	Clothes.findAll()
	.then((eachItem) => {
		res.render('allclothes',{eachItem: eachItem})
	})
	.catch((err) => {
		console.log(err)
	});
});

app.listen(3000, () => {
  console.log('App is working on port 3000');
});
