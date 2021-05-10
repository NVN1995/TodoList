var express = require('express');
var router = express.Router();
var Task = require('../models/todo')

router.get('/', (req,res) => {
    Task.find((err, response) => {
        res.render('home', {tasks: response});
    });
});

router.post('/create', (req,res) => {
    var newTaskInfo = req.body;
    if(!newTaskInfo.content) {
        Task.find((err, response) => {
            res.render('home', {message: "Error! Empty content of new task!", type: "createError", tasks: response});
        });
    }
    else {
        var newTask = new Task ({
            content: newTaskInfo.content
        });
        newTask.save((err, Task) => {
            if(err) {
                Task.find((err, response) => {
                    res.render('home', {message: "Error! Cannot save this task!", type: "createError", tasks: response});
                });
            }
            else {
                res.redirect('/home');
            }
        });
    }
});

router.post('/delete', (req,res) => {
    var id = req.body.id
    Task.findByIdAndRemove(id, (err, response) => {
        if(err) {
            Task.find((err, response) => {
                res.render('home', {message: "Delete Error!", type: "deleteError", tasks: response});
            });
        }
        else {
            res.redirect('/home');
        }
    })
})

router.post('/edit', (req,res) => {
    res.render('edit', {
        content: req.body.content,
        id : req.body.id
    });
});

router.post('/edit/:id', (req,res) => {
    var updateContent = req.body;
    if(!updateContent.content) {
        res.render('edit', {
            message: "Error! Empty edit content!", 
            type: "editError",
            id: updateContent.id,
            content: updateContent.content
        });
    }
    else {
        Task.findByIdAndUpdate(updateContent.id, {
            content: updateContent.content
        }, (err, response) => {
            if(err) {
                res.render('edit', {
                    message: "Error! Error update content!", 
                    type: "editError",
                    id: updateContent.id,
                    content: updateContent.content
                });
            } 
            else {
                res.redirect('/home');
            }
        });
    }
})



module.exports = router;