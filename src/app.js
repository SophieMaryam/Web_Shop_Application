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
