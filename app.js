//express
const express = require('express');
const app = express();
const port = 8080

//Handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// require bodyParser
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Database
var mongojs = require('mongojs');
//Used the create ObjectID to search the _id field
var ObjectId = require('mongojs').ObjectID;
var db = mongojs('octagon', ['stores', 'parts']);
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginapp');

var routes = require('./routes/index');
var users = require('./routes/users');

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
}

// require bodyParser
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// Register
app.get('/register', ensureAuthenticated, function(req, res){
    res.render('register');
});

// Login
app.get('/login', function(req, res){
    res.render('login');
});

var User = require('./models/user');

app.get('/admin', function(req, res){
	User.getUserByUsername("admin", function(err, user){

		if(user == null){
			var newUser = new User({
            	name: 'admin',
            	email: 'mitchell.rian.smith@gmail.com',
            	username: 'admin',
            	password: '7789971315'
        	});

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });
		}

		res.render('home');
	});

	
});

// Register User
app.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    } else {
        var newUser = new User({
            name: name,
            email:email,
            username: username,
            password: password
        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/login');
    }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
        return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
            return done(null, user);
        } else {
            return done(null, false, {message: 'Invalid password'});
        }
    });
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

app.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/login');
});


app.get('/', function(req, res){
	res.render('home');
});

app.get('/store_add', ensureAuthenticated, function(req, res){
	res.render('store_add');
});

app.post('/store_add', function(req, res){
	db.stores.find({"storeNumber":req.body.storeNumber}, function(errFind, docsFind){
		if(docsFind.length == 0){
			db.stores.insert(req.body, function(err, docs){
				if(err){
					console.log(err);
				}
				else{
					res.end("added");
				}
			});
		} else {
			res.end("!added");
		}
	});
});

app.put('/store_edit', function(req, res){
	db.stores.update({'storeNumber': req.body.storeNumber}, {$set: req.body}, function(errUpdate, resUpdate){
		if(resUpdate.n == 1){
			res.end("updated");
		}else {
			res.end("!updated");
		}
	});
});

app.get('/stores_view', ensureAuthenticated, function(req, res){
	res.render('stores_view');
});

app.get('/stores_list', function(req, res){
	db.stores.find({}, { 'storeNumber': 1, 'address.streetAddress': 1 }, function(errFind, docsFind){
		res.json(docsFind.sort( function(a,b){
			return a.storeNumber.localeCompare(b.storeNumber);
		}));
	});
});

app.get('/store/:storeNumber', function(req, res){
	//db.stores.find({'storeNumber': req.params.storeNumber}, function(errFind,docsFind){
	db.stores.find(req.params, function(errFind,docsFind){
		res.json(docsFind[0]);
	});
});

app.get('/part_add', ensureAuthenticated,  function(req, res){
	res.render('part_add');
});

app.post('/part_add', function(req, res){
	db.parts.find({"partNumber": req.body.partNumber}, function(errFind, docsFind){
		if(docsFind.length == 0){
			db.parts.insert(req.body, function(err, docs){
				if(err){
					console.log(err);
				}
				else{
					res.end("added");
				}
			})
		} else {
			res.end("!added");
		}
	});
});

app.get('/parts_view', ensureAuthenticated,  function(req, res){
	res.render('parts_view');
});
app.get('/parts_list', function(req, res){
	db.parts.find({}, { 'partNumber': 1, 'partDescription':1 }, function(errFind, docsFind){
		res.json(docsFind.sort( function(a,b){
			return a.partNumber.localeCompare(b.partNumber);
		}));
	});
});

app.get('/part/:partNumber', function(req, res){
	db.parts.find(req.params, function(errFind,docsFind){
		res.json(docsFind[0]);
	});
});

app.put('/part_edit', function(req, res){
	db.parts.update({'partNumber': req.body.partNumber}, {$set: req.body}, function(errUpdate, resUpdate){
		if(resUpdate.n == 1){
			res.end("updated");
		}else {
			res.end("!updated");
		}
	});
});

function sortJSONArray(prop){
	return function(a, b) {  
        if (a[prop] > b[prop]) {  
            return 1;  
        } else if (a[prop] < b[prop]) {  
            return -1;  
        }  
        return 0;  
    }
}
