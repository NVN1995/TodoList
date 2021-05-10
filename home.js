
var express = require('express');
var app = express();
var mongoose = require('mongoose');
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

app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req,res) => {
    res.redirect('/home');
})

app.use('/home', todolistController);


app.listen(8080);