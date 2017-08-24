const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use('/', bodyParser.urlencoded({extended:true}));

const nodemailer = require('nodemailer');
const session = require('express-session');


// Sequelize
const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = new Sequelize('webshopapplication', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: 'localhost',
	dialect: 'postgres',
	storage: './session.postgres',
	define: {
		timestamps: false
	}
});

// Sessions
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


// bcrypt
const bcrypt = require('bcrypt');

// Setting up Pug
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// CSS PAGE
app.use(express.static(__dirname + "/../public"));


// Model Configuration

const User = sequelize.define('user', {
	firstname: {
        type: Sequelize.STRING
    },
    lastname: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique:true,
    },
    password: {
        type: Sequelize.STRING
    },
    password_confirmation: {
		type: Sequelize.STRING
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

// const Wishlist = sequelize.define('wishlist',{
// 	id: {
// 		type: Sequelize.INTEGER,
//         primaryKey: true 
//     },
// 	addToWishList: Sequelize.BOOLEAN
// });


// relationships

// User.hasMany(Clothes);
// Clothes.belongsTo(User);

// Clothes.hasMany(User);

// Wishlist.hasMany(Clothes);
// Wishlist.belongsTo(User);

sequelize.sync({force:false});


// Home page
app.get('/',(req,res) => {
	var user = req.session.user;
	res.render('index', {user:user})
});

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
});


// All Womens Clothes
app.get('/women', (req,res) => {
	var user = req.session.user;
	var boolean = true;
	Clothes.findAll({
		where: {
			female:boolean
		}
	})
	.then((female) => {
		res.render('womenclothes', {female:female, user:user})
	})
});

// All mens clothes
app.get('/men', (req,res) => {
	var user = req.session.user;
	var boolean = true;
	Clothes.findAll({
		where: {
			male:boolean
		}
	})
	.then((male) => {
		res.render('menclothes', {male:male, user:user})
	})
});



// Register
app.get('/register',(req,res) => {
	var user = req.session.user;
	res.render('register', {user:user})
});

app.post('/register', (req,res) => {
	let password = req.body.inputPassword,
	email = req.body.inputEmail,
	firstname = req.body.inputFirstName,
	lastname = req.body.inputLastName,
	pwconfirmation = req.body.passwordconfirmation;
	console.log('pwconfirmation ' + pwconfirmation);
	console.log('password: ' + password);
	
	if(password !== pwconfirmation){
		throw new Error("Password confirmation doesn't match.")
	} else if (password === pwconfirmation) {
		bcrypt.hash(password, 10, (err, hash) => {
			console.log("the hash" + hash)
			if(err){
				throw err;
			}

		User.create({
			firstname:firstname,
			lastname:lastname,
			email: email,
			password: hash,
			password_confirmation: hash
		})
		.then((user) => {
			req.session.user = user;
			res.redirect(`/profile`);
		})
		.catch((err) => {
			console.log("Error" + err);
		})
	
	})
	}
});

// Login 
app.get('/login', (req,res) => {
	var user = req.session.user;
	if(!user){
		res.render('login')
	} else {
		res.redirect(`/profile`)
	}
});


app.post('/login', bodyParser.urlencoded({extended:true}),(req,res) => {

	User.findOne({
	where: {
	  email: req.body.inputEmail
	}
	})
	.then ((user) => {
	console.log('does it reach this??' + user)
	   if(!user){
				res.redirect('/?message=' + encodeURIComponent("Invalid email or password"));
		} else {
			console.log('nnumber 2')
			bcrypt.compare(req.body.inputPassword, user.password, (err, result) => { // first argument is the password the user typed in, and thes second is the one in the database
				if(err){
					console.log(err)
				} else {
					if(result === true){
						req.session.user = user;
						res.redirect(`/profile`)
					} else {
						console.log("Error")
					}
				}
			})
		}
	})
	.catch(function(err){
		console.log("Error" + err)
		res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
	});
}); 

	// log out

app.get('/logout',(req,res) => {
  req.session.destroy((err) => {
    if (err){
      throw (err);
    }
    res.redirect('/?login=' + encodeURIComponent('Logged out successfully'));
  });
});




// Profile

app.get('/profile',(req,res) => {
  var user = req.session.user;

  if(!user){
		res.redirect('/?message=' + encodeURIComponent("Please log in."));
	} else {
		res.render('profile', {user: user});
	// 	Wishlist.findAll({
	// 		where: {
	// 			userId:user.id
	// 		}
	// 	})
	// 	.then((one) => {
	// 		console.log("ayo" + one);
	// 		console.log("ay" + one.clotheId);
	// 		Clothes.findAll({
	// 			where: {
	// 				id:one
	// 			}
	// 		})
	// 		.then((wishlist) => {
	// 			res.render('profile', {user: user, wishlist:wishlist})
	// 		})
	// 	})
	// 	.catch((err) => {
	// 		console.log('Error: ' + err);
	// })
	}
});

app.post('/profilesearchengine', (req,res) => {
    var input = req.body.profilesearchengine;

    Clothes.findAll({
        where: {
            type:input
        }
    })
    .then((selectiontype) => {
        res.render('selection', {selectiontype:selectiontype})
    })
    .catch((err) => {
			console.log('Error: ' + err);
	})
});


// Collection page (All clothes)
app.get('/collection',(req,res) => {
	var user = req.session.user;
	Clothes.findAll()
	.then((eachItem) => {
		res.render('allclothes',{eachItem: eachItem, user:user})
	})
	.catch((err) => {
		console.log(err)
	})
});

// app.post('/icons', (req,res) => {
// 	console.log(req.body.clothesid);
// 	const user = req.session.user;

//     Wishlist.create({
//         addToWishList: req.body.result,
//         userId:user.id,
//         clotheId: req.body.clothesid
//    })
// });

// Search page 
app.get('/search',(req,res) =>{
	res.render('search')
});

app.post('/search', (req,res) => {
    var input = req.body.search;

		Clothes.findAll({
        where: {
            type: input
        }
    })
    .then((selectiontype) => {
			res.render('selection', {selectiontype: selectiontype});
			
	});
});


// Selection Page
app.get('/selection', (req,res) => {
   var user = req.session.user;
    res.render('selection', {user:user})
})


// Contact page
app.get('/contact', (req,res) => {
   	var user = req.session.user;
    res.render('contact', {user:user})
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
  console.log('App is working on port 3001');
});
