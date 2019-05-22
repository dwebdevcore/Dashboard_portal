exports = module.exports = function(app, user, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode){
	
	/** Code to authenticate and login **/
	app.post('/clientLogin', function(req, res){


	 	if(validator.isEmpty(req.body.email))
		{
			customValidationMsg('Email is required.', res);
		}
		else if(!validator.isEmail(req.body.email))
		{
			customValidationMsg('Invalid Email.', res);
		}
		else if(validator.isEmpty(req.body.password))
		{
			customValidationMsg('Password is required.', res);
		}
		else 
		{
			user.userCountByEmail(req.body.email, function(err, UserCount){
				if(err)
				{
					var json_arr  = {data: {status : 0, 'email' : req.body.email, message : 'Due to some technichal error, It was unable to logged-in.'}, status:'failed'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
				else if (UserCount > 0)
				{
					user.getuserbyemail(req.body.email, function(err, data)
					{
						if(err)
						{
							var json_arr  = {data: {status : 0, 'email' : req.body.email, message : 'Due to some technichal error, It was unable to logged-in.'}, status:'failed'};
							res.contentType('application/json');
							res.end(JSON.stringify(json_arr));
						}
						else if(data)
						{	var hashedPassword = data.password;
							if(passwordHash.verify(req.body.password, hashedPassword))
							{
								req.session.email = req.body.email;
								req.session.token = jwt.encode({email : req.body.email}, process.env.key);
								var json_arr  = {data: {status : 1, 'email' : req.body.email, _id : data._id, token : req.session.token, message : 'You have successfully logged-in.' }, status:'success'};
								res.contentType('application/json');
								res.end(JSON.stringify(json_arr));
							}
							else
							{
								var json_arr  = {data: {status : 0, 'email' : req.body.email, message : 'Invalid Login Credentials.'}, status:'failed'};
								res.contentType('application/json');
								res.end(JSON.stringify(json_arr));
							}
						}
						else
						{
							var json_arr  = {data: {status : 0, 'email' : req.body.email, message : 'Invalid Login Credentials.'}, status:'failed'};
							res.contentType('application/json');
							res.end(JSON.stringify(json_arr));
						}

					})
				}
				else{
					if(validator.isEmpty(req.body.otp))
					{
					 var otp = passcode.hotp({ secret: req.body.email, counter: 2505 });
					  var transporter = nodemailer.createTransport({
					    service: process.env.service,
					    auth: {
					      user: process.env.username,
					      pass: process.env.pass
					      }
					    });

					    var mailOptions = {
					      from : process.env.username,
					      to: req.body.email,
					      subject: 'Welcome to TiLT',
					      text: 'Your One time password is : ' + otp
					    };
					    // send mail with defined transport object 
					    transporter.sendMail(mailOptions, function(error, info){
					    if(error){
					        console.log("error in sending mail " + error);
					        error = error;
					        var json_arr  = {data: {status : 0, 'email' : req.body.email, message : 'Invalid Login Credentials.'}, status:'failed'};
							res.contentType('application/json');
							res.end(JSON.stringify(json_arr));
					    }else {
					      	console.log('Message sent: ' + info.response);
					      	var json_arr  = {data: {status : 1, 'email' : req.body.email, otp : 'sent', token : '', message : 'Otp has been sent to your email address.' }, status:'success'};
							res.contentType('application/json');
							res.end(JSON.stringify(json_arr));
					    }
					  });
					}
					else
					{
						console.log(req.body.email);
						console.log(req.body.otp);
						var ok = passcode.hotp.verify({
						    secret: req.body.email,
						    token: req.body.otp,
						    counter: 2505
					    });
					    if(ok)
					    {
					    	var hashpassword = passwordHash.generate(req.body.password);
					    	var Userdata = new user({
					    		email : req.body.email,
					    		password : hashpassword,
					    		is_verified : 'yes',
					    		otp : req.body.otp,
					    		created_on : new Date()
					    	})
					    	user.createData(Userdata, function(err, response){
					    		if(err)
					    		{
					    			var json_arr  = {data: {status : 0, 'email' : req.body.email, message : 'Due to some technichal error, It was unable to logged-in.'}, status:'failed'};
									res.contentType('application/json');
									res.end(JSON.stringify(json_arr));
					    		}
					    		else
					    		{
					    			req.session.email = req.body.email;
									req.session.token = jwt.encode({email : req.body.email}, process.env.key);
									var json_arr  = {data: {status : 1, 'email' : req.body.email, _id : Userdata._id, token : req.session.token, message : 'You have successfully logged-in.' }, status:'success'};
									res.contentType('application/json');
									res.end(JSON.stringify(json_arr));
					    		}
					    	})
					    }
					    else
					    {
					    	var json_arr  = {data: {status : 0, 'email' : '', message : 'OTP not matched.'}, status:'failed'};
							res.contentType('application/json');
							res.end(JSON.stringify(json_arr));
					    }
					}
				}
			})
		}
	})

/***********************************************************************************************************************************/
	/** Code to check authentication **/
	app.post('/isauthentic', function(req, res){
		
		if(req.session.token == req.body.token && req.session.email)
		{
			var json_arr  = {status:true};
			res.contentType('application/json');
			res.end(JSON.stringify(json_arr));
		}
		else
		{
			var json_arr  = {status:false};
			res.contentType('application/json');
			res.end(JSON.stringify(json_arr));
		}
	})

/***********************************************************************************************************************************/
	/** Code to logout user **/
	app.post('/logout', function(req, res){
		req.session.destroy();
		if(!req.session)
		{
			var json_arr  = {success:true};
			res.contentType('application/json');
			res.end(JSON.stringify(json_arr));
		}
		else
		{
			var json_arr  = {success:false};
			res.contentType('application/json');
			res.end(JSON.stringify(json_arr));
		}
	})
/***********************************************************************************************************************************/

	/** Code to send email by Admin **/

	app.post('/sendMail', function(req, res){
		var msgbody = req.body.message;
		var transporter = nodemailer.createTransport(smtpTransport({
	      service: process.env.service,
	      auth: {
	          	user: process.env.username,
				pass: process.env.pass
	      }
	   }));

		//Send Mail Start
		var mailOptions = {
			from: process.env.username, // sender address
			to: req.body.email,//define the receiver of the email
			subject: req.body.subject, // Subject line. define the message to be sent. Each line should be separated with \n
			html: msgbody// html body
		};
		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log('Error While sending email : '+ error);
				var json_arr  = {success:false, error : error, message:'Due to some techincal error email not sent'};
				res.contentType('application/json');
				res.end(JSON.stringify(json_arr));
			}else{
				var json_arr  = {success:true, error : error, message:'Email Sent.'};
				res.contentType('application/json');
				res.end(JSON.stringify(json_arr));
				console.log('Email sent: ' + info.response);
			}
		});
	})

	/***********************************************************************************************************************************/

}