const expect = require('expect');
const request = require('supertest');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = require('./../server');
const Todo = require('./../models/todo')


const todos = [{
	_id: mongoose.Types.ObjectId(),
	text: 'Fist test todo'
}, {
	_id: mongoose.Types.ObjectId(),
	text: 'Second test todo'
}]

describe('TODO', () => {
	beforeEach((done) => {
		Todo.remove({})
			.then(() => Todo.insertMany(todos))
			.then(() => done());
	});

	describe('POST /todos', () => {
		it('should create a new todo', (done) => {
			const text = 'Test todo text';

			request(app)
				.post('/todos')
				.send({text})
				.expect(200)
				.expect((res) => {
					expect(res.body.text).toBe(text);
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					Todo.find({ text }).then((todos) => {
						expect(todos.length).toBe(1);
						expect(todos[0].text).toBe(text);
						done();
					}).catch((e) => done(e))
				})
		})

		it('should not create todo with invalid body data', (done) => {
			request(app)
				.post('/todos')
				.send({})
				.expect(400)
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					Todo.find().then((todos) => {
						expect(todos.length).toBe(2);
						done()
					}).catch((e) => done(e))
				})
		})
	})

	describe('GET /todos', () => {
		it('should get all todos', (done) => {
			request(app)
				.get('/todos')
				.expect(200)
				.expect((res) => {
					expect(res.body.todos.length).toBe(2)
				})
				.end(done)
		})
	})

	describe('GET /todos/:todoId', () => {
		it('should get todo by id', (done) => {
			request(app)
				.get(`/todos/${todos[0]._id.toHexString()}`)
				.expect(200)
				.expect((res) => {
					expect(res.body.todo.text).toBe(todos[0].text);
				})
				.end(done)
		})

		it('should return 404 if todo not found', (done) => {
			const newTodoId = mongoose.Types.ObjectId().toHexString()

			request(app)
				.get(`/todos/${newTodoId}`)
				.expect(404)
				.end(done)
		})

		it('should return 404 for non-object ids', (done) => {
			request(app)
				.get('/todos/123abc')
				.expect(404)
				.end(done)
		})
	})

	describe('DELETE /todos/:todoId', () => {
		it('should remove a todo', (done) => {
			const id = todos[0]._id.toHexString();

			request(app)
				.delete(`/todos/${id}`)
				.expect(200)
				.expect((res) => {
					expect(res.body._id).toBe(id)
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					Todo.findById(id)
						.then((todo) => {
							expect(todo).toNotExist();
							done();
						})
						.catch((err) => done(err))
				})
		})

		it('should return 404 if todo not found', (done) => {
			const id = todos[0]._id.toHexString() + 'asd';

			request(app)
				.delete(`/todos/${id}`)
				.expect(404)
				.end(done)
		})

		it('should return 404 if object id is invalid', (done) => {
			const id = 'asdasd12';

			request(app)
				.delete(`/todos/${id}`)
				.expect(404)
				.end(done)
		})
	})
})
