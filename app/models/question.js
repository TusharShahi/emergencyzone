var mongoose = require('mongoose');
var questionSchema = mongoose.Schema({

number : Number,
statement : String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Question', questionSchema);
