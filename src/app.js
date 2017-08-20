const express = require('express'); 
const app = express(); 

const bodyParser = require('body-parser'); 
app.use('/', bodyParser.urlencoded({extended:true}));

const nodemailer = require('nodemailer');

// Model Configuration 
const Sequelize = require('sequelize');
const sequelize = new Sequelize('webshopapplication', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
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

// Models

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
		validate: {
			isEmail:true
		}
	},
	password: {
		type: Sequelize.STRING,
		validate: {
			notEmpty:true
		}
	},
	password_confirmation: {
		type: Sequelize.STRING,
		validate: {
			notEmpty:true
		}
	},
},  {
		timestamps:false
	});

const Clothes = sequelize.define('clothes',{
	type: Sequelize.STRING,
	name: Sequelize.STRING,
	color: Sequelize.STRING,
	url: Sequelize.STRING,
	male: Sequelize.BOOLEAN,
	female: Sequelize.BOOLEAN,
	price: Sequelize.INTEGER
},	{
		timestamps:false
	}
);

const Wishlist = sequelize.define('wishlist',{
	type: Sequelize.STRING
},	{
		timestamps:false
	}
);


User.belongsToMany(Clothes, {through: Wishlist});
Clothes.belongsToMany(User, {through: Wishlist});
Clothes.belongsTo(Wishlist);
Wishlist.hasMany(Clothes);

sequelize.sync({force:false});


// Home page 
app.get('/', (req, res) => {
	res.render('index')
});

app.post('/searchengine', (req,res) => {
	var input = req.body.search;

	Clothes.findAll({
		where: {
			type:req.body.search
		}
	})
	.then((selectiontype) => {
		res.render('selection', {selectiontype:selectiontype})
	})
})


// Login page
app.get('/login', (req,res) => {
	res.render('login')
});

// Register page

app.get('/register', (req,res) => {
	res.render('register')
})

// Profile page
app.get('/profile', (req, res) => {
	res.render('profile')
});

// All Clothes

app.get('/allclothes', (req,res) => {
	Clothes.findAll()
	.then((eachItem) => {
		res.render('allclothes', {eachItem: eachItem})
	})
	.catch((err) => {
		console.log(err)
	});
});

// Contact Page 
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

// Selection

app.get('/selection', (req,res) => {
	res.render('selection')
})

// SERVER

const server = app.listen(3000, () => {
	console.log("Blog app listening on port: " + server.address().port)
});
