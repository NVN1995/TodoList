var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: false,
        required: true,
        trim: true
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
        require: true
    }
});

//Authenticate Input
userSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({email: email})
      .exec(function (err, user) {
        if(err) {
          return callback(err);
        }
        else if(!user) {
          var err = new Error ('User Not Found.');
          err.status = 401; 
          return callback(err);
        }
        bcrypt.compare(password, user.password, function(err, result) {
          if(result = true) {
            return callback(null, user);
          }
          else {
            return callback();
          }
        })
      });
}

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