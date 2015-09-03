'use strict';

(function() {
	// Touches Controller Spec
	describe('Touches Controller Tests', function() {
		// Initialize global variables
		var TouchesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Touches controller.
			TouchesController = $controller('TouchesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Touch object fetched from XHR', inject(function(Touches) {
			// Create sample Touch using the Touches service
			var sampleTouch = new Touches({
				name: 'New Touch'
			});

			// Create a sample Touches array that includes the new Touch
			var sampleTouches = [sampleTouch];

			// Set GET response
			$httpBackend.expectGET('touches').respond(sampleTouches);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.touches).toEqualData(sampleTouches);
		}));

		it('$scope.findOne() should create an array with one Touch object fetched from XHR using a touchId URL parameter', inject(function(Touches) {
			// Define a sample Touch object
			var sampleTouch = new Touches({
				name: 'New Touch'
			});

			// Set the URL parameter
			$stateParams.touchId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/touches\/([0-9a-fA-F]{24})$/).respond(sampleTouch);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.touch).toEqualData(sampleTouch);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Touches) {
			// Create a sample Touch object
			var sampleTouchPostData = new Touches({
				name: 'New Touch'
			});

			// Create a sample Touch response
			var sampleTouchResponse = new Touches({
				_id: '525cf20451979dea2c000001',
				name: 'New Touch'
			});

			// Fixture mock form input values
			scope.name = 'New Touch';

			// Set POST response
			$httpBackend.expectPOST('touches', sampleTouchPostData).respond(sampleTouchResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Touch was created
			expect($location.path()).toBe('/touches/' + sampleTouchResponse._id);
		}));

		it('$scope.update() should update a valid Touch', inject(function(Touches) {
			// Define a sample Touch put data
			var sampleTouchPutData = new Touches({
				_id: '525cf20451979dea2c000001',
				name: 'New Touch'
			});

			// Mock Touch in scope
			scope.touch = sampleTouchPutData;

			// Set PUT response
			$httpBackend.expectPUT(/touches\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/touches/' + sampleTouchPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid touchId and remove the Touch from the scope', inject(function(Touches) {
			// Create new Touch object
			var sampleTouch = new Touches({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Touches array and include the Touch
			scope.touches = [sampleTouch];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/touches\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTouch);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.touches.length).toBe(0);
		}));
	});
}());