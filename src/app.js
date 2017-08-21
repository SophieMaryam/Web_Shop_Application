const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use('/', bodyParser.urlencoded({extended:true}));

const nodemailer = require('nodemailer');

// Sessions

const session = require('express-session');

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

// Model Configuration

const User = sequelize.define('user',{
	firstname: {
        type: Sequelize.STRING
    },
    lastname: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING,
        unique:true
    },
    email: {
        type: Sequelize.STRING,
        unique:true,
    },
    password: {
        type: Sequelize.STRING,
    },
    password_confirmation: {
        type: Sequelize.STRING,
        validate: {
            notEmpty:true
        }
    }
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
	addToWishList: Sequelize.BOOLEAN
});


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
		firstName: req.body.inputFirstName,
		lastName: req.body.inputLastName,
		email: req.body.inputEmail,
		password: req.body.inputPassword
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

// Collection page (All clothes)
app.get('/collection',(req,res) => {

	Clothes.findAll()
	.then((eachItem) => {
		res.render('allclothes',{eachItem: eachItem})
	})
	.catch((err) => {
		console.log(err)
	})
});

// Search page 
app.get('/search',(req,res) =>{
	res.render('search')
});

app.post('/search', (req,res) => {
    var input = req.body.search;

		Clothes.findOne({
        where: {
            type: input
        }
    })
    .then((clothestype) => {
			res.render('shoes',{clothestype: clothestype});
			
	});
});

// Collection page - wishlist icon
app.post('/icons', (req,res) => {
	console.log(req.body);

    Wishlist.create({
        addToWishList: req.body.result,
        userId:req.session.user.id,
        clotheId: req.body.clothesid
    })
});

// Home page search engine
app.post('/searchengine', (req,res) => {
    var input = req.body.search;

    Clothes.findAll({
        where: {
            type:input
        }
    })
    .then((selectiontype) => {
        res.render('selection', {selectiontype:selectiontype})
    })
})

// Selection Page
app.get('/selection', (req,res) => {
    res.render('selection')
})

// Contact page
app.get('/contact', (req,res) => {
    res.render('contact')
});

  // Nodemailer
  // Note: For nodemailer to work, click on this url https://www.google.com/settings/security/lesssecureapps, turn on the access to third party apps
  // This url will redirect you to your browser settings

app.post('/email', (req,res) => {
	var sentfrom = req.body.from,
	subject = req.body.subject
	emailcontent = req.body.content,
	password = req.body.password;

	console.log('sendingfrom: ' + sentfrom);
	console.log('subject: ' + subject);
	console.log('email content: ' + emailcontent);
	console.log('password: ' + password);


	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		service: 'Gmail',
		auth: {
			user: sentfrom,
			pass: password
		},
		tls: {
			rejectUnauthorized:false
		}
	});

	let mailOptions = {
		from:'sophiemaryam@gmail.com', 
		to: sentfrom,
		subject: subject,
		text: emailcontent,
		html: emailcontent
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			throw err
		}
		console.log('Message %s sent: %s');
		console.log('info' + info);
	})

}) 

// Server
app.listen(3001, () => {
  console.log('App is working on port 3000');
});
