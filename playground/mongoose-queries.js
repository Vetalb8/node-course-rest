const {mongoose} = require('./../server/db/mongoose.js');
const Todo = require('./../server/models/todo');

const id = '59be4b7cd79b06615e897308';

Todo.find({
	_id: id
}).then((todos) => {
	console.log('Todos', todos);
});

Todo.findOne({
	_id: id
}).then((todo) => {
	console.log('Todo', todo)
})

Todo.findById(id).then((todo) => {
	if (!todo) {
		return console.log('Id not found')
	}
	console.log('Todo by id', todo)
}).catch((err) => console.log(err))