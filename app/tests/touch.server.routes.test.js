'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Touch = mongoose.model('Touch'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, touch;

/**
 * Touch routes tests
 */
describe('Touch CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Touch
		user.save(function() {
			touch = {
				name: 'Touch Name'
			};

			done();
		});
	});

	it('should be able to save Touch instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Touch
				agent.post('/touches')
					.send(touch)
					.expect(200)
					.end(function(touchSaveErr, touchSaveRes) {
						// Handle Touch save error
						if (touchSaveErr) done(touchSaveErr);

						// Get a list of Touches
						agent.get('/touches')
							.end(function(touchesGetErr, touchesGetRes) {
								// Handle Touch save error
								if (touchesGetErr) done(touchesGetErr);

								// Get Touches list
								var touches = touchesGetRes.body;

								// Set assertions
								(touches[0].user._id).should.equal(userId);
								(touches[0].name).should.match('Touch Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Touch instance if not logged in', function(done) {
		agent.post('/touches')
			.send(touch)
			.expect(401)
			.end(function(touchSaveErr, touchSaveRes) {
				// Call the assertion callback
				done(touchSaveErr);
			});
	});

	it('should not be able to save Touch instance if no name is provided', function(done) {
		// Invalidate name field
		touch.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Touch
				agent.post('/touches')
					.send(touch)
					.expect(400)
					.end(function(touchSaveErr, touchSaveRes) {
						// Set message assertion
						(touchSaveRes.body.message).should.match('Please fill Touch name');
						
						// Handle Touch save error
						done(touchSaveErr);
					});
			});
	});

	it('should be able to update Touch instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Touch
				agent.post('/touches')
					.send(touch)
					.expect(200)
					.end(function(touchSaveErr, touchSaveRes) {
						// Handle Touch save error
						if (touchSaveErr) done(touchSaveErr);

						// Update Touch name
						touch.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Touch
						agent.put('/touches/' + touchSaveRes.body._id)
							.send(touch)
							.expect(200)
							.end(function(touchUpdateErr, touchUpdateRes) {
								// Handle Touch update error
								if (touchUpdateErr) done(touchUpdateErr);

								// Set assertions
								(touchUpdateRes.body._id).should.equal(touchSaveRes.body._id);
								(touchUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Touches if not signed in', function(done) {
		// Create new Touch model instance
		var touchObj = new Touch(touch);

		// Save the Touch
		touchObj.save(function() {
			// Request Touches
			request(app).get('/touches')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Touch if not signed in', function(done) {
		// Create new Touch model instance
		var touchObj = new Touch(touch);

		// Save the Touch
		touchObj.save(function() {
			request(app).get('/touches/' + touchObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', touch.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Touch instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Touch
				agent.post('/touches')
					.send(touch)
					.expect(200)
					.end(function(touchSaveErr, touchSaveRes) {
						// Handle Touch save error
						if (touchSaveErr) done(touchSaveErr);

						// Delete existing Touch
						agent.delete('/touches/' + touchSaveRes.body._id)
							.send(touch)
							.expect(200)
							.end(function(touchDeleteErr, touchDeleteRes) {
								// Handle Touch error error
								if (touchDeleteErr) done(touchDeleteErr);

								// Set assertions
								(touchDeleteRes.body._id).should.equal(touchSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Touch instance if not signed in', function(done) {
		// Set Touch user 
		touch.user = user;

		// Create new Touch model instance
		var touchObj = new Touch(touch);

		// Save the Touch
		touchObj.save(function() {
			// Try deleting Touch
			request(app).delete('/touches/' + touchObj._id)
			.expect(401)
			.end(function(touchDeleteErr, touchDeleteRes) {
				// Set message assertion
				(touchDeleteRes.body.message).should.match('User is not logged in');

				// Handle Touch error error
				done(touchDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Touch.remove().exec();
		done();
	});
});