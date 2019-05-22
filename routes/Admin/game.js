exports = module.exports = function(app, user, Team, Game, multer, path, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode){
	/** Code to add new Game **/
	app.post('/addGame', function(req, res){

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
			customValidationMsg('Team is required.', res);
		}
		
		else if(validator.isEmpty(req.body.logo) && validator.isEmpty(req.body.oldimage))
		{
			customValidationMsg('Logo is required.', res);
		}
		else
		{

			if(req.body.id)
			{
				var jsonToUpdate = {
					userid : req.body.userid,
					teamid : req.body.teamid,
					name : req.body.name,
					description   : req.body.description ? req.body.description : '',
					logo   : req.body.logo,
					status :req.body.status,
				};
				Game.updateGame(req.body.id, jsonToUpdate, function(err, response){
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
						var json_arr  = {data: {detail: response, message : 'Game updated successfully.'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})

			}
			else
			{

				var newGame = new Game({
					userid : req.body.userid,
					teamid : req.body.teamid,
					name : req.body.name,
					description   : req.body.description ? req.body.description : '',
					logo   : req.body.logo,
					status :req.body.status,
				});

				Game.createData(newGame,function(err, response){
					if(err)
					{
						var json_arr  = {data: {}, message : 'Due to some technichal error, It was unable to save data.', status:'failed'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
					else
					{
						var json_arr  = {data: {message : 'Game saved successfully.'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})
				
			}
		}

	})

/***********************************************************************************************************************************/

	/** Code to get Game list **/
	app.post('/getGame', function(req, res){
		if(validator.isEmpty(req.body.userid))
		{
			customValidationMsg('User Id is required.', res);
		}
		else
		{
			Game.getGameData(req.body.userid, function(err, response){
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

/***********************************************************************************************************************************/

	/** Code to get Game list **/
	app.get('/getTeams', function(req, res){
		Team.getteams(function(err, response){
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
		
	})

/***********************************************************************************************************************************/

	/** Code to get Game By Id **/
	app.post('/getGameById', function(req, res){
		if(validator.isEmpty(req.body.id))
		{
			customValidationMsg('Game Id is required.', res);
		}
		else
		{
			Game.getGameById(req.body.id, function(err, response){
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

	/** Code to delete Game by id **/

	app.post('/removeGame', function(req, res){
		if(validator.isEmpty(req.body.id))
		{
			customValidationMsg('Game Id is required.', res);
		}
		else
		{
			Game.removeGameById(req.body.id, function(err, response){
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
/***********************************************************************************************************************************/

	/** Code to get Game list **/
	app.get('/getTeams', function(req, res){
		Team.getteams(function(err, response){
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
		
	})

/***********************************************************************************************************************************/

	/** Code to get Game By teamId **/
	app.post('/getGameByteam', function(req, res){
		if(validator.isEmpty(req.body.teamid))
		{
			customValidationMsg('Team Id is required.', res);
		}
		else if(validator.isEmpty(req.body.userid))
		{
			customValidationMsg('User Id is required.', res);
		}
		else
		{
			Game.getGameByteam(req.body.teamid, req.body.userid, function(err, response){
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


}

