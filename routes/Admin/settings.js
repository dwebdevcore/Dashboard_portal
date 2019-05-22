exports = module.exports = function(app, setting, customValidationMsg, validator, waterfall, multer, fs, path){
	/** Code to add new ingredient **/
	app.post('/addsetting', function(req, res){

		var newpath = path.join(__dirname, '../..', '/public/uploads/');

		/*if(validator.isEmpty(req.body.tax))
		{
			customValidationMsg('Tax amount is required.', res);
		}
		else if(validator.isEmpty(req.body.measure_in))
		{
			customValidationMsg('Measure type is required.', res);
		}		
		else
		{*/
			
			
			var tax = req.body.tax ? req.body.tax : 0;
			var jsonToUpdate ={
				tax : tax,
				default_quantity : req.body.default_quantity ? req.body.default_quantity : 0,
				default_time : req.body.default_time ? req.body.default_time : 120 
			};
			setting.findOneAndUpdate({ _id: '58da23eb769d304f50b5f60d'},jsonToUpdate,function(err){
				if(err)
				{
					var json_arr  = {data: {detail: err},message : 'Due to some technichal error, It was unable to update data.', success : false};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
				else
				{
					var json_arr  = {data: {detail: '', message : 'Settings updated successfully. '}, success : true};
					res.contentType('application/json');
					res.end(JSON.stringify(json_arr));
				}
			})

		//}

	})

/***********************************************************************************************************************************/

app.post('/getsettings', function(req, res){

		setting.findOne({ _id: '58da23eb769d304f50b5f60d'},function(err, response){
			if(err)
			{
				var json_arr  = {data: {detail: err},message : 'Due to some technichal error, It was unable to fetch data.', success : false};
				res.contentType('application/json');
				res.end(JSON.stringify(json_arr));
			}
			else
			{
				var json_arr  = {data: {detail: response, message : 'Settings found successfully. '}, success : true};
				res.contentType('application/json');
				res.end(JSON.stringify(json_arr));
			}
		})

	})
	
}