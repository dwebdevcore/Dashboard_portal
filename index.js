/** Hi-Efficiency Server file **/
var cluster = require('cluster');

/*if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {*/
	/** This dotenv module is used to seperate common things in this file **/
	var dotenv = require('dotenv');
	dotenv.load();

	/** Require express modules and create server **/
	var express = require('express');
	var app = express();
	var server = require('http').createServer(app);

	/** Set Port **/
	var port = process.env.port || 2405;

	/** This module work as middleware to parse all request **/
	var bodyParser = require('body-parser');

	/** This module word as ORM for database **/
	var mongoose = require('mongoose');

	/** This module is used to handle asynchrous behavious of nodejs i.e avoiding callback hell **/
	var waterfall = require('async-waterfall');

	/* async is powerful functions for working with asynchronous JavaScript*/
	var async = require("async")

	/** This module is used to handle validation **/
	var validator = require('validator');

	/** require password-hash module for create secure password **/
	var passwordHash = require('password-hash');

	/** require nodemailer module to send emails **/
	var nodemailer = require('nodemailer');

	/** require nodemailer module to send mail smtp transport **/
	var smtpTransport = require('nodemailer-smtp-transport'); // 

	/** require express-session to manage session on server  **/
	var ExpressSession = require('express-session');

	/** require jwt-simple to authenticate the different routes  **/
	var jwt = require('jwt-simple');

	/** require captchapng to generate unique capctha for its users **/
	var captchapng = require('captchapng');

	/** require request module to trigger  third party url **/
	var request = require('request');

	/** require connect-flash module to define a flash message and render it without redirecting the request **/
	var flash = require('connect-flash');

	/** require underscore module to provides support for the usual functional suspects (each, map, reduce, filter...) without extending any core JavaScript objects **/
	var _ = require('underscore');

	/** require base64-img module to Convert image file to image base64 data **/
	var base64Img = require('base64-img');

	/** require to locate the path  **/
	var path = require("path");

	/** require encryptor module to encrypt or decrypt string **/
	var encryptor = require('simple-encryptor')(process.env.key);

	/** require multer module to upload file **/
	var multer = require('multer');

	/** require passcode to generate one time password **/
	var passcode = require("passcode");

	/** require fs module to handle file(s) **/
	var fs = require('fs');

	/** Set session with cookies  **/
	var CookieParser = require('cookie-parser');
	var cookieParser = CookieParser(process.env.key);

	app.use(cookieParser);
	app.use(ExpressSession({
		secret : process.env.key,
	 	resave: false,
	 	saveUninitialized : true,
	}))

	/** Database connection **/
	mongoose.Promise = global.Promise;
	mongoose.connect(process.env.database);

	/** Require all models **/
	var user = require('./model/user');
	var team = require('./model/team');
	var game = require('./model/game');
	var tournament = require('./model/tournament');



	var allowCrossDomain = function(req, res, next) {
	    res.header('Access-Control-Allow-Origin', '*');
	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	    next();
	    
	};
	app.use(allowCrossDomain);


	/* get all data/stuff of the body (POST) parameters */
	/* parse application/json */
	app.use(bodyParser.json());

	/* parse application/vnd.api+json as json */ 
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

	/* parse application/x-www-form-urlencoded */
	app.use(bodyParser.urlencoded({ extended: true })); 



	/** Making public folder to be accebile globally **/
	app.use(express.static(__dirname + '/public')); 

	/** Default routes for admin login **/
	require('./routes/Admin/default_routes')(app, path);

	/** Function to send custom message **/
	function customValidationMsg(code, property_name, error, message, data, res)
	{
		var meta = { code: Number, data_property_name: String, error: String, message: String };
		meta.code = code;
        meta.data_property_name = property_name;
        meta.error = "error", error;
        meta.message = message;

        var json = JSON.stringify({
            'meta': meta,
            'data': data
        });
        res.send(json);
	}

	/**Common Code to upload Image files **/
	var upload = multer({ dest: 'public/uploads/' });
	app.post('/imageupload', upload.single('image'), function(req, res){
		var filedata = req.file;
		if(filedata)
		{
			if(req.body.oldimage)
			{
				fs.unlink('public/uploads/'+req.body.oldimage, function(err, response){
				});
			}
			var result = {status : 1, 'data' : filedata.filename,  error:'', message : ''};
			var json_arr  = {data: result, success: true};
			res.contentType('application/json');
			res.end(JSON.stringify(json_arr));
		}
		else
		{
			var result = {status : 0, 'data' : '',  error:'', message : 'Unable to upload file.'};
			var json_arr  = {data: result, success: false};
			res.contentType('application/json');
			res.end(JSON.stringify(json_arr));
		}
	})

	/************************************************************ API Routes ***************************************************************************/
	/**Code related to signup/login/verification which accept data as json in request and return response accordingly **/
	require('./routes/Api/auth')(app, user, tournament, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, encryptor, mongoose, fs, path, jwt, captchapng, request);

	/**Code related to team/game/tournaments which accept data as json in request and return response accordingly **/
	require('./routes/Api/game')(app, user, team, game, tournament, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, encryptor, mongoose, fs, path, jwt, captchapng, request, flash, _, base64Img);

	/***************************************************************************************************************************************************/

	/************************************************************ Admin Routes ***************************************************************************/

	require('./routes/Admin/login')(app, user, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode);
	require('./routes/Admin/team')(app, user, team, multer, path, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode);
	require('./routes/Admin/game')(app, user, team, game, multer, path, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode);
	require('./routes/Admin/tournament')(app, user, team, game, tournament, multer, path, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode, _);


	/*****************************************************************************************************************************************************/


	server.listen(port, function  (argument) {
		console.log('Server listening on : ' + port);  	 
	})
//}