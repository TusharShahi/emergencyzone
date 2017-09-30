var User            = require('../app/models/user');
//var Question = require('../app/models/question');
var express = require('express');
var Scenario = require('../app/models/scenario');


module.exports = function(app, passport) {

//app.use(express.static(__dirname+'/public'));


    // =====================================
    // HOME PAGE (with login and signup links) ========
    // =====================================
    app.get('/',function(req, res) {
      if(req.user)
      {
      res.redirect('/game');
      }
  
        else
            {   
                var errormessage = req.flash("error");
                res.render('homepage.ejs',{error : errormessage//function()
                    //{
                         //   while(true);
                    }
                    ); 
                
            }


    });

    // ====================================
    // SIGN UP ============================
    // ====================================

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/game', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages req.authInfo
    }));

  
    // =====================================
    // GAME ================================
    // =====================================

    app.get('/game',isLoggedIn,function(req,res)
    {
        flag = req.session['flag'];
        req.session['flag'] = 0;
        if(req.user)
        {
            //var foundquestion = "kutta";
        Scenario.findOne({'number' : req.user.scenario},function(err, scenario) {
              foundquestion = scenario.questions[req.user.level-1];
            res.render('game.ejs',
        {
            user : req.user,
            question : foundquestion,
            scenario : scenario.statement,
            flag : flag}/*,function(err,html)
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

    app.post('/submitanswer',isLoggedIn,function(req,res)
    {

        if(req.user)
        {

            Scenario.findOne({'number' : req.user.scenario},function(err, scenario) {
            if(req.body.submitanswer == 'Skip')
            {
                flag = 0;
            }
            else if(scenario.answers[req.user.level-1] == req.body.submittedanswer)
            {
             //   console.log("correct answer");
                flag = 3;
            }
            else
            {
                flag = -1;
            }
            if(req.user.level == 10)
                {            

                User.findOneAndUpdate(
                {'delegatecard' : req.user.delegatecard},{$inc : {points: flag,scenario : 1},$set : {level: 1}},
                function(err,user)
                {
                    if(err) throw err;
                    req.session['flag'] = flag;
                    res.redirect('/game');
            
                });
                }
            else
                {
                User.findOneAndUpdate(
                {'delegatecard' : req.user.delegatecard},{$inc : {points: flag,level: 1}},function(err,user)
                {

                    if(err) throw err;
                    //console.log(user);
                    //console.log("updated just level");
                    req.session['flag'] = flag;
                    res.redirect('/game');
                });
             
                }
            } );
        }
        else
        {
            res.redirect('/');
        }

    });


// ===================== 
// ==== LEADER BOARD ==== 
// ===================== 

app.get('/leaderboard', function(req, res) {

    User.find().sort({points : -1}).limit(10).exec(function(err,docs)
                                { 
            var array = [];
            docs.forEach(function(user)
            {
              array.push({name : user.local.username, points : user.points, delegatecard : user.delegatecard });
      });      

    res.render('leaderboard.ejs',{users: array}); 
                                });             

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
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
        //failwithError : true
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