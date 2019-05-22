app.config([
	'$routeProvider',
 	'$locationProvider',
 	function($routeProvider, $locationProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'login.html',
			controller: 'LoginController',
		})
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'LoginController',
		})
		.when('/dashboard', {
			templateUrl: 'Views/dashboard.html',
			controller: 'HomeController',
			activetab: 'dashboard',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/team', {
			templateUrl: 'Views/team/list.html',
			controller: 'TeamController',
			activetab: 'team',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/team/create', {
			templateUrl: 'Views/team/create.html',
			controller: 'TeamController',
			activetab: 'team',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/team/:id', {
			templateUrl: 'Views/team/edit.html',
			controller: 'TeamController',
			activetab: 'team',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/game', {
			templateUrl: 'Views/game/list.html',
			controller: 'GameController',
			activetab: 'game',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/game/create', {
			templateUrl: 'Views/game/create.html',
			controller: 'GameController',
			activetab: 'game',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/game/:id', {
			templateUrl: 'Views/game/edit.html',
			controller: 'GameController',
			activetab: 'game',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/tournament', {
			templateUrl: 'Views/tournament/list.html',
			controller: 'TournamentController',
			activetab: 'tournament',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/tournament/create', {
			templateUrl: 'Views/tournament/create.html',
			controller: 'TournamentController',
			activetab: 'tournament',
			resolve: { loggedin: checkLoggedin }
		})
		.when('/tournament/:id', {
			templateUrl: 'Views/tournament/edit.html',
			controller: 'TournamentController',
			activetab: 'tournament',
			resolve: { loggedin: checkLoggedin }
		})
		
		$locationProvider.html5Mode(true);
	}
]);

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope , manageSession){ 
// Initialize a new promise
 var deferred = $q.defer();
// Make an AJAX call to check if the user is logged in 
$http.post('/isauthentic', {token : manageSession.get('__token', 1)}).then(function(user){ 

	// Authenticated 
	if (user.data.status) 
		deferred.resolve(); 
	// // Not Authenticated 
	else 
	{ 
		$rootScope.message = 'You need to log in.'; 
		deferred.reject();
		manageSession.remove('__userData');
		manageSession.remove('__token');
		window.location = siteUrl+'login'; 
		//$location.url('/login'); 
	} 
}); 
return deferred.promise; 
};

