var User            = require('../app/models/user');
//var Question = require('../app/models/question');
var express = require('express');
var Scenario = require('../app/models/scenario')
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
                console.log(req.sessionStore.sessions);
                console.log("----");
                console.log(req.sessionStore.sessions.cookie);
                console.log("----");
                console.log(req.flash("error"));                
                if(req.flash("error")[0])
                {
                errormessage = req.flash("error")[0];  
                }
                else
                {
                errormessage="";
                }
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
            
//            console.log(req.session);

//            console.log(req.session.flag);
        if(!req.session.flag) flag = null;
        else flag = req.session.flag;

        console.log(flag);
       /* if(req.query.flag)
        {
            console.log('flag is there');
            console.log(req.query.flag);
        } */
        if(req.user)
        {var foundquestion = "kutta";
        Scenario.findOne({'number' : req.user.scenario},function(err, scenario) {
            // if there are any errors, return the error
          /*  if (err){
              console.log("nahi mil gaya");
                return done(err); }
            // check to see if theres already a user with that email
            else { */
             // console.log("mil gaya");
           //   console.log(scenario);
              foundquestion = scenario.questions[req.user.level-1];
            //} 
            // });
  //          console.log(foundquestion);
            //  console.log(flash('error'));
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
            // if there are any errors, return the error
           // console.log(foundquestion);
            //          console.log(flash('error'));
         //   console.log("submitted answer " + req.body.submittedanswer);
           // console.log("actual answer " + scenario.answers[req.user.level-1]);
            if(scenario.answers[req.user.level-1] == req.body.submittedanswer)
            {
             //   console.log("correct answer");
                flag = 3;
            }
            else if(req.body.submittedanswer == "")
            {
               // console.log(req.body);
                //console.log("no answer");
                flag = 0;
            }
            else
            {
              //  console.log(req.body);
             //   console.log("wrong answer");
                flag = -1;
            }
        //console.log(res);
        // look and update the score of the player
        // if the the question was the last question change scenario
            if(req.user.level == 10)
            {            

            User.findOneAndUpdate(
            {'delegatecard' : req.user.delegatecard},{$inc : {points: flag,scenario : 1},$set : {level: 1}},
            function(err,user)
            {
                if(err) throw err;
                //console.log(user);
                //console.log("updated");
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

/*    app.get('/changescenario',isLoggedin,function(req,res){

        if(req.user)
        {

        User.findOneAndUpdate(
        {'delegatecard' : req.user.delegatecard},{$inc : {delegatecard: 1}},function(err,user)
        {

          console.log(user);

        });


        }

        else
        {
            res.redirect('/');
        }

        });

*/

// ===================== 
// ==== LEADER BOARD ==== 
// ===================== 

app.get('/leaderboard', function(req, res) {

    User.find().sort({points : -1}).limit(20).exec(function(err,docs)
                                { 
            var array = [];
  //          console.log(docs);
            docs.forEach(function(user)
            {
                
            console.log(user.points);
              array.push({name : user.local.username, points : user.points, delegatecard : user.delegatecard });
                console.log("-----");                
      });      

                console.log("-----");     
   console.log(array);    
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
//    app.use(function(req, res) {
 //   res.redirect('/')
//});    

};

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
