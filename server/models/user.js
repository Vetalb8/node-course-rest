const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


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

UserSchema.pre('save', function (next) {
	const user = this;

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next()
			});
		})
	}
	else {
		next();
	}
	
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


UserSchema.methods.removeToken = function(token) {
	const user = this;

	return user.update({
		$pull: {
			tokens: {token}
		}
	})
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

UserSchema.statics.findByCredentials = function(userObject) {
	const User = this;

	return User.findOne({email: userObject.email})
		.then((user) => {
			if (!user) {
				return Promise.reject()
			}

			return new Promise((resolve, reject) => {
				bcrypt.compare(userObject.password, user.password, (err, result) => {
					if (result) {
						resolve(user);
					}
					reject();
				})
			})
		})
}

module.exports = mongoose.model('User', UserSchema);
