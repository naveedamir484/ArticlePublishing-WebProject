const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const https=require("https");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const IPinfo = require("node-ipinfo");
const sharp = require('sharp');
const bcrypt=require("bcrypt");
const _=require("lodash");

const app=express();
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())


///connect your mongoose database here /////
mongoose.connect("Enter your link here to add with database",{useNewUrlParser: true, useUnifiedTopology: true},err => {
                  console.log("Connected to MongoDB Successfully..")  });

// set up multer for storing uploaded files in upload folder
const storage = multer.diskStorage({
          destination: (req, file, cb) => { cb(null, 'uploads')},
          filename: (req, file, cb) => { cb(null, file.fieldname + '-' + Date.now())}  });

const upload = multer({ storage: storage });

//creating schema for the mongodb its similar to collection structure or blueprint;
const post= {  accountId: String,name:String, mainHeading: String,
              subHeading: String,paraOne: String,
              paraTwo: String,paraThree: String,tags: [String],
              date: String, time: String ,imgdata: Buffer };

const account= { fName: String,lName: String,email: String,
                birthDay: String,occupation: String,country: String,
                city: String,bio: String,gender: String,
                password: String,imgdata: Buffer };


// creating model for mongo db databaese
const Post=mongoose.model("Post",post);
const Account=mongoose.model("Account",account);

///weather attributes section and api request to get weather info ;
var loggedIn=false;
var globalId="";
var globalName="";
var city="Bareilly";
var country="India";
var temperature,imageURL;

const Wurl="https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+"generate your key from weather map to use this api and paste here"+"&units=metric#";

https.get(Wurl,function(resp2){
    resp2.on("data",function(data){
            temperature=JSON.parse(data).main.temp;
            imageURL="https://openweathermap.org/img/wn/"+JSON.parse(data).weather[0].icon+"@2x.png"; }) });



///////////////////////////////////// Change password ///////////////////////////////////

app.post('/changeP', function(req, res){

  if(loggedIn==true){

  console.log(req.body.CPass);

  bcrypt.hash(req.body.CPass, 5, function(err, hash) {

    Account.updateOne({_id:globalId},
    {password: hash}, function (err, docs)
     { res.redirect("/")});

      });

  }


});

///////////////////////////////////////////extrarequest  ////////////////////////////

app.get('/check/:email', function(req, res){

   const email=req.params["email"];

      Account.findOne({email:email},function(err,founduser){
          if(!err){
             if(founduser)res.json({check:"true"});
             else res.json({check:"false"});
            }
       });
});

app.get('/api', function(req, res){

      var sendId= loggedIn ? globalId : "" ;
      var name= loggedIn ? globalName : "" ;

      res.json({accntID:sendId,name:name});

});


app.get('/api2/:pass', function(req, res){

  if(loggedIn==true){

    const pass=req.params["pass"];

    Account.findOne({_id:globalId},function(err,founduser){
                    if(!err && founduser){
                        bcrypt.compare(pass, founduser.password, function(err, result) {
                          res.json({boolean:result});
                          console.log(result);  }); }
               });  }

});


///////////////////////////////////////////Login and log out area////////////////////////////

app.post("/login",function(req,res){

     var pass=req.body.pass;
     var email=req.body.email;

 Account.findOne({email:email},function(err,founduser){
         if(!err && founduser){
             bcrypt.compare(pass, founduser.password, function(err, result) {
                if(result==true){ loggedIn=true;
                                  globalId=founduser._id;
                                  globalName=founduser.fName;
                                  city=founduser.city;
                                  res.redirect("/articles/1"); }
        }); }
    });
});

app.get("/logout",function(req,res){

  loggedIn = false;
  globalId="";
  globalName="";
  city="Baeilly";
  res.redirect("/");

});


///////////////////////////////////////////Regestration////////////////////////////////

