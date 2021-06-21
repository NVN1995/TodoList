var express = require('express');
var app = express();
var router = express.Router();
var session = require('express-session');
var Task = require('../models/task');
var User = require('../models/user');
var { ROLE, adminUser } = require('../models/role');
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
    //if loged in => session available
    if(req.session.user) {
        next();
    }
    //if session not exist => back to login page
    else {
        res.redirect('/login');
    }
}

//Router '/'
router.get('/', (req,res) => {
    // if any user loged in
    if(req.session.user) {
        // when user is Admin
        if(req.session.user.username === 'admin') {
            return res.redirect('/admin');
        }
        // normal user
        return res.redirect('/home');
    }
    // it's not user
    else {
        return res.render('hello');
    }
});

//Click 'sign up' => sign up page
router.get('/signup', (req,res) => {
    res.render('signup');
});

//Router for register
router.post('/signup', (req,res) => {
    var userInput = req.body;
    //Check password confirm typing
    if (userInput.password !== userInput.passwordConfirm) {
        res.status(401);
        // send sign up page with err message
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
    // all fields was accepted => Check user condition
    User.findOne({ username: userInput.username }, (err, response) => {
        // If user already exist
        if(response) {
            res.status(401);
            res.render('signup', {message:"User already exists!"});
            return;
        }
        // If user input not available in database
        else {  
            // Insert a new user
            var userData = new User({
                email: userInput.email,
                username: userInput.username,
                password: userInput.password,
            })
            // Save new user to database
            userData.save((err, user) => {
                // If saving error
                if(err) {
                    res.render('signup', { message:"Error saving user" });
                    return;
                }
                // Saving success => create session data for browser
                else {
                    req.session.user = user;
                    res.redirect('/home');
                }
            });
        }
    });
});

// Click 'login' => load login Page
router.get('/login', (req,res) => {
    res.render('login');
});

// Router log in
router.post('/login', (req,res) => {
    var userInput = req.body;
    //Check empty fields
    if(!userInput.username || !userInput.password) {
        res.render('login', {message : 'Fields can not Empty'});
        return;
    }
    // See if this input match database's user data
    User.findOne({username : userInput.username}, (err, user) => {
        // If error in finding user
        if(err) {
            res.render('login', {message: 'Error login'});
        }
        // If user doesn't exist
        if(!user) {
            res.render('login', {message: 'user not exist'});
        }
        // if user match database's user data
        else {
            // Checking password by bcrypt module
            if(bcrypt.compareSync(userInput.password, user.password)) {
                // If matching => create session data for browser
                req.session.user = user;
                // Create announcement in server
                console.log('User ' + req.session.user.username + ' Loged In !')
                // Sending successful status code
                res.status(200);
                // If user is Admin => go to admin page
                if(req.session.user.username === 'admin') {
                    return res.redirect('/admin');
                }
                // If not Admin user => go to home page
                return res.redirect('/home');
            }
            // If password not matchs => back to login page with an error message
            else {
                res.render('login', {message: 'Password Error'});
            }
        }
    })
});


// Router log out
router.get('/logout', function(req, res, next) {
    // If user is existing
    if (req.session.user) {
        console.log( 'User ' + req.session.user.username +  ' Loged Out !')
        // delete session object
        req.session.destroy((err) => {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
    // If user unavailable
    else {
        return res.redirect('/');
    }
});



// Router showing tasks of each user
router.get('/home', isLogedIn, (req,res) => {
    // Finding user's tasks base on username field in session's data
    Task.find({user: req.session.user.username}, (err, tasks) => {
        if(err) {
            res.status(404, 'Tasks not found');
            return;
        }
        // Render home page and send tasks we just found to showing
        else {
            res.render('home', {tasks: tasks});
        }
    })
});


// Router create new Task
router.post('/create', isLogedIn, (req,res) => {
    var newTaskInfo = req.body;
    // Check empty content task
    if(!newTaskInfo.content) {
        Task.find((err, tasks) => {
            res.render('home', {
                message: "Error! Empty content of new task!", 
                type: "createError", 
                tasks: tasks
            });
        })
    }
    // Insert a new Task
    else {
        var newTask = new Task ({
            // use 'username' field in current session
            user: req.session.user.username,
            // use 'content' in request
            content: newTaskInfo.content
        });
        // Save new task to database
        newTask.save((err, Task) => {
            if(err) {
                res.status(401);
                return redirect('/home');
            }
            else {
                res.redirect('/home');
            }
        });
    }
});


//Router Delete Task
router.post('/delete', isLogedIn, (req,res) => {
    var id = req.body.id
    // Finding and deleting task
    Task.findByIdAndRemove(id, (err, response) => {
        // if error => back to home page with error message
        if(err) {
            Task.find((err, tasks) => {
                res.render('home', {
                    message: "Delete Error!", 
                    type: "deleteError", 
                    tasks: tasks
                });
            });
        }
        else {
            res.redirect('/home');
        }
    })
})

/*  Click 'edit' button => render edit page 
    with content and id from each tasks in home page */
router.post('/edit', (req,res) => {
    res.render('edit', {
        content: req.body.content,
        id : req.body.id
    });
});

//Router edit
router.post('/edit/:id', isLogedIn, (req,res) => {
    var updateContent = req.body;
    // Check empty edit content
    if(!updateContent.content) {
        // reload edit page with error message
        res.render('edit', {
            message: "Error! Empty edit content!", 
            type: "editError",
            // attach id and content for the next edit time after error
            id: updateContent.id,
            content: updateContent.content
        });
    }
    // Find and update task in database
    else {
        Task.findByIdAndUpdate(updateContent.id, 
            {content: updateContent.content},
            (err, response) => {
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


//Middleware check admin user
function isAdmin (req,res, next) {
    if( req.session.user.role === 'biadmin') {
        next();
    }
    else {
        res.status(403);
        res.redirect('/home');
    }
}

// Router '/admin'
router.get('/admin',isLogedIn, isAdmin, (req,res) => {
    console.log('Admin Loged In!');
    // Finding and showing users
    User.find((err,users) => {
        if(err) {
            // Back to login page
            res.status(401);
            res.redirect('login');
            return;
        }
        else{
            // render admin page and attach users just found to showing
            res.render('adminpage', {users: users});
        }
    })
})

//Router delete user (on admin page)
router.post('/deleteuser',isLogedIn, isAdmin, (req,res) => {
    var id = req.body.id
    // Remove user by id and redirect to admin page
    User.findByIdAndRemove(id, (err, response) => {
        if(err) {
            User.find((err,users) => {
                res.render('adminpage', 
                    {message: "Delete Error!", 
                    type: "deleteError", 
                    users: users
                });
            return;
            })
        }
        else {
            res.redirect('/admin');
        }
    })
})



module.exports = router;