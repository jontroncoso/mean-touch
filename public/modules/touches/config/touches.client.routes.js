'use strict';

//Setting up route
angular.module('touches').config(['$stateProvider',
	function($stateProvider) {
		// Touches state routing
		$stateProvider.
		state('listTouches', {
			url: '/touches',
			templateUrl: 'modules/touches/views/list-touches.client.view.html'
		}).
		state('createTouch', {
			url: '/touches/create',
			templateUrl: 'modules/touches/views/create-touch.client.view.html'
		}).
		state('viewTouch', {
			url: '/touches/:touchId',
			templateUrl: 'modules/touches/views/list-touches.client.view.html'
		}).
		state('editTouch', {
			url: '/touches/:touchId/edit',
			templateUrl: 'modules/touches/views/edit-touch.client.view.html'
		});
	}
]);