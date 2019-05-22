var mongoose = require('mongoose');
//mongoose.set('debug', true);

var prize = new mongoose.Schema({
    prize: {
        type: { type: String }, 
        amount: { type: Number },
        name: { type: String },
        description: { type: String },
        image: {type : String},
        for_ranks: [{ type: Number }]
    }
});

var TournamentSchema  = mongoose.Schema({
	userid 			: {type : mongoose.Schema.ObjectId, ref: 'User', required : true},
	teamid 			: {type : mongoose.Schema.ObjectId, ref: 'Team', required : true},
	gameid 			: {type : mongoose.Schema.ObjectId, ref: 'Game', required : true},
	name 			: { type : String, required : true, unique : true },
	logo 		    : { type : String}, 
	description 	: { type : String },
	manual 			: { type : Boolean},
	startdate 		: { type : Date, default : null},
	enddate 		: { type : Date, default: null},
	status 			: { type : String, enum : ['Ongoing', 'Upcoming', 'Finished'], default : 'Upcoming' },
	prizes 			: [prize],
    players			: [{
	        				playerId: { type: mongoose.Schema.ObjectId, ref: 'User' },
	        				scores: [{
					            score: { type: Number },
					            datetime: { type: Date, default: Date.now }
					        }],
					        best_score: {
					            score: { type: Number },
					            datetime: { type: Date, default: Date.now }
					        }
    					}],
	created_on 		: { type : Date, default : Date.now()}
})

var Tournament = module.exports = mongoose.model('Tournament', TournamentSchema); 

module.exports.createData = function(TournamentData, callback){
	TournamentData.save(function(err){
		if(err){
			callback(err);
		}
		else
		{
			callback(null, 'success');
		}
	})
}

module.exports._updateTournament = function(_tournamentId, userId, _bestScore, _bestScoreDate, _score, type, callback){
	if(type == "exist")
	{
		Tournament.update({_id: _tournamentId, 'players.playerId': userId }, {

			 $set: {
	                'players.$.best_score.score': _bestScore,
	                'players.$.best_score.datetime': _bestScoreDate,
	                'players.$.playerId': userId
	            },
	            $push: {
	                'players.$.scores': {
	                    score: _score,
	                    datetime: new Date()
	                }
		}}, {new:true}).exec(function(err, data){
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
	else
	{
		Tournament.update({_id: _tournamentId}, {
			  $push: {
	                    players: {
	                        playerId: userId,
	                        scores: [{
	                            score: _score
	                        }],
	                        best_score: {
	                            score: _score
	                        }
	                    }
	                }}, {upsert: true}).exec(function(err, data){
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

}


module.exports.updatePlayer = function(_whereId, userId, callback){
	
	Tournament.update({'players.playerId': _whereId }, {

		 $set: {                
                'players.$.playerId': userId
            }}, {multi:true}).exec(function(err, data){
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

module.exports.getTournamentData = function(id, callback){

	Tournament.find({'userid' : id}).sort('-created_on').lean().exec(function(err, data){
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


module.exports.getTournamentByID = function(id, callback){

	Tournament.findOne({_id: id}).populate('players.playerId').lean().exec(function(err, data){
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
module.exports.getActiveTournaments = function(gameid, callback){

	Tournament.find({'gameid' : gameid, status : 'Ongoing'}).sort('startdate').lean().exec(function(err, data){
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

module.exports.getTournamentsbyIdAndPlayerId = function(tournamentid, playerid, callback){

	Tournament.find({'_id' : tournamentid, 'players.playerId' : mongoose.Types.ObjectId(playerid)}).sort('startdate').lean().exec(function(err, data){
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



module.exports.removeTournamentById = function(id, callback){
	Tournament.remove({'_id' : id}).exec(function(err, data){
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


module.exports.updateTournament = function(id, jsondata, callback){
  if(id)
  {
  	
   	Tournament.findOneAndUpdate({ _id: id},{$set : jsondata}, {new: true})
   	.exec(function(err, data){
    	 if(err){
          callback(err);
        }else{
          callback(null, data);
        } 
    });
  }
}
