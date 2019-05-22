exports = module.exports = function(app, user, tournament, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, encryptor, mongoose, fs, path, jwt, captchapng, request){
	var response = '';
	var meta = { code: Number, data_property_name: String, error: String, message: String };
	var data = { user_id : String , user_name : String , user_profile_pic_url : String , user_country_flag_image_url : String, 
	               access_token : String };
	var _deviceID = '';
	var _platform = '';
	var _country = '';

	/** Code to user as guest **/
	app.post('/authenticate_as_guest', function(req, res){

		_deviceID = req.body.DeviceToken ? req.body.DeviceToken : null;
	    _platform = req.body.Platform ? req.body.Platform : null;
	  	_country = req.body.country ? req.body.country : 'Default';

	  	user.getUsersByDeviceId(_deviceID, function(error, result){

	  		if(error)
	  		{
	  			customValidationMsg(500, 'error', error,'Getting error in /company (QueryForComapany.js) in searching DB', '', res);
	  		}
	  		else if((result == null || result == '') && !req.body.captchaVerified)
	  		{
				var _captchaValue = parseInt(Math.random()*9000+1000);
				console.log("> New device. Sending Captcha - ",_captchaValue);
				var _captcha = new captchapng(80,30,_captchaValue);
				_captcha.color(0, 0, 0, 0);
				_captcha.color(80, 80, 80, 255);
				var _captchaImg = _captcha.getBase64();

				var _imgbase64 = "data:image/png;base64,"+_captchaImg;
				meta.code = 200;
		        meta.data_property_name = 'captcha';
		        meta.error = "";
		        meta.message = '';

		        var json = JSON.stringify({
		            'meta': meta,
		            'data': { 
					  captchaValue: _captchaValue, 
					  captchaImage: _imgbase64
					}
		        });
		        res.send(json);			

	  		}
	  		else if((result == null || result == '') && req.body.captchaVerified)
	  		{
		      console.log("> CaptchaVerified TRUE : Register User as a guest ");
		      guestUserAuthentication( 200, _platform, _deviceID , (response)=>{
		        res.send(response);
		      })
		    }
		    else if(result != "" && result != null &&  result.length > 0)
		  	{
		  		if(result[0].user_is_guest )
		  		{
		  			//guestUserAuthentication( 201 );
		  			console.log("> Deveice registered as guest.");
		        	meta.code = 201;
		  			meta.data_property_name = "data";
		  			meta.error = "";
		  		}
		  		else 
		  		{
		        	console.log("> Device registered as user.");
		  			meta.code = 409;
		    	  	meta.data_property_name = "data";
		  			meta.error = "This device already had a registered user";
		  		}

	      		var _token = jwt.encode({ user_id : result[0]._id , user_role : "guest" }, process.env.secret);

	  			var data = { user_id : String , user_name : String , user_profile_pic_url : String , user_country_flag_image_url : String, user_login_as: String};
		  		data._id = result[0]._id;
		  		data.UserId = result[0]._id;
		  		data.user_name = result[0].name;
		  		data.user_profile_pic_url = result[0].image;
		  		data.user_country_flag_image_url = result[0].country_flag_image_url;
		  		data.user_login_as =  result[0].login_as
		        data.AccessToken = _token;

		        var json = JSON.stringify({
		            'meta': meta,
		            'data': data
		        });
		        res.send(json);	
		  	}
	  	})
	})


	function guestUserAuthentication( code, platform, device_id, callback ) {

		var _name = "Guest" + generateUUID();
		console.log("the guest name is " + _name );
		var _userProfileImagePath = "http://someurl.com/default_user_img.png";
		var _userCountryFlagImagePath = "http://someurl.com/in.png";
		var _collection = new user();
	  	_collection.name = _name;
	  	_collection.profile_pic_url = _userProfileImagePath; //"http://someurl.com/default_user_img.png";
	    _collection.country_flag_image_url = _userCountryFlagImagePath ; //"http://someurl.com/in.png";
	    _collection.user_type = 'user';
	    _collection.login_as = 'guest';
	    _collection.device_type.push('web');
	    _collection.device_id.push(device_id);
	    _collection.device_token.push(device_id);

		user.createData(_collection, function (err, result){
	  		if(err)
	  		{
	  			console.log("GETTING ERROR IN /creating TiltUser and saving it in DB" + err );
		        meta.code = 500;
		        meta.data_property_name = "data";
		        meta.error = "Getting error in guestUserAuthentication: " + err;
		  			var response = JSON.stringify({
		          "meta" : meta,
		          "data" : ""
		        });
		        callback(response);
	  		}
	  		else
	  		{
	  			var _token = jwt.encode({ user_id : _collection._id , user_role : "guest" }, process.env.secret);
	  			console.log("Tilt user creation and save to db is successful",result);
	  			meta.code = code;
	  			meta.data_property_name = "data";
	  			meta.error = "";
	  			data.UserId = _collection._id;
	  			data._id = _collection._id;
	  			data.user_name = _collection.name;
	  			data.user_profile_pic_url = _collection.profile_pic_url;
	  			data.user_country_flag_image_url = _collection.country_flag_image_url;
	  			data.AccessToken = _token;

	  			var response = JSON.stringify({
	  				"meta" : meta,
	  				"data" : data
	  			});
	  			callback(response);
	  		}
		});

	}

	function generateUUID() {
	    var d = new Date().getTime();
	    var uuid = '2xx'.replace(/[xy]/g,function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	    });
	    return uuid.toUpperCase();
	}

