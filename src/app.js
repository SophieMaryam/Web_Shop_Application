const express = require('express'); 
const app = express(); 

const bodyParser = require('body-parser'); 
app.use('/', bodyParser.urlencoded({extended:true}));

const nodemailer = require('nodemailer');

// Model Configuration 
const Sequelize = require('sequelize');
const sequelize = new Sequelize('', , , {
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


// Models

sequelize.sync({force:false});

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
