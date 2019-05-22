'use strict';
angular.module(
	'HomeCtrl', [])
	.controller('HomeController', function ($scope, $route, manageSession, $http, $location,$rootScope, Flash){

		$rootScope.$on('$locationChangeStart', function (event, current, previous) {
        	$scope.previoustab = previous;
		});
		$scope.site_title = site_title;
		$scope.sidehead = 'Dashboard';
		$scope.sidetxt = 'Control panel';
		$scope.$route = $route;
		$scope.disable = 'false';
		$scope.admin = manageSession.get('__name', 1);
		$('.overlay').hide();

		$scope.logout = function(){

			$http.post('/logout').then( function(response){

				if(response.data.success)
				{
					manageSession.remove('__userData');
					manageSession.remove('__token');
					window.location = siteUrl+'login';
				}
			})
			.catch(function(response){
				console.log('Due to Some technichal error, It is unable to logout' + response);
			})

		};

		$scope.getOrderData = function(){
			$http.post('/getOrderData').then( function(response){
				if(response.data.status == 'success')
				{
					$scope.new = response.data.data.detail.newScore;
					$scope.completed = response.data.data.detail.completedScore;
					$scope.process = response.data.data.detail.processScore;
					$scope.user = response.data.data.detail.userScore;
					$scope.drink = response.data.data.detail.drinkScore;
					$scope.drinktype = response.data.data.detail.drinkTypeScore;
					$scope.ingredient = response.data.data.detail.ingredientScore;
					$scope.totalvendors = response.data.data.detail.vendorScore;
					$scope.activevendor = response.data.data.detail.vendorActiveScore;
					$scope.haveordersnendor = response.data.data.detail.vendorHaveOrdersScore;
					$scope.freevendors = response.data.data.detail.vendornoOrdersScore;
					$scope.total = parseInt(response.data.data.detail.processScore) + parseInt(response.data.data.detail.completedScore) +parseInt(response.data.data.detail.newScore);
				}
				else
				{
					$scope.new = 0;
					$scope.completed = 0;
					$scope.process = 0;
					$scope.user = 0;
					$scope.drink = 0;
					$scope.drinktype = 0;
					$scope.ingredient = 0;
					$scope.totalvendors = 0;
					$scope.activevendor = 0;
					$scope.haveordersnendor = 0;
					$scope.freevendors = 0;
					$scope.total = 0;
				}
			})

		}

		$scope.sendMail = function(){
			console.log(this);
			console.log(this.MailForm.subject.$invalid);
			var error = 0;
			
			if(this.MailForm.emailto.$invalid)
			{
				$scope.error_emailto = 'emailto';
				error +=1;
			}
			if(this.MailForm.subject.$invalid)
			{
				$scope.error_subject = 'subject';
				error +=1;
			}
			if(this.MailForm.message.$invalid)
			{
				$scope.error_message = 'message';
				error +=1;
			}

			if(error > 0)
			{
				return;
			}
			else
			{
				$scope.disable = 'true';
				$('.overlay').show();
				$http.post('/sendMail', {email : this.emailto, subject : this.subject, message:this.message }).then(function(response){

					Flash.clear();
					
					if(response.data.success)
					{
						$('.overlay').hide();
						$scope.disable = 'flase';
						$scope.emailto = '';
						$scope.subject = '';
						$scope.message = '';
						Flash.create('success', response.data.message, 5000, {container: 'Email-flash'});
					}
					else
					{
						$('.overlay').hide();
						Flash.create('danger', response.data.message, 5000, {container: 'Email-flash'});
					}

				})

			}
		}

		$scope.getsettings = function(){

			$http.post('/getsettings').then( function(response){

				console.log(response);

				if(response.data.success)
				{
					$scope.tax = response.data.data.detail.tax;
					$scope.default_quantity = response.data.data.detail.default_quantity;
					$scope.default_time = response.data.data.detail.default_time;
				}
			})
			.catch(function(response){
				console.log('Due to Some technichal error, It is unable to logout' + response);
			})

		};


		$scope.addsetting = function(){


			var error = 0;
			if(this.settingForm.tax.$invalid)
			{
				$scope.error_tax = 'tax';
				error += 1;
			}
			if(this.settingForm.default_quantity.$invalid)
			{
				$scope.error_default_quantity = 'default_quantity';
				error += 1;
			}
			if(this.settingForm.default_time.$invalid)
			{
				$scope.error_default_time = 'default_time';
				error += 1;
			}
			if(error > 0)
			{
				return;
			}
			else
			{
				var default_time = 120;
				if(parseInt(this.default_time) > 120 )
				{
					default_time = parseInt(this.default_time);
				}
				
				
				$http.post('/addsetting', {tax : this.tax, default_quantity : this.default_quantity, default_time : default_time}).then( function(response){

					console.log(response);
					//Flash.clear();

					if(response.data.success)
					{
						$('.overlay').hide();
						Flash.create('success', response.data.data.message, 5000, {container: 'Setting-flash'});
					}
					else
					{
						$('.overlay').hide();
						Flash.create('danger', response.data.data.message, 5000, {container: 'Setting-flash'});
					}
				})
				.catch(function(response){
					console.log('Due to Some technichal error, It is unable to logout' + response);
				})
			}
		};
	})