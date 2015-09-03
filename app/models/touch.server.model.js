'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Touch Schema
 */
var TouchSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Touch name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Touch', TouchSchema);