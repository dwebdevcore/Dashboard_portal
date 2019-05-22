var site_title  = 'Ngage';
var siteUrl = 'http://portal.tilt.webfactional.com/';

var app = angular.module('Ngage', [
  'ngRoute',
  'ngStorage',
  'ngFlash',
  'angularMoment',
  'toggle-switch',
  'angular-img-cropper',
  'ngFileUpload',
  'ngMessages',
  'ngTableToCsv',
  'ui.select2',
  'angularjs-datetime-picker',
  'LoginCtrl',
  'HomeCtrl',
  'TeamCtrl',
  'GameCtrl',
  'TournamentCtrl',
]);

app.factory('manageSession', ['$localStorage', function($localStorage) {
	return {
		set: function(key, value) {
			$localStorage[key] = value;
		},
		get: function(key, defaultValue) {
			return $localStorage[key] || false;
		},
		setObject: function(key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		getObject: function(key) {
			if($localStorage[key] != undefined)
				return JSON.parse($localStorage[key] || false );

			return false;
		},
		remove: function(key){
            delete $localStorage[key]
			//$localStorage.removeItem(key);
		},
		clear: function(){
			$localStorage.clear();
		}
	}
}])



//==============================================
// File Upload
//==============================================
app.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
         console.log(attrs.fileModel);
          var modelSetter = model.assign;

          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }]);

app.service('fileUpload', ['$http','$q', function ($http , $q) {
    this.uploadFileToUrl = function(file, uploadUrl,inputfilename){
       var fd = new FormData();
       var def = $q.defer();
       fd.append(inputfilename, file);
       
       $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
       })

       .success(function(res){
            //return res;
            def.resolve(res);
       })

       .error(function(){
       });
       return def.promise;
    }
 }]);

app.service('dataURItoBlob', function() {
    this.getImage = function (dataURI, type) {
        // convert base64 to raw binary data held in a string
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var bb = new Blob([ab], { type: type });
        return bb;
    }
})


app.service('getDataByUrl', ['$http', '$q',
  function($http, $q) {
     var def = $q.defer();
      this.getData = function() {
        $http.post('/getIngredient').then(function(response) {

          if(response.data.status == 'success')
            def.resolve(response.data.data.detail);
          else
            deferred.reject();
        });

        return deferred.promise; 
    };
  }
]);


