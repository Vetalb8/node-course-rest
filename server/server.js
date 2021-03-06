require('./config/config')

const express = require('express');
const bodyParser = require('body-parser')
const _ = require('lodash');

const { mongoose } = require('./db/mongoose')
const Todo = require('./models/todo');
const User = require('./models/user');
const authenticate = require('./middleware/authenticate')

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
	const todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save()
		.then((doc) => {
			res.send(doc)
		})
		.catch((e) => {
			res.status(400).send(e)
		})
})

app.get('/todos', authenticate, (req, res) => {
	Todo.find({ _creator: req.user._id })
		.then(todos => todos.map((todo) => ({
			id: todo._id,
			text: todo.text,
			completed: todo.completed,
			completedAt: todo.completedAt
		})))
		.then(mapTodos => {
			res.send({
				todos: mapTodos
			})
		})
		.catch((err) => {
			res.status(400).send(e);
		})
})

app.get('/todos/:todoId', authenticate, (req, res) => {
	const id = req.params.todoId;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send('id is not valid')
	}

	Todo.findOne({
		_id: id,
		_creator: req.user._id
	})
		.then((todo) => {
			if (!todo) {
				return res.status(404).send();
			}

			res.send({ 
				todo: {
					id: todo._id,
					text: todo.text,
					completed: todo.completed,
					completedAt: todo.completedAt
				}
			});
		})
		.catch((err) => {
			res.status(400).send()
		})
})

app.delete('/todos/:todoId', authenticate, (req, res) => {
	const id = req.params.todoId;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send('id is not valid')
	}

	Todo.findOneAndRemove({
		_id: id,
		_creator: req.user._id,
	})
		.then((todo) => {
			if (!todo) {
				return res.status(404).send();
			}

			res.send(todo);
		})
		.catch((err) => {
			res.status(400).send();
		})
})

app.patch('/todos/:todoId', authenticate, (req, res) => {
	const id = req.params.todoId;
	const body = _.pick(req.body, ['text', 'completed']);

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send('id is not valid')
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	}
	else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOne({
		_id: id,
		_creator: req.user._id
	})
		.then((todo) => {
			if (!todo) {
				return res.status(404).send();
			}

			return todo.set(body).save()
		})
		.then((todo) => {
			res.send({ todo })
		})
		.catch((err) => {
			res.status(400).send()
		})
})

// POST /users
app.post('/users', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	const user = new User(body);

	user.save()
		.then(() => user.generateAuthToken())
		.then((token) => {
			res.header('x-auth', token).send(user)
		})
		.catch((e) => {
			res.status(400).send(e)
		})
})

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
})

app.post('/users/login', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body)
		.then((user) => {
			return user.generateAuthToken()
					.then((token) => {
						res.header('x-auth', token).send(user)
					})
		})
		.catch((err) => {
			res.status(400).send();
		})
})

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token)
		.then(() => {
			res.status(200).send()
		})
		.catch((err) => {
			res.status(400).send()
		})
})

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = app;
