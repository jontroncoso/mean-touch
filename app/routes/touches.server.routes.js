'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var touches = require('../../app/controllers/touches.server.controller');

	// Touches Routes
	app.route('/touches')
		.get(touches.list)
		.post(users.requiresLogin, touches.create);

	app.route('/touches/:touchId')
		.get(touches.read)
		.put(users.requiresLogin, touches.hasAuthorization, touches.update)
		.delete(users.requiresLogin, touches.hasAuthorization, touches.delete);

  app.route('/models')
    .get(touches.listModels);

	// Finish by binding the Touch middleware
	app.param('touchId', touches.touchByID);
};
