var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/todo');

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

const todoSchema = new mongoose.Schema({ 
    content: String
});
const Task = mongoose.model('Task', todoSchema);

app.get('/', (req,res) => {
    Task.find((err,response) => {
        res.render('home.pug', {tasks: response});
    });
});

// app.get('/?:type:message', (req,res) => {
//     const params = req.params;
//     Task.find((err,response) => {
//         res.render('home.pug', {tasks: response, type: params.type, message: params.message});
//     });
// });

app.get('/new', (req,res) => {
    res.render('newTask.pug');
});

app.post('/new/:id', (req,res) => {
    console.log('Received a POST request!');
    var taskInfo = req.body;
    if(!taskInfo.content){
        res.render('newTask.pug', {message: "Error! Empty content box", type: "error"});
    }
    else {
        var newTask = new Task({
            content: taskInfo.content
        });
        newTask.save((err,Task) => {
            if(err) {
                res.render('newTask.pug', {message: 'Error in saving new task', type: 'error'});
            }
            else {
                console.log('New Task was created!');
                res.redirect('/');
            }
        });
    }
});

app.post('/delete/:id', (req,res) => {
    Task.findByIdAndRemove(req.body.id, (err, response) => {
        if(err) {
            console.log('Delete Error!');
            // set cooki ten la error++
            // res.cookie("error", "Delete error " + err.message);
            res.redirect("/?type=deleteError&message" + "Delete error");
            // Task.find((err,response) => {
            //     res.render('home.pug', {message: "Delete error!", type: "deleteError"});
            // });
        }
        else {
            console.log('1 Task was deleted!')
            // res.redirect("/?type=deleteError&message=" + "Delete error");
            res.redirect('/');
            // Task.find((err,response) => {
            //     res.render('home.pug', {tasks: response});
            // });
        }
    })
})

//Router when click on 'Edit' button
app.post('/edit', (req,res) => {
    //Render edit.pug with hidden ID and value = old task
    res.render('edit', {id: req.body.id, content: req.body.content});
})

app.post('/edit/:id', (req,res) => {
    var editContent = req.body;
    console.log('received edit Request!')
    if(!editContent.content){
        console.log('Error empty content edit');
        res.render('edit', {
            message: "Error! Empty Task's content.",
            type: "editError",
            id: editContent.id,
            content: editContent.content
        });
    }
    else {
        console.log(editContent.content , editContent.id);
        Task.findByIdAndUpdate(editContent.id, {
            content: editContent.content
        }, (err, response) => {
            if(err) {
                console.log('Error update');
                Task.find((err, response) => {
                    res.render('home.pug', {message: "Error in Update Task!", type: "editError", tasks: response});
                });
            }
            else {
                console.log('Edit successful task ' + '"' + editContent.content + '"');
                res.redirect('/');
            }
        });
    }
});

app.listen(8080);