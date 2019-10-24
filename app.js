//express
const express = require('express');
const app = express();
const port = 8080

//Handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

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
var db = mongojs('octagon', ['stores']);
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginapp');

var formidable = require('formidable');

// require bodyParser
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/', function(req, res){
	res.render('home');
});

app.get('/store_add', function(req, res){
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

app.get('/stores_view', function(req, res){
	res.render('stores_view');
});

app.get('/stores_list', function(req, res){
	db.stores.find({}, { 'storeNumber': 1, 'address.streetAddress': 1 }, function(errFind, docsFind){
		res.json(docsFind);
	});
});

app.get('/store/:storeNumber', function(req, res){
	db.stores.find({'storeNumber': req.params.storeNumber}, function(errFind,docsFind){
		res.json(docsFind[0]);
	});
});



