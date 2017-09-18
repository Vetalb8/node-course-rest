require('./config/config')

const express = require('express');
const bodyParser = require('body-parser')
const _ = require('lodash');

const { mongoose } = require('./db/mongoose')
const Todo = require('./models/todo');
const User = require('./models/user');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	const todo = new Todo({
		text: req.body.text
	});

	todo.save()
		.then((doc) => {
			res.send(doc)
		})
		.catch((e) => {
			res.status(400).send(e)
		})
})

app.get('/todos', (req, res) => {
	Todo.find()
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

app.get('/todos/:todoId', (req, res) => {
	const id = req.params.todoId;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send('id is not valid')
	}

	Todo.findById(id)
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

app.delete('/todos/:todoId', (req, res) => {
	const id = req.params.todoId;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).send('id is not valid')
	}

	Todo.findByIdAndRemove(id)
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

app.patch('/todos/:todoId', (req, res) => {
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

	Todo.findById(id)
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

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = app;
