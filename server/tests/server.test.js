const expect = require('expect');
const request = require('supertest');
const mongoose = require('mongoose');
const _ = require('lodash');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


const app = require('./../server');
const Todo = require('./../models/todo');
const User = require('./../models/user')


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('TODO', () => {
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
			const id = todos[0]._id.toHexString() + '123';

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

	describe('PUTCH /todos/:todoId', () => {
		it('should update the todo', (done) => {
			const id = todos[0]._id.toHexString()
			const text = 'This should be the new text'

			request(app)
				.patch(`/todos/${id}`)
				.send({
					completed: true,
					text,
				})
				.expect(200)
				.expect((res) => {
					expect(res.body.todo.text).toBe(text);
					expect(res.body.todo.completed).toBe(true);
					expect(res.body.todo.completedAt).toBeA('number');
				})
				.end(done)
		})

		it('should clear completedAt when todo is not completed', (done) => {
			const id = todos[1]._id.toHexString()
			const text = 'This should be the new text!!'

			request(app)
				.patch(`/todos/${id}`)
				.send({
					completed: false,
					text,
				})
				.expect(200)
				.expect((res) => {
					expect(res.body.todo.text).toBe(text);
					expect(res.body.todo.completed).toBe(false);
					expect(res.body.todo.completedAt).toNotExist();
				})
				.end(done)
		})
	})

	describe('GET /users/me', () => {
		it('should return user if authentificate', (done) => {
			request(app)
				.get('/users/me')
				.set('x-auth', users[0].tokens[0].token)
				.expect(200)
				.expect((res) => {
					expect(res.body._id).toBe(users[0]._id.toHexString());
					expect(res.body.email).toBe(users[0].email);
				})
				.end(done)
		})

		it('should return 401 if not authentificated', (done) => {
			request(app)
				.get('/users/me')
				.expect(401)
				.expect((res) => {
					expect(res.body).toEqual({})
				})
				.end(done)
		})
	})

	describe('POST /users', () => {
		it('should create user', (done) => {
			const expectedUser = {
				email: 'user1@test.com',
				password: 'fsw123'
			}

			request(app)
				.post('/users')
				.send(expectedUser)
				.expect(200)
				.expect((res) => {
					expect(res.headers['x-auth']).toExist();
					expect(res.body._id).toExist();
					expect(res.body.email).toBe(expectedUser.email);
				})
				.end((err) => {
					if(err) {
						return done(err);
					}

					User.findOne({email: expectedUser.email})
						.then((user) => {
							expect(user).toExist();
							expect(user.password).toNotBe(expectedUser.password)
							done()
						})
				})
		})

		it('should return validation errors if request invalid', (done) => {
			const expectedUser = {
				email: 'user1@test.com',
				password: 'fsw'
			}

			request(app)
				.post('/users')
				.send(expectedUser)
				.expect(400)
				.end(done)
		})

		it('should not create user if email exist', (done) => {
			request(app)
				.post('/users')
				.send({
					email: users[0].email,
					password: users[0].password
				})
				.expect(400)
				.end(done)

		})
	});
})
