'use strict';

// Touches controller
angular.module('touches').controller('TouchesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Touches',
	function($scope, $stateParams, $location, Authentication, Touches) {
		$scope.authentication = Authentication;

		// Create new Touch
		$scope.create = function() {
			// Create new Touch object
			var touch = new Touches ({
				name: this.name
			});

			// Redirect after save
			touch.$save(function(response) {
				$location.path('touches/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Touch
		$scope.remove = function(touch) {
			if ( touch ) { 
				touch.$remove();

				for (var i in $scope.touches) {
					if ($scope.touches [i] === touch) {
						$scope.touches.splice(i, 1);
					}
				}
			} else {
				$scope.touch.$remove(function() {
					$location.path('touches');
				});
			}
		};

		// Update existing Touch
		$scope.update = function() {
			var touch = $scope.touch;

			touch.$update(function() {
				$location.path('touches/' + touch._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Touches
		$scope.find = function() {
      console.log('HEY!');
			$scope.touches = Touches.query();
      console.log('Touches: %o', $scope.touches);
		};

		// Find existing Touch
		$scope.findOne = function() {
			$scope.touch = Touches.get({ 
				touchId: $stateParams.touchId
			});
		};
	}
]);