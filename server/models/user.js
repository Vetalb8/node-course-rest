const mongoose = require('mongoose');

const User = mongoose.model('User', {
	name: {
		type: String
	},
	email: {
		type: String,
		required: true,
		trim: true,
		minLength: 1
	}
})

module.exports = User;
