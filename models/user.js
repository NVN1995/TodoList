var mongoose = require('mongoose');
var bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: false,  // one email can be used for multiple account
        required: true, 
        trim: true      // remove extra backspace in input data
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        require: true
    },
    passwordConfirm: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'biadmin'],
        default: 'user'             // add 'user' role for each user created
    }
});


//Hashing password + save to db
userSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
});

var User = mongoose.model('User', userSchema);
module.exports = User;

