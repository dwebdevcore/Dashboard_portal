exports = module.exports = function(app, path){

	app.get('/', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/login.html'));
	})

	app.get('/login', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/login.html'));
	})
	app.get('/dashboard', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/team', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/team/create', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/team/:id', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/game', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/game/create', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/game/:id', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/tournament', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/tournament/create', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
	app.get('/tournament/:id', function(req, res) {
		res.sendFile(path.join(__dirname, '../..', '/public/admin_master.html'));
	})
}