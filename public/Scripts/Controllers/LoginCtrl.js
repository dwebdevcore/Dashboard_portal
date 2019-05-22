'use strict';
angular.module(
	'LoginCtrl', [])
	.controller('LoginController', function ($scope, manageSession, $http, $location, Flash, $routeParams){
		console.log(siteUrl);
		var mypath = $location.$$path;
		$scope.userotp = '';
		 $scope.routename = mypath.split('/')[1];
		if(manageSession.get('__userData', 1))
		{
			window.location = siteUrl+'dashboard';
		}
		$scope.login = function(){
			
			function validateEmail(email) {
			    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return re.test(email);
			}
			
			Flash.clear();
			if(!this.email && !this.password)
			{
				Flash.create('danger', 'Email and Password field is required.',5000, {container: 'flash-fixed'});
			}
			else if(!this.email)
			{
				Flash.create('danger', 'Email is required.', {container: 'flash-fixed'});
			}
			else if(!validateEmail(this.email) && !this.password)
			{
				Flash.create('danger', 'Invalid Email and Password is required.', 5000, {container: 'flash-fixed'});
			}
			else if(!validateEmail(this.email))
			{
				Flash.create('danger', 'Invalid Email',5000, {container: 'flash-fixed'});
			}
			else if(!this.password)
			{
				Flash.create('danger', 'Password field is required.',5000, {container: 'flash-fixed'});
			}
			else{
				Flash.clear();

				
				var data = {
					'email' : this.email,
					'password' : this.password,
					'otp' : this.otp ? this.otp : ''
				};

				$http.post('/clientLogin', data).then(function(response){

					console.log(response.data.data.message);
					if(response.data.status == 'success')
					{
						if(response.data.data.otp == 'sent')
						{
							$scope.userotp = 'sent'; 
							Flash.create('success', response.data.data.message, 5000, {container: 'flash-fixed'});
						}
						else
						{
							console.log(response.data.data);
							Flash.create('success', response.data.data.message, 5000, {container: 'flash-fixed'});
							manageSession.set('__userData', response.data.data.email);
							manageSession.set('__userid', response.data.data._id);
							manageSession.set('__token', response.data.data.token);
							manageSession.set('__name', response.data.data.first_name);
							window.location = siteUrl+'dashboard';
						}
					}
					else
					{
						Flash.create('danger', response.data.data.message, 5000, {container: 'flash-fixed'});
					}
				})
				.catch(function(response){
					Flash.create('danger', 'We are unable to fetch result from server.', 5000, {container: 'category-flash'});
				})
			}
		}

		$scope.changePassword = function()
		{
			Flash.clear();
			if(!this.newPassword)
			{
				Flash.create('danger', 'New Password field is required.',5000, {container: 'flash-fixed'});
			}
			else if((this.newPassword).length < 6)
			{
				Flash.create('danger', 'New Password field must have atleast 6 characters.',5000, {container: 'flash-fixed'});
			}
			else if(!this.confirmPassword)
			{
				Flash.create('danger', 'Confirm Password field is required.',5000, {container: 'flash-fixed'});
			}
			else if(this.newPassword != this.confirmPassword)
			{
				Flash.create('danger', 'New Password and Confirm Password field does not match.',5000, {container: 'flash-fixed'});
			}
			else
			{
				var encemail = $location.path().split('/forgetPassword/')[1];
				if(!encemail)
				{
					Flash.create('danger', 'Invalid Account.',5000, {container: 'flash-fixed'});
				}
				else
				{
					$http.post('/resetPassword', {password:this.confirmPassword, email : encemail}).then(function(response){

						if(response.data.success)
						{
							$('#newPassword').val('');
							$('#confirmPassword').val('');
							
							Flash.create('success',response.data.data.message ,5000, {container: 'flash-fixed'});
						}
						else
						{
							Flash.create('danger',response.data.data.message ,5000, {container: 'flash-fixed'});
						}
					})
					.catch(function(response){
						Flash.create('danger', 'We are unable to fetch result from server.', 5000, {container: 'category-flash'});
					})
				}
			}
		}

	})