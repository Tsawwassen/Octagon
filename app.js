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
	console.log("inside get /home");
	res.render('home');
});

app.get('/store_add', function(req, res){
	console.log("insdie get /store_add")
	res.render('store_add');
});

app.post('/store_add', function(req, res){

	db.stores.find({"storeNumber":req.body.storeNumber}, function(errFind, docsFind){
		console.log(docsFind);
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

app.post('/stores_add', function(req, res){
	var form = new formidable.IncomingForm();

	console.log(req.data);

	//form.parse(req, function (err, fields, files) {
	//});
	//console.log(form);
	//console.log(req);

});

app.get('/store_view', function(req, res){
	res.render('stores_view');
});

app.get('/store_edit', function(req, res){
	console.log("insdie get /store_edit")
});

app.get('/store_delete', function(req, res){
	console.log("insdie get /store_delete")
});

