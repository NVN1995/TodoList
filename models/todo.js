var mongoose = require('mongoose');


const todoSchema = new mongoose.Schema({
    content: String
});

const Task = mongoose.model('Task', todoSchema);

module.exports = Task;