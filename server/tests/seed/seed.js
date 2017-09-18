const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Todo = require('./../../models/todo');
const User = require('./../../models/user');

const todos = [{
	_id: new mongoose.Types.ObjectId,
	text: 'Fist test todo'
}, {
	_id: new mongoose.Types.ObjectId,
	text: 'Second test todo'
}]

const userOneId = new mongoose.Types.ObjectId;
const userTwoId = new mongoose.Types.ObjectId;
const users = [{
	_id: userOneId,
	email: 'vet@mail.ru',
	password: 'password1',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneId, access: 'auth'}, 'qwerty').toString()
	}]
}, {
	_id: userTwoId,
	email: 'olya@mail.ru',
	password: 'password2'
}];

const populateTodos = (done) => {
	Todo.remove({})
		.then(() => Todo.insertMany(todos))
		.then(() => done());
};

const populateUsers = (done) => {
	User.remove({})
		.then(() => {
			let userOne = new User(users[0]).save();
			let userTwo = new User(users[1]).save();

			return Promise.all([userOne, userTwo])
		})
		.then(() => done());
}

module.exports = {
	todos,
	users,
	populateTodos,
	populateUsers,
}