app.post("/registration",async function(req,res){

  var no=Math.floor((Math.random() * 5) + 1);
  var str= req.body.gender=="Male" ? "/uploads/m"+no : "/uploads/f"+no
  const img=fs.readFileSync(path.join(__dirname +str));

  bcrypt.hash(req.body.pass1, 5, function(err, hash) {

    var obj= new Account({
       fName: _.capitalize(req.body.fname),
       lName: _.capitalize(req.body.lname),
       email: req.body.email,
       birthDay: "1999-03-31",
       occupation: _.capitalize(req.body.occup),
       country: country,
       city:   city,
       bio: "My brain is broken down into two parts: Right & Left. Nothing is left in Right and Nothing in Right in Left Half...",
       gender: req.body.gender,
       password: hash,
       imgdata: img });

       obj.save(function (err){
         if(!err){
           loggedIn=true;
           globalId=obj._id;
           globalName=obj.fName;
           city=obj.city;
           res.redirect('/Account/'+globalId);
         } });

  });


});


///////////////////////////////////////////////Account/////////////////////////////////////////////////
app.get("/account/:ID",async function(req,res){

    const accntID=req.params["ID"];
    let val= await Post.find({accountId:accntID });

    Account.findOne({_id:accntID}, function(err,foundProfile){
         if(!err && foundProfile){
           res.render("P_account",{city:city,temp: temperature,
                     imageurl:imageURL,check:loggedIn,profile:foundProfile,posts:val.reverse()});}
          });


});


/////////////////////////////////////////////////myArticles and delete post////////////////////////////////

app.get("/myArticles/:ID",async function(req,res){

  if(loggedIn==true){

    const accntID=req.params["ID"];
    let val= await Post.find({accountId:accntID });

        res.render("P_myArticle",{city:city,temp: temperature,imageurl:imageURL,check:loggedIn,posts:val.reverse()});
  }
  else res.redirect("articles/1");


});

app.get("/myArticles/:ID/:postID", function(req,res){

  if(loggedIn==true){

    const postID=req.params["postID"];
    const accntID=req.params["ID"];

    Post.findByIdAndRemove(postID,function(err){
        if(!err)res.redirect("/myArticles/"+accntID);
      });
  }
  else res.redirect("articles/1");


});

/////////////////////////////////////////////////home get post///////////////////////////////////////////

app.get("/",function(req,res){

            res.render("P_home",{city:city,temp: temperature,imageurl:imageURL,check:loggedIn});
});


//////////////////////////////////////////////////articles get post//////////////////////////////////////
let doc,mod,pagecount,skip,limit;

app.get("/articles/:page",async function(req,res){

var page=req.params["page"];

if(page==1){  await Post.countDocuments({}, function( err, count){
              if(!err){ doc=count;mod=count%6;pagecount=Math.ceil(doc/6);} }); }

var b=pagecount-page+1;
if(mod==0)mod=6;
if(b==1){skip=0;limit=mod;}
else{skip=(b-2)*6+mod;limit=6;}

         Post.find({},function(err,foundPosts){
             if(!err && foundPosts){
                  foundPosts=foundPosts.reverse();
                  res.render("P_article",{city:city,temp: temperature,imageurl:imageURL,check:loggedIn,doc:doc,page:page,posts:foundPosts});
                } }).limit(limit).skip(skip);
});


app.get("/search/:keyword",async function(req,res){

  var key=req.params["keyword"];
  console.log(key);
  const regex = new RegExp(key, 'i')

  Post.find({mainHeading: {$regex: regex}},
               function(err,data) {
                 console.log(data);
                   res.render("P_article",{city:city,temp: temperature,imageurl:imageURL,check:loggedIn,doc:doc,page:0,posts:data});
               });

});

app.get("/search/tags/:keyword",async function(req,res){


  var key=req.params["keyword"];
  const regex =  RegExp(key, 'i');

  if(key=="All")res.redirect("/articles/1")

  Post.find({ tags: { "$in" : [regex]} },
               function(err,data) {
                   res.render("P_article",{city:city,temp: temperature,imageurl:imageURL,check:loggedIn,doc:doc,page:0,posts:data});
               });

});


//DONE///////////////////////////////////////////////////publish get post////////////////////////////////////////

app.get("/publish/:ID",function(req,res){

      if(loggedIn==true){

        const accntID=req.params["ID"];
        res.render("P_publish",{city:city,temp: temperature,imageurl:imageURL,check:loggedIn,accntID:accntID});
      }
      else res.redirect("articles/1");


});


