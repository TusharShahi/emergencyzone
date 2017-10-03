var User            = require('../app/models/user');
//var Question = require('../app/models/question');
var express = require('express');
var Scenario = require('../app/models/scenario');


module.exports = function(app, passport) {

    // HOME PAGE (with login and signup links) ========
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

    // SIGN UP ============================

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/game', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages req.authInfo
    }));
    // GAME ================================
    app.get('/game',isLoggedIn,function(req,res)
    {
        if(req.user)
        {

            console.log(req.session['flag']);
                if(req.session['flag'] === undefined || req.session['flag'] === null)
            {       console.log("flag nahi h");          
              User.findOneAndUpdate(
             {'delegatecard' : req.user.delegatecard},{$set : {pointsfromscenario: 0,level: 1}},
                function(err,user)
                {           console.log("udpated");
                    if(err) throw err;
                var user2 = user;
                user2.level = 1;
                console.log("user ka level " + user2.level);
                 Scenario.findOne({'number' : user.scenario},function(err, scenario) {
                                  foundquestion = scenario.questions[0];
                                  console.log("questions1")
                         if(err)
                        {
                        throw err; 
                        }
                    res.render('game.ejs',
                        {
                            user : user2,
                            question : foundquestion,
                            scenario : scenario.statement
                        });
                });
         }); } 
            else
        {

              console.log("flag h");
              Scenario.findOne({'number' : req.user.scenario},function(err, scenario) {
                         if(err)
                        {
                            console.log("Error");
                        throw err; 
                        }
                
                    res.render('game.ejs',
                        {
                            user : req.user,
                            question : scenario.questions[req.user.level -1],
                            scenario : scenario.statement
                        });
                });

        }
    }  
      else
      {     console.log("yaha b");
        res.redirect('/');
    
    }
    });

    app.post('/submitanswer',isLoggedIn,function(req,res)
    {

        if(req.user)
        {   var val = req.body.foo;
            console.log(req.body.foo);
    //        console.log(req.user.delegatecard);
            User.findOne({'delegatecard' : req.user.delegatecard},function(err, user) {
//              console.log(req);
              userlevel =  user.level;
              userscenario = user.scenario;
              var flag;
              if(userscenario == req.user.scenario && req.user.level == val)
              {
                            console.log("koi cheating nahi");
                            console.log(req.body.submitanswer);
                            Scenario.findOne({'number' : req.user.scenario},function(err, scenario) {
            if(req.body.submitanswer == 'Skip')
            {
                console.log("no answer");
                flag = 0;
            }
            else if(req.body.submitanswer == 'Restart Scenario')
            {
                console.log("Restart");
                flag = null;
            }
            else if(scenario.answers[req.user.level-1] == req.body.submittedanswer)
            {
                console.log("correct answer");
                flag = 3;
            }
            else
            {
                console.log("wrong answer");
                flag = -1;
            }// });
              if(req.user.level == 10 && req.body.submitanswer != 'Restart Scenario')
                {            
            
                var p = req.user.pointsfromscenario;
                if(flag!=null)
                {
                    p = p + flag;
                }
                console.log("next scenario");
                User.findOneAndUpdate(
                {'delegatecard' : req.user.delegatecard},{$inc : {'points': p,'scenario' : 1},$set : {'level': 1,'pointsfromscenario' : 0}},
                function(err,user)
                {
                    if(err) throw err;
                    req.session['flag'] = flag;
                    res.redirect('/game');
            
                });
                }
            else if(req.user.level == 10)
            {
                console.log("Restarting scenario");

                        if(err) throw err;
                        req.session['flag'] = flag;

                            res.redirect('/game');

            }
            else
                {
                User.findOneAndUpdate(
                {'delegatecard' : req.user.delegatecard},{$inc : {'pointsfromscenario': flag,'level': 1}},function(err,user)
                {

                    if(err) throw err;
                    //console.log(user);
                    console.log("flag is "  + flag);
                    console.log("updated just level");
                    req.session['flag'] = flag;
                    req.session['level'] = req.user.level;
                    res.redirect('/game');
                });
             
                }
                    });
        }
        else
        {       console.log("chearing");
                console.log("sidha redirect");
                res.redirect('/game');
        }
                

              

        //console.log(res);
        } );

        }
        else
        {   console.log("redirect at 195");
            res.redirect('/');
        }

    });


// ===================== 
// ==== LEADER BOARD ==== 
// ===================== 

app.get('/leaderboard', function(req, res) {

    User.find().sort({points : -1}).limit(8).exec(function(err,docs)
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
        req.session['flag'] = null;
        console.log(req.user);

         User.findOneAndUpdate(
             {'delegatecard' : req.user.delegatecard},{$set : {pointsfromscenario: 0,level: 1}},
                function(err,user)
                {
                    if(err) throw err;
//                console.log(user);
                 });
                 
        req.logout();
        res.redirect('/');
    });

//====LOGIN==============
        app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/game', // redirect to the game
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    //======== REST OF REQUESTS ======
app.get('*', function(req, res){
      console.log("redirect at 258");
      console.log(req.originalUrl);
      if(req.originalUrl != '/favicon.ico')
  res.redirect('/');
});  
}; 

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}