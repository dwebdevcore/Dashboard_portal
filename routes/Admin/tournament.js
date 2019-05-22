exports = module.exports = function(app, user, Team, Game, Tournament, multer, path, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode, _){
	/** Code to add new Game **/
	app.post('/addTournament', function(req, res){

		var newpath = path.join(__dirname, '../..', '/public/uploads/');

		if(validator.isEmpty(req.body.name))
		{
			customValidationMsg('name is required.', res);
		}
		else if(validator.isEmpty(req.body.description))
		{
			customValidationMsg('Description is required.', res);
		}
		else if(validator.isEmpty(req.body.userid))
		{
			customValidationMsg('User id is required.', res);
		}
		else if(validator.isEmpty(req.body.teamid))
		{
			customValidationMsg('Please select team.', res);
		}
		else if(validator.isEmpty(req.body.gameid))
		{
			customValidationMsg('Please select game.', res);
		}
		else if(!req.body.manual && validator.isEmpty(req.body.startdate) && validator.isEmpty(req.body.enddate))
		{
			customValidationMsg('Please select startdate and enddate.', res);
		}
		else if(validator.isEmpty(req.body.logo) && validator.isEmpty(req.body.oldimage))
		{
			customValidationMsg('Logo is required.', res);
		}
		else
		{
			var status = '';
			if(!req.body.manual && (new Date(req.body.startdate) > new Date()) && (new Date(req.body.enddate) > new Date()))
			{
				status = 'Upcoming';
			}
			else if(!req.body.manual && (new Date(req.body.startdate) < new Date()) && (new Date(req.body.enddate) < new Date()))
			{
				status = 'Finished';
			}
			else if(!req.body.manual && (new Date(req.body.startdate) < new Date()) && (new Date(req.body.enddate) > new Date()))
			{
				status = 'Ongoing';
			}
			else if(req.body.manual)
			{
				status = 'Upcoming';
			}

			if(req.body.id)
			{
				var jsonToUpdate = {
					userid : req.body.userid,
					teamid : req.body.teamid,
					gameid : req.body.gameid,
					manual : req.body.manual == true ? true : false,
					startdate : req.body.manual == true ? null : new Date(req.body.startdate),
					enddate : req.body.manual == true ? null : new Date(req.body.enddate),
					name : req.body.name,
					description   : req.body.description ? req.body.description : '',
					logo   : req.body.logo,
					status :status,
				};
				Tournament.updateTournament(req.body.id, jsonToUpdate, function(err, response){
					if(err)
					{
						var json_arr  = {data: {detail: err},message : 'Due to some technichal error, It was unable to fetch data.', status:'failed'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
					else
					{
						if(req.body.image && req.body.oldimage)
						{
							fs.unlink(newpath+req.body.oldimage, function(err, response){
							});
						}
						var json_arr  = {data: {detail: response, message : 'Tournament updated successfully.'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})

			}
			else
			{

				var newTournament = new Tournament({
					userid : req.body.userid,
					teamid : req.body.teamid,
					gameid : req.body.gameid,
					manual : req.body.manual == true ? true : false,
					startdate : req.body.manual == true ? null : new Date(req.body.startdate),
					enddate : req.body.manual == true ? null : new Date(req.body.enddate),
					name : req.body.name,
					description   : req.body.description ? req.body.description : '',
					logo   : req.body.logo,
					status :status,
				});
				console.log('===>'+JSON.stringify(newTournament));
				Tournament.createData(newTournament,function(err, response){
					if(err)
					{
						console.log('--->'+err);
						var json_arr  = {data: {}, message : 'Due to some technichal error, It was unable to save data.'+ err, status:'failed'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
					else
					{
						var json_arr  = {data: {message : 'Tournament saved successfully.'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})
				
			}
		}

	})

/***********************************************************************************************************************************/

	/** Code to get Tournament list **/
	app.post('/getTournament', function(req, res){
		if(validator.isEmpty(req.body.userid))
		{
			customValidationMsg('User Id is required.', res);
		}
		else
		{
			Tournament.getTournamentData(req.body.userid, function(err, response){
				if(err)
				{
					var json_arr  = {data: {detail: '', message : 'Due to some technichal error, It was unable to fetch data.'}, status:'failed'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
				else if(response != null && response.length)
				{
					var playersArr = [];
					for (var i = 0; i < response.length; i++) {
						var playersList = {};
						playersList.created_on = response[i].created_on;
						playersList.name = response[i].name;
						playersList.manual = response[i].manual;
						playersList.startdate = response[i].startdate;
						playersList.enddate = response[i].enddate;
						playersList.logo = response[i].logo;
						playersList.status = response[i].status;
						playersList._id = response[i]._id;

						var uniquePlayers = [];
						var players = response[i].players;
						if(players.length)
						{
							players.forEach(function(player, ind){

								if(uniquePlayers.indexOf(player.playerId.toString()) == -1)
                        		{
							 		uniquePlayers.push(player.playerId.toString());
								}
							})
						}
						playersList.players = uniquePlayers;

						playersArr.push(playersList);

					};
					var json_arr  = {data: {detail: playersArr, message : 'Data found successfully'}, status:'success'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
				else
				{
					var json_arr  = {data: {detail: response, message : 'Data not found'}, status:'success'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
			})
		}
		
	})

/***********************************************************************************************************************************/

/***********************************************************************************************************************************/

	/** Code to get Team list **/
	app.post('/getTeams', function(req, res){
		if(validator.isEmpty(req.body.userid))
		{
			customValidationMsg('User Id is required.', res);
		}
		else
		{
			Team.getteams(req.body.userid, function(err, response){
				if(err)
				{
					var json_arr  = {data: {detail: '', message : 'Due to some technichal error, It was unable to fetch data.'}, status:'failed'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
				else
				{
					var json_arr  = {data: {detail: response, message : 'Data found successfully'}, status:'success'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
			})
		}
		
	})

/***********************************************************************************************************************************/

	/** Code to get Tournament By Id **/
	app.post('/getTournamentById', function(req, res){
		if(validator.isEmpty(req.body.id))
		{
			customValidationMsg('Tournament Id is required.', res);
		}
		else
		{
			Tournament.getTournamentById(req.body.id, function(err, response){
				if(err)
				{
					var json_arr  = {data: {detail: '', message : 'Due to some technichal error, It was unable to fetch data.'}, status:'failed'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
				else
				{
					var json_arr  = {data: {detail: response, message : 'Data found successfully'}, status:'success'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
			})
		}
		
	})

/**********************************************************************************************************************************/

	/** Code to delete Tournament by id **/

	app.post('/removeTournament', function(req, res){
		if(validator.isEmpty(req.body.id))
		{
			customValidationMsg('Tournament Id is required.', res);
		}
		else
		{
			Tournament.removeTournamentById(req.body.id, function(err, response){
				if(err)
				{
					var json_arr  = {data: {detail: '', message : 'Due to some technichal error, It was unable to fetch data.'}, status:'failed'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
				else
				{
					var json_arr  = {data: {detail: response, message : 'Data deleted successfully'}, status:'success'};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
			})
		}
		
	})

	/***********************************************************************************************************************************/
	/** Code to update start and End Time of tournament**/

		app.post('/updateMatch', function(req, res){
			if(validator.isEmpty(req.body.id))
			{
				customValidationMsg('Tournament Id is required.', res);
			}
			else
			{
				if(req.body.type == 'start')
				{
					var jsonToUpdate = {
						startdate : new Date(),
						status : 'Ongoing'
					};
				}
				else
				{
					var jsonToUpdate = {
						enddate : new Date(),
						status : 'Finished'
					};
				}
				
				Tournament.updateTournament(req.body.id, jsonToUpdate, function(err, response){
					if(err)
					{
						var json_arr  = {data: {detail: '', message : 'Due to some technichal error, It was unable to fetch data.'}, status:'failed'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
					else
					{
						var json_arr  = {data: {detail: response, message : 'Data updated successfully'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})
			}
			
		})
		/***********************************************************************************************************************************/
	/** Code to update start and End Time of tournament**/

		app.post('/fetchPlayers', function(req, res){
			if(validator.isEmpty(req.body.id))
			{
				customValidationMsg('Tournament Id is required.', res);
			}
			else
			{
				
				Tournament.getTournamentByID(req.body.id, function(err, tournament){
					if(err)
					{
						var json_arr  = {data: {detail: '', message : 'Due to some technichal error, It was unable to fetch data.'}, status:'failed'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
					else
					{
						var data = {
							players:[],
						}
						var uniquePlayers = [];
						var filteredPlayers = [];
						var players = tournament.players;
						if(tournament.players.length)
							{
								var playersSortedArray = _.sortBy(players, function(player) {
                					return player.best_score.score; }).reverse();
			
								playersSortedArray.forEach(function(player, ind){
									if(uniquePlayers.indexOf(player.playerId._id.toString()) == -1)
                            		{
										filteredPlayers.push({
											user_id: player.playerId._id?player.playerId._id:"",
											name: player.playerId.name?player.playerId.name:"Guest",
											email: player.playerId.email?player.playerId.email:"N.A", 
											bestScore: player.best_score.score?player.best_score.score:"N.A",
											turnsPlayed: player.scores.length,
											playedOn: player.best_score.datetime?player.best_score.datetime:"N.A",
										})
								 		uniquePlayers.push(player.playerId._id.toString());
									}
								})
							}
							else
							{
								data = [];
							}
						var json_arr  = {data: {detail: filteredPlayers, message : 'Data found successfully'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})
			}
			
		})
}

