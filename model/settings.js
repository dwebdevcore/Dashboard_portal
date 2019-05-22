var mongoose = require('mongoose');

var settingSchema  = mongoose.Schema({
	tax 		    : { type : Number},
	default_quantity : { type : Number},
	default_time     : { type : Number, default : 120},
});

var setting = module.exports = mongoose.model('setting', settingSchema); 
