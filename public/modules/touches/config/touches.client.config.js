'use strict';

// Configuring the Articles module
angular.module('touches').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Touches', 'touches', 'dropdown', '/touches(/create)?');
		Menus.addSubMenuItem('topbar', 'touches', 'List Touches', 'touches');
		Menus.addSubMenuItem('topbar', 'touches', 'New Touch', 'touches/create');
	}
]);