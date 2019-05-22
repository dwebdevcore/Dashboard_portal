'use strict'
angular.module(
	'GameCtrl', [])
.controller('GameController', function($scope, $compile, manageSession, dataURItoBlob, $http, $location, Flash, moment, Upload, $routeParams, getDataByUrl){

	$scope.site_title = site_title;
	$scope.sidehead = 'Game';
	$scope.sidetxt = 'List';
	$scope.sidecreatetxt = 'Add';
	$scope.sideedittxt = 'Update';
	$scope.chkdisable = true;
	$scope.switchStatus = true;

	$scope.cropper = {};
    $scope.cropper.sourceImage = null;
    $scope.cropper.croppedImage   = null;
    $scope.bounds = {};
    $scope.bounds.left = 0;
    $scope.bounds.right = 0;
    $scope.bounds.top = 0;
    $scope.bounds.bottom = 0;
    
    $scope.error_name = '';
    $scope.error_file = '';
    $scope.fileerror = '';
    $scope.siteUrl = siteUrl+'uploads/';
    $scope.ingredientSet = [];
    $scope.garnishSet = [];


    $scope.fileselect = function(){

		$scope.error_file = '';
	}


    $scope.getGame = function(){

	$scope.tableData = [];
	var userid = manageSession.get('__userid', 1);
	$http.post('/getGame',{userid : userid}).then(function(response) {

         if(response.data.status == 'success')
         {

            $scope.tableData =  (response.data.data.detail);
            $('#datatable').dataTable({

				"order": [[ 0, 'desc' ]],
            	data : (response.data.data.detail).reverse(),
            	columns : [
            		{ "title": "Date",  "visible" : false, 'data' : 'created_on' },
            		{ "title": "Name",  'data' : 'name' },
            		{ "title": "Logo",'data' : 'logo', sortable:false, searcheable :false,
            			render: function(data, type, full, meta){
            				if(data)
            					return '<img src="'+siteUrl+'uploads/'+data+'" height="50px" width="50px"/>'
            				else
            					return '<img src="'+siteUrl+'uploads/default.jpg" height="50px" width="50px"/>'
            			}},
            		{ "title": "Status",'data' : 'status', render: function(data, type, full, meta){
            				if(full.status == 'active')
            					var myclass = 'label label-success';
            				else
            				  var myclass = 'label label-warning';
            					return '<span style="text-transform: capitalize;" class="'+myclass+'">'+data+'</span>'
        			}},
            		{"title" : "Action", 'data' : "", sortable:false, searcheable :false, render: function (data, type, full, meta) { return '<a class="btn btn-social-icon btn-twitter" href="game/'+full._id+'"><i class="fa fa-edit"></i></a>  <a class="btn btn-social-icon btn-google"  href="Javascript:void(0);" ng-click = deleteGame("'+full._id+'")><i class="fa fa-remove"></i></a>'; }}
            	],
			      createdRow: function(row, data, dataIndex) {
			        $compile(angular.element(row).contents())($scope);
			      }
            });
         }

          else
            $scope.tableData = [];
		})
	}

	$scope.addGame = function()
	{

		var data = this;

		var error = 0;
		if(this.gameForm.name.$invalid)
		{
			$scope.error_name = 'name';
			error += 1;
		}
		if(this.gameForm.description.$invalid)
		{
			$scope.error_description = 'description';
			error += 1;
		}
		if(this.gameForm.team.$invalid)
		{
			$scope.error_team = 'team';
			error += 1;
		}
		if(!this.myfile && !this.imagename)
        {
        	$scope.error_file = 'myfile';
        	$scope.fileerror = 'Image is required';
        	error += 1;
        }
        else if(this.myfile && this.myfile.type != 'image/png' && this.myfile.type != 'image/jpg' && this.myfile.type != 'image/jpeg')
        {
            $scope.error_file = 'myfile';
        	$scope.fileerror = 'Image is not in correct format.';
        	error += 1;
        }
        else if(this.myfile && this.myfile.size > 2000000)
        {
        	$scope.error_file = 'myfile';
        	$scope.fileerror = 'Image size exceeds the allowed size.';
        	error += 1;
        }
	
        if(error > 0)
        {
        	return;
        }
        else
        {
        	if($routeParams.id)
        	{	
    			var status = this.switchStatus ? 'active' : 'inactive';
        		var data = this;
        		if(!this.myfile)
        		{
        			$scope.saveData(data,  data.imagename , data.imagename, $routeParams.id, status);
        		}
        		else
        		{
        			if(this.cropper.croppedImage)
					{
						var imageBase64 = this.cropper.croppedImage;
						console.log(this.myfile.type);
						var file = new File([dataURItoBlob.getImage(imageBase64, '"'+this.myfile.type+'"')], "'"+this.myfile.name+"'");

						Upload.upload({
		                    url: siteUrl+"saveImage", 
		                    data:{file:file} 
		                }).then(function (resp) { 
		                    if(resp.data.error_code === 0){ 
		                        var filename = resp.data.file_data.filename; 
		                        if(filename)
		                        {

		                        	$scope.saveData(data, filename, data.imagename, $routeParams.id, status);
		                        }                    
		                    } else {

		                        console.log(resp.data)              
		                    }
		                });
					}

        		}
    			
        	}
        	else
        	{
        		if(data.cropper.croppedImage)
				{
					var imageBase64 = data.cropper.croppedImage;
					var file = new File([dataURItoBlob.getImage(imageBase64, '"'+data.myfile.type+'"')], "'"+data.myfile.name+"'");

					Upload.upload({
	                    url: siteUrl+"saveImage", 
	                    data:{file:file} 
	                }).then(function (resp) { 
	                    if(resp.data.error_code === 0){ 
	                        var filename = resp.data.file_data.filename; 
	                        if(filename)
	                        {
	                        	console.log(JSON.stringify(resp.data));
	                        	$scope.saveData(data, filename, '','', 'active');
	                           
	                        }                    
	                    } else {

	                        console.log(resp.data)              
	                    }
	                });
				}
				
        	}
        }
	}

	$scope.saveData = function(data, filename, oldimage, id, status){
		
		Flash.clear();
		var userid = manageSession.get('__userid', 1);
		console.log(userid);
    	var newData = {userid : userid, teamid: data.team, name : data.name, logo : filename, description:data.description, id : id, oldimage : oldimage, status:status};
		console.log(JSON.stringify(newData));
		$http.post('/addGame', newData).then(function(response){
			if(response.data.status == 'success')
			{
				Flash.create('success', response.data.data.message, 5000, {container: 'Game-flash'});
				$scope.name = '';
				$location.path('/game')
			}
			else
			{
				Flash.create('danger', response.data.data.message, 5000, {container: 'Game-flash'});
			}
		})
		.catch(function(response){
			Flash.create('danger', 'We are unable to fetch result from server.', 5000, {container: 'Game-flash'});
		})
	}


	$scope.getTeams = function(){
	var userid = manageSession.get('__userid', 1);
	$scope.tableData = [];
	$http.post('/getTeams', {userid : userid}).then(function(response) {
		console.log('adadasdas');
         if(response.data.status == 'success')
         {
         	console.log('===>'+response.data.data.detail);
            $scope.teams =  (response.data.data.detail);
         }
         else
         {
         	$scope.teams = [];
         }
		})
	}

	$scope.getGameById = function(){
		Flash.clear();
		$http.post('/getGameById', {id : $routeParams.id}).then(function(response){

			if(response.data.status == 'success')
			{
				$scope.name = response.data.data.detail.name;
				$scope._id = response.data.data.detail._id;
				$scope.team = response.data.data.detail.teamid;
				$scope.description = response.data.data.detail.description;
				$scope.cropper.croppedImage = response.data.data.detail.logo ? siteUrl+'uploads/'+response.data.data.detail.logo : null ;
				$scope.imagename   = response.data.data.detail.logo ? response.data.data.detail.logo : null ;
				$scope.switchStatus = response.data.data.detail.status == 'active' ? true : false;
				$scope.chkdisable = false;
			}
			else
			{
				Flash.create('danger', response.data.data.message, 5000, {container: 'ingredient-flash'});
			}
		})
		.catch(function(response){
			Flash.create('danger', 'We are unable to fetch result from server.', 5000, {container: 'ingredient-flash'});
		})

	}

	$scope.deleteGame = function(id){
	 	if(id)
	 	{
	 		swal({
	            title: "Are you sure?",
	            text: "You want to delete this record ?",
	            type: "warning",
	            showCancelButton: true,
	            confirmButtonColor: '#DD6B55',
	            confirmButtonText: 'Ok',
	            cancelButtonText: "Cancel",
	            closeOnConfirm: true,
	            closeOnCancel: true
          },
          function(isConfirm) {

              if(isConfirm)
              {
                $http.post('/removeGame', {id:id}).then(function(res){

                    if(res.data.status == 'success')
                    {
                        $('#datatable').dataTable().fnDestroy();
                        $scope.getGame();
                    }
                   
                })
              }
              else
              {
                $location.path('/glass');
                $scope.$apply();
              }
          });

	 	}
      }
})