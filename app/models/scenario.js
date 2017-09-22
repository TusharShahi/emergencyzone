var mongoose = require('mongoose');
var scenarioSchema = mongoose.Schema({
statement : String,
number : Number,
questions : [{statement : String, options : Array}],
answers : Array
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Scenario', scenarioSchema);
