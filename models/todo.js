var mongoose = require('mongoose');


const todoSchema = new mongoose.Schema({
    // using 'user' for searching tasks for each user
    user: String,
    content: String
});

const Task = mongoose.model('Task', todoSchema);

module.exports = Task;