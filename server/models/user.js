const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: 'Укажите email',
		minlength: 1,
		unique: true,
		validate: {
			isAsync: true,
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		},
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({_id: user._id.toHexString(), access}, 'qwerty').toString();

	user.tokens.push({access, token});

	return user.save()
			.then(() => token)
};

UserSchema.statics.findByToken = function(token) {
	const User = this;
	let decoded = null;

	try {
		decoded = jwt.verify(token, 'qwerty')
	} catch (err) {
		return Promise.reject()
	}

	return User.findOne({
		_id: decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	})
}

module.exports = mongoose.model('User', UserSchema);
