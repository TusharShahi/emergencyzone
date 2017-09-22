var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../app/models/user');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    /*passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        //exists = 1;
        console.log("yaha");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                console.log("if ke andar exists");
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } 

            else
            {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.username    = username;
                newUser.local.password = newUser.generateHash(password);
                newUser.delegatecard = req.body.delegatecard;
                newUser.phonenumber = req.body.phonenumber;
                newUser.level = 1;
         
                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            } 
        });    

       /* User.findOne({'delegatecard' : delegatecard},function(err,user)
        {
            if (err)
                return done(err);

            // check to see if theres already a user with that delegate card
            if (user) {
                                console.log("if ke delegatecard andar exists");
                return done(null, false, req.flash('signupMessage', 'That delegate card details is already taken.'));
            } 

            else exists = 0;
       }); */
       //console.log(exists);
        /*if(exists == 0)
        {

        }
        else
        {
                    console.log('exist karta hai');
        }
        });
    })); */
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
      //  delegatecardField : 'delegatecard',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, /*delegatecard, */password, done) {

        exists = 0;
        // asynchronous
        // User.findOne wont fire unless data is sent back
       // process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne(/*{$or : [{ 'local.username' : username },{'req.body.delegatecard' : delegatecard}]}*/
            {'local.username' : username},
         function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That name is already taken.'));
            } else {

                exists = 1;
                // if there is no user with that email
                // create the user
       /*     if(exists == 1)
            {
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.username    = username;
                newUser.local.password = newUser.generateHash(password);
                       newUser.delegatecard = req.body.delegatecard;
                newUser.phonenumber = req.body.phonenumber;
                newUser.level = 1;
         // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }    */                
            }
            // });
       });

        User.findOne({'delegatecard' : req.body.delegatecard},function(err,user)
        {
               if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That delegatecard number is already in use.'));
            } else {
                if(exists == 1)
                {

                                    var newUser            = new User();

                // set the user's local credentials
                newUser.local.username    = username;
                newUser.local.password = newUser.generateHash(password);
                newUser.delegatecard = req.body.delegatecard;
                newUser.registrationnumber = req.body.registrationnumber;
                newUser.points = 0;
                newUser.phonenumber = req.body.phonenumber;
                newUser.level = 1;
                newUser.scenario = 1;
             // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });

                } }

        });

    }));


      passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, {message:  'No such user found.'}); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, { message: 'Incorrect password. Try again.'}); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));
};