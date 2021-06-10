var express = require('express');
var app = express();
var router = express.Router();
var session = require('express-session');
var Task = require('../models/todo');
var User = require('../models/user');
var bcrypt = require('bcrypt');


//Middle ware check wrong session and update session if session.user available
app.use((req,res,next) => {
    //if session exist
    if(req.session.user) {
        User.findOne({username : req.session.user.username}, (err, response) => {
            if(err) {
                res.redirect('/login');
            }
            // wrong session.user.username => delete session
            if(!response) {
                req.session.reset();
                res.redirect('/login');
            }
            // user available -> Update user to session
            else {
                req.session.user = response;
            }
            next();
        })
    }
    // if session.user not exist -> Ignore
    else {
        next();
    }
})


//Middle ware check Login
function isLogedIn (req,res, next) {
    if(req.session.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

router.get('/', (req,res) => {
        res.render('hello');
});

router.get('/signup', (req,res) => {
    res.render('signup');
});

router.post('/signup', (req,res) => {
    var userInput = req.body;
    //Check password
    if (userInput.password !== userInput.passwordConfirm) {
        res.status(401);
        res.render('signup', {message : "passwords dont match"});
        return;
    }
    // Check empty fields
    if (!userInput.email || !userInput.username ||
        !userInput.password || !userInput.passwordConfirm) {
            res.status(401);
            res.render('signup', { message:"Fields cannot empty" });
            return;
    }
    User.findOne({ username: userInput.username }, (err, response) => {
        if(response) {
            res.status(401);
            res.render('signup', {message:"User already exists!"});
            return;
        }
        else {  
            var userData = new User({
                email: userInput.email,
                username: userInput.username,
                password: userInput.password,
            })
            userData.save((err, user) => {
                if(err) {
                    res.render('signup', { message:"Error saving user" });
                    return;
                }
                else {
                    req.session.user = user;
                    res.redirect('/home');
                }
            });
        }
    });
});

router.get('/login', (req,res) => {
    res.render('login');
});

router.post('/login', (req,res) => {
    var userInput = req.body;
    if(!userInput.username || !userInput.password) {
        res.render('login', {message : 'Fields can not Empty'});
        return;
    }
    User.findOne({username : userInput.username}, (err, user) => {
        if(err) {
            res.render('login', {message: 'Error login'});
        }
        if(!user) {
            res.render('login', {message: 'user not exist'});
        }
        else {
            if(bcrypt.compareSync(userInput.password, user.password)) {
                console.log('User Loged In !')
                req.session.user = user;
                res.redirect('/home');
            }
            else {
                res.render('login', {message: 'Password Error'});
            }
        }
    })
});

router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy((err) => {
        if(err) {
          return next(err);
        } else {
          console.log('User Loged Out !')
          return res.redirect('/');
        }
      });
    }
  });

router.get('/home', isLogedIn, (req,res) => {
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