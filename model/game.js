var mongoose = require('mongoose');
// mongoose.set('debug', true);

var GameSchema  = mongoose.Schema({
	userid 			: {type : mongoose.Schema.ObjectId, ref: 'User', required : true},
	teamid 			: {type : mongoose.Schema.ObjectId, ref: 'Team', required : true},
	name 			: { type : String, required : true, unique : true },
	logo 		    : { type : String}, 
	description 	: { type : String },
	status 			: { type : String, enum : ['active', 'inactive'], default : 'active' },
	created_on 		: { type : Date, default : Date.now()}
})

var Game = module.exports = mongoose.model('Game', GameSchema); 

module.exports.createData = function(GameData, callback){
	GameData.save(function(err){
		if(err){
			callback(err);
		}
		else
		{
			callback(null, 'success');
		}
	})
}

module.exports.getGameById = function(id, callback){

	Game.findOne({'_id' : id}).lean().exec(function(err, data){
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
module.exports.getGameData = function(id, callback){

	Game.find({'userid' : id}).sort('-created_on').lean().exec(function(err, data){
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

module.exports.getAvailGameList = function(callback){

	Game.find({'is_available' : 'yes'}).sort('-created_on').lean().exec(function(err, data){
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
 
module.exports.getGameByteam = function(teamid, userid, callback){

	Game.find({'teamid' : teamid, 'userid' : userid}).lean().exec(function(err, data){
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


module.exports.removeGameById = function(id, callback){
	Game.remove({'_id' : id}).exec(function(err, data){
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


module.exports.updateGame = function(id, jsondata, callback){
  if(id)
  {
  	
   	Game.findOneAndUpdate({ _id: id},{$set : jsondata}, {new: true})
   	.exec(function(err, data){
    	 if(err){
          callback(err);
        }else{
          callback(null, data);
        } 
    });
  }
}

module.exports.updatefavourite = function(id, jsondata, callback){
  if(id)
  {
  	
   	Game.findOneAndUpdate({ _id: id}, jsondata , {new: true}).lean()
   	.exec(function(err, data){
    	 if(err){
          callback(err);
        }else{
          callback(null, data);
        } 
    });
  }
}

module.exports.getFavGameByUserId = function(id, callback){
	
	Game.find({'likedetail' : id}).lean().select('image title').exec(function(err, data){
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