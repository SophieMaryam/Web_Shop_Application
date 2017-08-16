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


// Contact Page 
app.get('/contact', (req,res) => {
	res.render('contact')
});


// Nodemailer

app.post('/email', (req,res) => {
	var sendingto = req.body.to,
	sentfrom = req.body.from,
	subject = req.body.subject
	emailtext = req.body.text;


	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		service: 'Gmail',
		auth: {
			user: 'sophiemaryam@gmail.com',
			pass: ''
		},
		tls: {
			rejectUnauthorized:false
		}
	});

	let mailOptions = {
		from:sendingto, 
		to: sentfrom,
		subject: subject,
		text: req.body.text,
		html: '<b>Hello</b>'
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			throw err
		}
		console.log('Message %s sent: %s');
		console.log(info);
	});

}) 




























// app.use('/sayHello', router);
// router.post('/email', handleSayHello);
// function handleSayHelo(req,res){
// 	var transporter = nodemailer.createTransport){
// 	server: 'Gmail',
// 	auth: {
// 		user: 'sophiemaryam@gmail.com',
// 		pass: '3muscatteers'
// 	}
// }
// }




// SERVER

// const server = app.listen(3000, () => {
// 	console.log("Blog app listening on port: " + server.address().port)
// });
