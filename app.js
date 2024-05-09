
const path         = require('path');
const multer       = require("multer");
const express      = require("express");
const bodyParser   = require("body-parser");
const cookieParser = require('cookie-parser');


require('dotenv').config();
const connectToDB = require('./src/database');
const {verifyToken} = require('./src/auth');
const {getWeather}   = require('./src/weather');

const app=express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

require('dotenv').config();
connectToDB()


const {sessionLogin, 
       sessionLogout, 
       registerAccount, 
       fetchAccount, 
       checkEmail, 
       changePassword,
       matchPassword,
       updateProfile,
       fetchArticles,
       removeArticles,
       searchArticlesbyKeyword,
       searchArtilesbyTag,
       getPublishPage,
       pubilshArticle,
       fetchProfile,
       fetchAllArticles,
       getHomePage} = require('./src/service/controller');

// set up multer for storing uploaded files in upload folder
const storage = multer.diskStorage({
          destination: (req, file, cb) => { cb(null, 'uploads')},
          filename: (req, file, cb) => { cb(null, file.fieldname + '-' + Date.now())}  });

const upload = multer({ storage: storage });

///weather attributes section and api request to get weather info ;
var city      = "London";
var temp_url  = null;
var temp_text = null;

app.get('/fetch_user_info', verifyToken, function(req, res){

    city = req.userCity || city;
    const userName  = req.userName || "";
    const accountID = req.userId || "";
    
    if ( !temp_url || !temp_text){

        getWeather(city, (err, { temp, url }) => {
          temp_url  = url;
          temp_text = `${city}: ${temp} °C `; 
        });}

    res.json({accntID: accountID, 
              name: userName,
              temp_text: temp_text,
              image_url: temp_url});

});


app.post("/login", sessionLogin);
app.get("/logout", sessionLogout);
app.post("/registration", registerAccount)

app.get("/profile", verifyToken, fetchProfile);
app.post('/change_pass', verifyToken, changePassword);
app.get('/match_password/:pass', verifyToken, matchPassword);
app.post('/profile', verifyToken, upload.single('image'), updateProfile);
app.get("/account/:ID?", verifyToken, fetchAccount);
app.get("/myArticles", verifyToken, fetchArticles);
app.get("/myArticles/:postID", verifyToken, removeArticles);

app.get("/search/:keyword", verifyToken, searchArticlesbyKeyword);
app.get("/search/tags/:keyword", verifyToken, searchArtilesbyTag );
app.get("/publish", verifyToken, getPublishPage);
app.post('/publish', verifyToken, pubilshArticle);
app.get("/articles/:page", verifyToken, fetchAllArticles);
app.get('/check/:email', checkEmail);
app.get("/", verifyToken, getHomePage);



app.listen( process.env.PORT || 3000,function()
{
  console.log("Server Has started Successfully, on Port: ", process.env.PORT);
});
