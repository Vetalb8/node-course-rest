const {mongoose} = require('./../server/db/mongoose.js');
const Todo = require('./../server/models/todo');

// Todo.remove({})
Todo.remove({}).then((result) => {
	console.log(result)
});

// Todo.findOneAndRemove()
Todo.findOneAndRemove({_id: 'asdasd'}).then((todo) => {

});
// Todo.findByIdAndRemove()
Todo.findByIdAndRemove('asda').then((todo) => {
	console.log(todo)
});