var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));

app.get('/', (req,res) => {
    res.render('home.pug');
})


app.listen(8080);