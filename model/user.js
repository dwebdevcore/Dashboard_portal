var mongoose = require('mongoose');
/*mongoose.set('debug', true);
*/
var userSchema  = mongoose.Schema({
	name					: { type : String, default : ''},
	email 					: { type : String, default : ''},
	image 					: { type : String, default : '' },
	fb_id 					: { type : String, default : '' },
	gplus_id 				: { type : String, default : '' },
	twitter_id 				: { type : String, default : '' },
	country_flag_image_url 	: { type : String, default : '' },
	instagram_id 			: { type : String, default : '' },
	linked_id 				: { type : String, default : '' },
	password 				: { type : String, default : '' },
	user_type 				: { type : String, enum : ['user', 'client'], default : 'client' },
	login_as 				: { type : String, enum : ['guest', 'fb', 'email'], default : 'email' },
	is_verified 			: { type : String, enum : ['no', 'yes'], default : 'yes' },
  status        			: { type : String, enum : ['active', 'blocked'], default : 'active' },
	otp 		    		: { type : String, default : '' },
	device_type  			: [{ type : String, default : 'web' }],
	device_id 				: [{ type : String, default : '' }],
	device_token 			: [{ type : String, default : '' }],
	created_on 				: { type : Date},
});

var User = module.exports = mongoose.model('User', userSchema); 

module.exports.createData = function(userData, callback){
	userData.save(function(err){
		if(err){
			callback(err);
		}
		else
		{
			callback(null, 'success');
		}
	})
}

module.exports.update_user = function(id, _deviceid, json, callback){

   	User.update({ _id: mongoose.Types.ObjectId(id)},{$set : {name :json.name, image : json.image, login_as : json.login_as, email : json.email, $push: {device_id : _deviceid}, $push: {device_token : _deviceid}, $push: {device_type : 'web'}}}, {new: true})
   	.exec(function(err, data){
    	 if(err){
          callback(err);
        }else{
          callback(null, data);
        } 
    });
  
}


module.exports.updateUserByEmail = function(email, _deviceid, json, callback){
    User.update({ email: email},{$set : {name :json.name, image : json.image, login_as : json.login_as, email : json.email, $push: {device_id : _deviceid}, $push: {device_token : _deviceid}, $push: {device_type : 'web'}}}, {new: true})
    .exec(function(err, data){
       if(err){
          callback(err);
        }else{
          callback(null, data);
        } 
    });
  
}

 
module.exports.userCountByEmail = function(email, callback){
  User.count({email : email}).exec(function(err, count){
    if(err){
      callback(err);
    }
    else
    {
      callback(null, count);
    }
  })
}

module.exports.getuserbyemail = function(email, callback){
  User.findOne({email : email}).exec(function(err, count){
    if(err){
      callback(err);
    }
    else
    {
      callback(null, count);
    }
  })
}

module.exports.userCountById = function(id, callback){
  User.count({_id : id}).exec(function(err, count){
    if(err){
      callback(err);
    }
    else
    {
      callback(null, count);
    }
  })
}


module.exports.getUserById = function(ID, callback){
 User.findOne({ _id : ID}).exec(function(err, data){
    if(err){
      callback(err);
    }
    else
    {
      callback(null, data);
    }
  })
}

module.exports.getUserByDeviceId = function(deviceID, callback){
 User.findOne({ device_token : deviceID }).exec(function(err, data){
    if(err){
      callback(err);
    }
    else
    {
      callback(null, data);
    }
  })
}

module.exports.getUsersByDeviceId = function(deviceID, callback){
 User.find({ device_token : { $in: [deviceID] }}).exec(function(err, data){
    if(err){
      callback(err);
    }
    else
    {
      callback(null, data);
    }
  })
}

module.exports.removeUserById = function(id, callback){
  User.remove({'_id' : id}).exec(function(err, data){
    if(err)
    {
      callback(err);
    }
    else
    {
      callback(null, data);
    }
  })
}