/***********************************************************************************************************************************/
/** Code to add/update user by Facebook **/
app.post('/authenticate_with_facebook', function(req, res, next)
 {
  	var _UserId = req.body.UserId ? req.body.UserId : "";
  	_deviceID = req.body.DeviceToken ? req.body.DeviceToken : null;
    _platform = req.body.Platform ? req.body.Platform : null;

    console.log('req.body.Photo'+req.body.Photo);

    console.log('-->>>>'+_UserId);
	if(req.body.Email)
  	{
  		waterfall([function(callback){
  			user.getuserbyemail(req.body.Email,  function(err, Userresponse){

  				if(Userresponse != null)
  				{
  					callback(err, Userresponse, 'userold');
  				}
  				else if(_UserId)
  				{
  					user.getUserById(mongoose.Types.ObjectId(_UserId),  function(err, Userresponse){
  						if(Userresponse != null)
  						{
  							callback(err, Userresponse, 'userold');
  						}
  					})
  				}
  				else
  				{
  					var _collection = new user();
				  	_collection.name =  req.body.FirstName + ' '+(req.body.LastName ? req.body.LastName : '');
				  	_collection.image = req.body.Photo ? req.body.Photo : (process.env.BasePath + '/uploads/default.png'); //"http://someurl.com/default_user_img.png";
				    _collection.country_flag_image_url = req.body.userCountryFlagImagePath ? req.body.userCountryFlagImagePath : '' ; //"http://someurl.com/in.png";
				    _collection.user_type = 'user';
				    _collection.login_as = 'fb';
				    _collection.fb_id = req.body.FacebookId;
				    _collection.email = req.body.Email ? req.body.Email : '';
				    _collection.device_type.push('web');
				    _collection.device_id.push(_deviceID);
				    _collection.device_token.push(_deviceID);
				    user.createData(_collection, function (err, result){
				    	
				    	callback(err, _collection._id, 'usernew');
				    })
  				}
  			})
  		},function(Userresponse, usertype, callback){

  			if(usertype == 'userold')
  			{
				if(Userresponse != null && Object.keys(Userresponse).length)
				{
					var _collection = {};
				  	_collection.name = req.body.FirstName + ' '+(req.body.LastName ? req.body.LastName : '');
				  	_collection.image = req.body.Photo ? req.body.Photo : (process.env.BasePath + '/uploads/default.png'); //"http://someurl.com/default_user_img.png";
				    _collection.login_as = 'fb';
				    _collection.fb_id = req.body.FacebookId;
				    _collection.email = req.body.Email ? req.body.Email : '';

				    if(Userresponse.email)
				    {
				    	user.updateUserByEmail(req.body.Email, _deviceID, _collection,  function(err, response){
			    			callback(err, Userresponse, 'email', 'update');
			    		})
				    }
				    else
				    {
				    	user.update_user(mongoose.Types.ObjectId(_UserId), _deviceID, _collection,  function(err, response){

				    		console.log('response===>'+ JSON.stringify(response));
			    			callback(err, Userresponse, 'userid', 'update');
			    		})
				    }

				    
				}
				else if(_UserId)
				{
					console.log('userID' + _UserId);
					
					var _collection = {};
				  	_collection.name = req.body.FirstName + ' '+(req.body.LastName ? req.body.LastName : '');
				  	_collection.image = req.body.Photo ? req.body.Photo : (process.env.BasePath + '/uploads/default.png'); //"http://someurl.com/default_user_img.png";
				    _collection.login_as = 'fb';
				    _collection.fb_id = req.body.FacebookId;
				    _collection.email = req.body.Email ? req.body.Email : '';

				    user.update_user(_UserId, _deviceID, _collection,  function(err, response){
				    	console.log('response' + response);
			    		callback(err, Userresponse, _UserId, 'update');
			    	})
				}
  			}
  			else
  			{

  				user.getUserById(Userresponse, function(err, response){
  					callback(err, response, response._id, 'create');
  				})
  			}
			},
			function(Userresponse, identityDetail, type, callback )
			{
				if(type == 'update')
				{
					if(identityDetail == 'email')
					{
						user.getuserbyemail(req.body.Email,  function(err, response){
							callback(err, Userresponse, response, type);
						})
					}
					else if( identityDetail == 'userid')
					{
						user.getUserById(mongoose.Types.ObjectId(_UserId), function(err, response){
		  					callback(err, Userresponse, response, type);
		  				})
					}
				}
				else
				{
					callback(null, Userresponse, identityDetail, type)
				}
			},
			function(Userresponse, Updateresponse, type, callback){
  				var userID; 
  				console.log('Updateresponse===>'+ JSON.stringify(Updateresponse));
  				if(type == 'create')
  				{
  					userID = Updateresponse;
  				}
  				else
  				{
  					userID = Updateresponse._id;
  				}

  				user.getUserById(userID, function(err, response){

  					console.log('UserData-->' + response);
  					callback(err, Userresponse, Updateresponse, type, response);
  				})
  			},function(Userresponse, Updateresponse, type, UserData, callback){

  				if(type == 'update')
  				{
  					console.log(_UserId + '=='+ Updateresponse._id);
  					if(_UserId && (_UserId != Updateresponse._id))
  					{
  						tournament.updatePlayer(_UserId, Updateresponse._id,  function(err, response){
  							callback(err, Userresponse, Updateresponse, type, UserData, 'SCOREUPDATE');
  						})
  					}
  					else
  					{
  						callback(null, Userresponse, Updateresponse, type, UserData, 'NOTEXIST');
  					}
  				}
  				else
  				{
  					callback(null, Userresponse, Updateresponse, type, UserData, 'NOTEXIST');
  				}
  			},
  			function(Userresponse, Updateresponse, type, UserData, mode, callback){
  				if(mode == 'SCOREUPDATE')
  				{
  					user.removeUserById(_UserId, function(err, response){
  						callback(err,Userresponse, Updateresponse, type, UserData, mode);
  					})
  				}
  				else
  				{
  					callback(null, Userresponse, Updateresponse, type, UserData, mode);
  				}
  			}], function(err, Userresponse, Updateresponse, type, UserData, mode){

  			if(err)
  			{
  				console.log("Getting some error while updating user." + err);
	      		customValidationMsg(500, "error", err, "Error getting updating User" , '', res);
  			}
  			else
  			{
  				meta.code = 201;
		        meta.data_property_name = 'data';
		        meta.error = "";
		        meta.message = '';

		        var json = JSON.stringify({
		            'meta': meta,
		            'data': UserData
		        });
		        res.send(json);	
  			}
  		})
    }  	
 })
/***********************************************************************************************************************************/
/** Code to get user details**/
app.get('/get_user_details', function(req, res){

	var deviceID = req.query.deviceID ? req.query.deviceID : 'Default';
	user.getUserByDeviceId(deviceID, function(err, response){
		if(err)
		{
			console.log("Getting error in findng email /authenticate with email after password match sucess in searching DB" + err);
			customValidationMsg(500, "error", err, "Getting error in findng device id in DB" , '', res);
		}
		else if(response != null && Object.keys(response).length > 0)
		{
			//console.log(">>> user found in with device ID & tiltUser.",response);
			meta.code = 201;
	        meta.data_property_name = 'data';
	        meta.error = "";
	        meta.message = 'Device Found';

	        var json = JSON.stringify({
	            'meta': meta,
	            'data': response
	        });
	        res.send(json);	
	  	}
	  	else
	  	{
			console.log("in last ");
			customValidationMsg(401, "new user", '', "Device ID is new for the system" , '', res);	
		}
	})

})
/***********************************************************************************************************************************/
}
