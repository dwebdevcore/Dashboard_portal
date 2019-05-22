exports = module.exports = function(app, user, Team, multer, path, nodemailer, smtpTransport, passwordHash, customValidationMsg, validator, waterfall, jwt, passcode){
	/** Code to add new Team **/
	app.post('/addTeam', function(req, res){

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
					name : req.body.name,
					description   : req.body.description ? req.body.description : '',
					volume   : req.body.volume,
					measure_in   : req.body.measure_in,
					logo   : req.body.logo,
					status :req.body.status,
				};
				Team.updateTeam(req.body.id, jsonToUpdate, function(err, response){
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
						var json_arr  = {data: {detail: response, message : 'Team updated successfully.'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})

			}
			else
			{

				var newTeam = new Team({
					userid : req.body.userid,
					name : req.body.name,
					description   : req.body.description ? req.body.description : '',
					volume   : req.body.volume,
					measure_in   : req.body.measure_in,
					logo   : req.body.logo,
					status :req.body.status,
				});

				Team.createData(newTeam,function(err, response){
					if(err)
					{
						var json_arr  = {data: {}, message : 'Due to some technichal error, It was unable to save data.', status:'failed'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
					else
					{
						var json_arr  = {data: {message : 'Team saved successfully.'}, status:'success'};
						res.contentType('application/json');
						res.end(JSON.stringify(json_arr));
					}
				})
				
			}
		}

	})

/***********************************************************************************************************************************/

	/** Code to get Team list **/
	app.post('/getTeam', function(req, res){
		if(validator.isEmpty(req.body.userid))
		{
			customValidationMsg('User Id is required.', res);
		}
		else
		{
			Team.getTeamData(req.body.userid, function(err, response){
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

	/** Code to get Team By Id **/
	app.post('/getTeamById', function(req, res){
		if(validator.isEmpty(req.body.id))
		{
			customValidationMsg('Team Id is required.', res);
		}
		else
		{
			Team.getTeamById(req.body.id, function(err, response){
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

	/** Code to delete Team by id **/

	app.post('/removeTeam', function(req, res){
		if(validator.isEmpty(req.body.id))
		{
			customValidationMsg('Team Id is required.', res);
		}
		else
		{
			Team.removeTeamById(req.body.id, function(err, response){
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
	/** Code to upload Location image **/
	var storage = multer.diskStorage({ 
		    destination: function (req, file, cb) {
		        cb(null, './public/uploads/');
		    },
		    filename: function (req, file, cb) {
		        console.log(file);
		        var datetimestamp = Date.now();
		        cb(null, file.fieldname + '-' + datetimestamp);
		    }
		});


	var uploadData = multer({storage: storage}).single('file');
	app.post('/saveImage' , function(req,res){

	        uploadData(req,res,function(err){
	            if(err){
	                 res.json({error_code:1,err_desc:err});
	                 return;
	            }
	            res.json({ file_data :req.file ,  error_code:0,err_desc:null});
	        });
	    });

}

