const express = require('express');
const bodyParser = require('body-parser')

const { mongoose } = require('./db/mongoose')
const Todo = require('./models/todo');
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = app;
