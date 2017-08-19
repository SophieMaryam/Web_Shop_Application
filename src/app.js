const express = require('express'); 
const app = express(); 

const bodyParser = require('body-parser'); 
app.use('/', bodyParser.urlencoded({extended:true}));

const nodemailer = require('nodemailer');

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


// Home page 

app.get('/', (req, res) => {
	res.render('index')
});

app.post('/searchengine', (req,res) => {
	var input = req.body.search;

	Clothes.findOne({
		where: {
			type:req.body.search
		}
	})
	.then((clothestype) => {
		res.render('')
	})
})

app.get('/login', (req,res) => {
	res.render('login')
});

app.get('/profile', (req, res) => {
	res.render('profile')
	// var user = req.session.user;
	// if(!user){
	// 	res.redirect('/?message=' + encodeURIComponent("Please log in."));
	// }

	// if(user === undefined){
	// 	res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	// } else {
	// 	res.render('profile', {
	// 		user:user
	// 	});
	// }
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


// SERVER

const server = app.listen(3000, () => {
	console.log("Blog app listening on port: " + server.address().port)
});
