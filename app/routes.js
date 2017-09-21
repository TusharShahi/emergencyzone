var User            = require('../app/models/user');
var Question = require('../app/models/question');
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login and signup links) ========
    // =====================================
    app.get('/',function(req, res) {
      if(req.user)
      {
      res.redirect('/game');
      }
  
        else
            res.render('homepage.ejs')
    });

    // ====================================
    // SIGN UP ============================
    // ====================================

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/game', // redirect to the secure profile section
        failureRedirect : '/xxx', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // GAME ================================
    // =====================================

    app.get('/game',isLoggedIn,function(req,res)
    {
            
        if(req.user)
        {var foundquestion = "kutta";
  Question.findOne({'number' : req.user.level},function(err, question) {
            // if there are any errors, return the error
          /*  if (err){
              console.log("nahi mil gaya");
                return done(err); }
            // check to see if theres already a user with that email
            else { */
              console.log("mil gaya");
              console.log(question);
              foundquestion = question;
            //} 
            // });
       
            console.log(foundquestion);
//          console.log(flash('error'));
            res.render('game.ejs',
        {
            user : req.user,
            //level : req.user.level,
            // get the user out of session and pass to template
        question : foundquestion.statement}/*,function(err,html)
        {
          if(err) return err;
        }*/);
        //console.log(res);
        } );
        }
      else
        res.redirect('/');
        //res.render('homepage.ejs');

    });





// ===================== 
// ==== LEADER BOARD ==== 
// ===================== 

app.get('/leaderboard', function(req, res) {
      res.render('leaderboard.ejs'); 
    });

        // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


//=======================
//====LOGIN==============
//=======================


        app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/game', // redirect to the game
        failureRedirect : '/homepage', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    //================================
    //======== REST OF REQUESTS ======
    //================================
    app.use(function(req, res) {
    res.redirect('/')
});    

};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
