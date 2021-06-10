
var express = require('express');
var app = express();

var session = require('express-session');
var cookieParser = require('cookie-parser');

var mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
mongoose.set('useNewUrlParser',true);
mongoose.set('useCreateIndex',true);

var bodyParser = require('body-parser');
var todolistController = require('./controllers/todoController');


mongoose.connect('mongodb://localhost/todo', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Successful connect database!')
});


app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(cookieParser());
app.use(session({
    secret : "Secret key",
    resave: false,
    saveUninitialized: false
}));





// app.get('/testsession', (req,res) => {
//     if(req.session.views) {
//         req.session.views += 1;
//         res.send("You visited this page " + req.session.views + " times");
//     }
//     else {
//         req.session.views = 1;
//         res.send("Welcome to this page for the first time!");
//     }
// });


app.use('/', todolistController);




app.listen(8080);