(function () {
  'use strict';

  angular.module('myApp.controllers')
    .controller('DemoCtrl', ['$scope', function($scope){
      $scope.greeting = "Resize the page to see the re-rendering!";
      //controller code here
    }]);

}());
