'use strict';

//Touches service used to communicate Touches REST endpoints
angular.module('touches').factory('Touches', ['$resource',
	function($resource) {
		return $resource('touches/:touchId', { touchId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);