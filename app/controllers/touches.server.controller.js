'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Touch = mongoose.model('Touch'),
	_ = require('lodash');

/**
 * Create a Touch
 */
exports.create = function(req, res) {
	var touch = new Touch(req.body);
	touch.user = req.user;

	touch.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(touch);
		}
	});
};

/**
 * Show the current Touch
 */
exports.read = function(req, res) {
	res.jsonp(req.touch);
};

/**
 * Update a Touch
 */
exports.update = function(req, res) {
	var touch = req.touch ;

	touch = _.extend(touch , req.body);

	touch.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(touch);
		}
	});
};

/**
 * Delete an Touch
 */
exports.delete = function(req, res) {
	var touch = req.touch ;

	touch.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(touch);
		}
	});
};

exports.listModels = function(req,res) {
  var list = {};
  _.each(mongoose.modelNames(), function(e,i){
    list[e] = mongoose.model(e).schema.paths;
  });
  res.jsonp(list);
};

/**
 * List of Touches
 */
exports.list = function(req, res) { 
	Touch.find().sort('-created').populate('user', 'displayName').lean().exec(function(err, touches) {
    var touchList = {};
    var touch;
    if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
      _.each(mongoose.modelNames(), function(e){
        touch = touches.filter(function( t ) {
          return t.name === e;
        })[0];
        if(!touch)
        {
          touch = new Touch();
          touch.user = req.user;
          touch.name = e;
          touch.location = [Math.floor(Math.random() * (90)),Math.floor(Math.random() * (90))];
          touch.save(function(err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            }
          });
          touch = touch.toObject();
        }
        touch.modelData = mongoose.model(e).schema.paths;
        touchList[e] = touch;
      });

      res.jsonp(_.map(touchList, function(el) { return el; }));
		}
	});
};

/**
 * Touch middleware
 */
exports.touchByID = function(req, res, next, id) { 
	Touch.findById(id).populate('user', 'displayName').exec(function(err, touch) {
		if (err) return next(err);
		if (! touch) return next(new Error('Failed to load Touch ' + id));
		req.touch = touch ;
		next();
	});
};

/**
 * Touch authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  // // All are authorized for this proof of concept.
	//if (req.touch.user.id !== req.user.id) {
	//	return res.status(403).send('User is not authorized');
	//}
	next();
};