app.post('/publish/:ID',async function(req, res){


const accntID=req.params["ID"];

//getting date //////////////////
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yy = today.getFullYear();
  var date =  dd + '/' + mm + '/' + yy;

//saparating tags///////////////////
str = req.body.tags.replace(/\r?\n|\r/g, "");
strArray = str.split("# ");

// fetching name imag from Account //////

  let val= await Account.findOne({_id:accntID });
  var name=val.fName+" "+val.lName+" ( "+val.gender+" )"

  var obj=new Post ({  accountId: accntID,
             name: val.fName+" "+val.lName+" ( "+val.gender+" )",
             mainHeading: _.capitalize(req.body.mainHeading),
             subHeading: _.capitalize(req.body.subHeading),
             paraOne: _.capitalize(req.body.paraOne),
             paraTwo: _.capitalize(req.body.paraTwo),
             paraThree: _.capitalize(req.body.paraThree),
             tags: strArray,
             date: date, time: req.body.time,
             imgdata: val.imgdata });

  obj.save(function (err){
      if(!err)res.redirect('/articles/1');
  });




});


//Done///////////////////////////////////////////////profile post get///////////////////////////////////////////

app.get("/profile/:ID",function(req,res){

  if(loggedIn==true){

    const accntID=req.params["ID"];
    Account.findOne({_id:accntID }, function(err,foundProfile){
        if(!err && foundProfile){
            res.render("P_profile",{city:city,temp: temperature,imageurl:imageURL,check:loggedIn,profile:foundProfile});}
        });
  }
  else res.redirect("/articles/1");
});


app.post('/profile/:ID', upload.single('image'),async function(req, res, next){

const accntID=req.params["ID"];

if(req.body.checkbox=="Checked"){

  await sharp(req.file.path)
     .resize(200, 200)
     .toFile(path.resolve(__dirname + '/uploads/profile'));
     fs.unlinkSync(req.file.path);

    const img=fs.readFileSync(path.join(__dirname + '/uploads/profile'));
    var namme=_.capitalize(req.body.fname)+" "+_.capitalize(req.body.lname)+" ( "+req.body.gender+" )";
    city=_.capitalize(req.body.city);
    globalName=_.capitalize(req.body.fname);

    Account.updateOne({_id:accntID},
    {fName: _.capitalize(req.body.fname),
     lName: _.capitalize(req.body.lname),
     email: req.body.email,
     birthDay: req.body.birthday,
     occupation: _.capitalize(req.body.occupation),
     country: _.capitalize(req.body.country),
     city: _.capitalize(req.body.city),
     bio: _.capitalize(req.body.bio),
     gender: req.body.gender,
     imgdata: img  }, function (err, docs) { console.log("Account Info Updated...");});

     await Post.updateMany({accountId:accntID},
     { name: namme,imgdata: img  },
     function (err, docs) {console.log("Post Info Updated..."); res.redirect('/profile/'+accntID);});

}
else{

    var namme=req.body.fname+" "+req.body.lname+" ( "+req.body.gender+" )";
    city=_.capitalize(req.body.city);
    globalName=_.capitalize(req.body.fname);

    Account.updateOne({_id:accntID},
    {fName: _.capitalize(req.body.fname),
     lName: _.capitalize(req.body.lname),
     email: req.body.email,
     birthDay: req.body.birthday,
     occupation: _.capitalize(req.body.occupation),
     country: _.capitalize(req.body.country),
     city: _.capitalize(req.body.city),
     bio: _.capitalize(req.body.bio),
     gender: req.body.gender }, function (err, docs) { console.log("Account Info Updated...");});

     await Post.updateMany({accountId:accntID},
     { name: namme },
     function (err, docs) {console.log("Post Info Updated...");res.redirect('/profile/'+accntID); });

}

});

////////////////////////////////////////////////////listening the ports////////////////////////////////////

app.listen( process.env.PORT || 3000,function()
{
  console.log("Server Has started Successfully ! ");
});
