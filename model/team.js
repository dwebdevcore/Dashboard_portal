var mongoose = require('mongoose');
// mongoose.set('debug', true);

var TeamSchema  = mongoose.Schema({
	userid 			: {type : mongoose.Schema.ObjectId, ref: 'User', required : true},
	name 			: { type : String, required : true, unique : true },
	logo 		    : { type : String}, 
	description 	: { type : String },
	status 			: { type : String, enum : ['active', 'inactive'], default : 'active' },
	created_on 		: { type : Date, default : Date.now()}
})

var Team = module.exports = mongoose.model('Team', TeamSchema); 

module.exports.createData = function(TeamData, callback){
	TeamData.save(function(err){
		if(err){
			callback(err);
		}
		else
		{
			callback(null, 'success');
		}
	})
}

module.exports.getTeamData = function(id, callback){

	Team.find({'userid' : id}).sort('-created_on').lean().exec(function(err, data){
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

module.exports.getteams = function(id, callback){

	Team.find({ 'userid' : id, 'status' : 'active'}).select('name').lean().exec(function(err, data){
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
 
module.exports.getTeamByCatId = function(id, skiprecord, recordlimit, callback){
	var categoryOptions = {
        path: 'type',
        match: {
            status: 'active'
        },
        select: "name image",
    };

	Team.find({'type' : id}).populate(categoryOptions).skip(skiprecord).limit(recordlimit).lean().exec(function(err, data){
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


module.exports.getTeamById = function(id, callback){

	Team.findOne({'_id' : id}).lean().exec(function(err, data){
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
module.exports.removeTeamById = function(id, callback){
	Team.remove({'_id' : id}).exec(function(err, data){
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


module.exports.updateTeam = function(id, jsondata, callback){
  if(id)
  {
  	
   	Team.findOneAndUpdate({ _id: id},{$set : jsondata}, {new: true})
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
  	
   	Team.findOneAndUpdate({ _id: id}, jsondata , {new: true}).lean()
   	.exec(function(err, data){
    	 if(err){
          callback(err);
        }else{
          callback(null, data);
        } 
    });
  }
}

module.exports.getFavTeamByUserId = function(id, callback){
	
	Team.find({'likedetail' : id}).lean().select('image title').exec(function(err, data){
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