
var express = require('express');
var app = express();

var session = require('express-session');

var mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
mongoose.set('useNewUrlParser',true);
mongoose.set('useCreateIndex',true);

var bodyParser = require('body-parser');
var todolistController = require('./controllers/todoController');

//Connect Mongodb by mongoose
mongoose.connect('mongodb://localhost/todo', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Successful connect database!')
});

//views engine
app.set('view engine', 'pug');
app.set('views', './views');

//static files
app.use(express.static('public'))

//bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Session
app.use(session({
    secret : "Secret key",
    resave: false,
    saveUninitialized: false
}));

//Controller
app.use('/', todolistController);

// App port
app.listen(8080);