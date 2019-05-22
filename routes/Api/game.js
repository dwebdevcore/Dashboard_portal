exports = module.exports = function(app, user, team, game, tournament, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, encryptor, mongoose, fs, path, jwtWeb, captchapng, request, flash, _, base64Img){


/***********************************************************************************************************************************/


var _finalData = {};
var meta = { code: Number, data_property_name: String, error: String, message: String };

	/** Code to fetch tournaments list by game id **/
	app.get('/tournaments/fetch_tournaments', function(req, res){
		var _gameKey = req.query.GameId;
		console.log('===>'+req.query.GameId);
		
		game.getGameById(_gameKey, function(err, response){
			if(err)
			{
				console.log('====>'+err);
				customValidationMsg(500, 'error', err, "", '', res);
			}
			else if(response != null && Object.keys(response).length > 0)
			{
				tournament.getActiveTournaments(_gameKey, function(err, tournaments){
					if(err)
					{
						customValidationMsg(500, 'error', err, '',"", res);
					}
					else
					{
						meta.code = 200;
				        meta.data_property_name = 'data';
				        meta.error = "";
				        meta.message = '';

				        var json = JSON.stringify({
				            'meta': meta,
				            'data': tournaments
				        });
				        res.send(json);					 	
					}
				})
			}
			else
			{
				console.log('===>'+req.query.GameId);
				customValidationMsg(404, 'error', '', 'No Tournament Found for this Game Id.', "", res);
			}
		})
		
	})

/***********************************************************************************************************************************/

	/** Code to update user score on behalf of tournament and user id **/
	app.put('/tournaments/update_score', function(req, res){

		var _score = req.body.score;
	    var _gameKey = req.body.gameKey;
	    var _tournamentId = req.body.tournamentId;
	    var _userId = req.body.userId;

	    console.log(req.body.score);
	    console.log(req.body.gameKey);
	    console.log(req.body.tournamentId);
	    console.log('00000'+req.body.userId);
	    tournament.getTournamentsbyIdAndPlayerId(_tournamentId, _userId, function(err, response){
	    	if(err)
	    	{
	    		console.log('====>>>'+err);
				customValidationMsg(500, 'error', err, "", 'An Error occured while getting tournament details', res);
	    	}
	    	else if(response != null && Object.keys(response).length > 0)
	    	{
	    		console.log('Player response'+ JSON.stringify(response, null,2));

	    		
	    			
	    		var _player = _.filter(response[0].players, function(_player) {

                    if(_player && _player.playerId){
                        return _player.playerId.toString() === _userId.toString();   
                    }
                })

                console.log('--->'+_player);

                var _bestScore = parseInt(_score);
                var _bestScoreDate = new Date();
                console.log('===>'+ _player);
                 if (parseInt(_score) <= _player[0].best_score.score) {

                    _bestScore = _player[0].best_score.score,
                    _bestScoreDate = _player[0].best_score.datetime
                }                
                tournament._updateTournament(_tournamentId, _userId, _bestScore, _bestScoreDate, _score, "exist", function(err, response){

                	if(err)
                	{
                		console.log('====>'+err);
						customValidationMsg(500, 'error', err, "", 'An Error occured while updating tournament details', res);
                	}
                	else
                	{
                		meta.code = 200;
				        meta.data_property_name = 'data';
				        meta.error = "";
				        meta.message = '';

				        var json = JSON.stringify({
				            'meta': meta,
				            'data': response
				        });
				        res.send(json);
                	}

                })
	    	}
	    	else
	    	{
				if(_userId && _score)
				{
					 console.log('====--->'+_tournamentId +'-'+ _userId);
					tournament._updateTournament(_tournamentId, _userId, 0, 0, _score, 'new', function(err, response){

						if(err)
						{
							console.log('====>'+err);
							customValidationMsg(500, 'error', err, "", 'An Error occured while updating tournament details', res);
						}
						else
						{
							meta.code = 200;
					        meta.data_property_name = 'data';
					        meta.error = "";
					        meta.message = '';

					        var json = JSON.stringify({
					            'meta': meta,
					            'data': response
					        });
					        res.send(json);
						}

					})
				}
				else
				{
					customValidationMsg(500, 'error', '', "", 'User Id or Score is missing.', res);
				}
	    	}
	    })
		
	})

/**********************************************************************************************************************************/

	/** Code to fetch the leaderboard **/

	app.get('/tournaments/fetch_leaderboard', function(req, res){
		tournament.getTournamentByID(req.query.TournamentId, function(err, response){
			if(err)
			{
				console.log('====>'+err);
				customValidationMsg(500, 'error', err, "", 'An Error occured while fetching tournament details', res);
			}
			else
			{
				console.log('==response==>'+ JSON.stringify(response));
				if(response != null &&  Object.keys(response).length > 0 && response.players.length > 0) 
				{
					var _players = response.players;

                    var _playersSortedArray = _.sortBy(_players, function(player) {
                        return player.best_score.score; }).reverse();

                    var _validPlayers = [];
                    var _uniquePlayers = [];
                    var _position = 1

                    _playersSortedArray.forEach((player, index) => {
                        if (player.playerId && player.playerId.login_as == 'fb') {

                            if(_uniquePlayers.indexOf(player.playerId._id.toString()) == -1)
                            {
                                _validPlayers.push({
                                    UserId: player.playerId._id,
                                    FirstName: player.playerId.name,
                                    Position: _position++,
                                    Points: player.best_score.score,
                                    Photo: player.playerId.image
                                })
                                _uniquePlayers.push(player.playerId._id.toString());
                            }
                        }
                    })

                    meta.code = 200;
                    meta.data_property_name = "data";
                    meta.error = "";
                    meta.message = '';

                    var json = JSON.stringify({
                        'meta': meta,
                        'data': _validPlayers,
                    });
                    res.send(json);
				}
			}
		})
		
	})

	
/***********************************************************************************************************************************/
	/** Code to fetch jumbotron data by tournament id **/
	app.get('/tournaments/jumbotron/fetch_leaderboard', function(req, res) {
		console.log('TournamentId-->'+req.query.tournamentId);
		if(req.query.tournamentId)
		{

			tournament.getTournamentByID(req.query.tournamentId,  function(err, response){

				if(err)
				{
					console.log("> Error in /fetch_leaderboard endpoint.", error);
					customValidationMsg(500, 'error', err, "", 'Error in /fetch_leaderboard endpoint', res);

				}
				else if(response != null && Object.keys(response).length > 0)
				{
					var players = response.players;

                    var playersSortedArray = _.sortBy(players, function(player) {
                    return player.best_score.score; }).reverse();


                    var validPlayers = [];
                    var uniquePlayers = [];
                    var position = 1;
                    playersSortedArray.forEach((player, index) => {
	                	 if (player.playerId && player.playerId.login_as =='fb') {
	                	 	if(uniquePlayers.indexOf(player.playerId._id.toString()) == -1)
                            {
                            	 validPlayers.push({
                                    UserId: player.playerId._id,
                                    FirstName: player.playerId.name,
                                    LastName: '',
                                    Position: position++,
                                    Points: player.best_score.score,
                                    Photo: player.playerId.image,
                                    Prize: null,
                                    PrizeImage: "",
                                    Email: player.playerId.email,
                                    City: "",
                                    State: "",
                                    Country: "",
                                    CountryCode: "",
                                    Flag: player.playerId.country_flag_image_url?player.playerId.country_flag_image_url:"",
                                    UserStatus: "1",
                                    AlreadyFriends: 0,
                                    Eliminated: 0
                                })
 								uniquePlayers.push(player.playerId._id.toString());
                            }
	                	 }
                    })

					var tournamentDetails = {
                        Ended: response.enddate != null?1:0,
                    }
                    // console.log(":: valid players - > ",validPlayers);
                    meta.code = 200;
                    meta.data_property_name = "leaderboard";
                    meta.error = "";

                    var json = JSON.stringify({
                        'meta': meta,
                        'leaderboard': validPlayers,
                        'notifications': ["Leaderboard list has been retrieved successfully"],
                        'tournamentsDetails': tournamentDetails
                    });
                    res.send(json);
				}
			})
		}
	})
}