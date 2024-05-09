const _ = require("lodash");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const bcrypt = require("bcrypt");

const { Account, Post } = require('../schema');

const { getAccountById,
        getAccountByEmail,
        createAccount,
        updateAccount } = require("./accountService")

const { getPostsById,
        createPost,
        getPostbyTag,
        getPostbykeyword,
        getPostbypagination } = require("./postService")

const { generateToken } = require('../auth');

const error_obj = { error_msg: "Internal Server Error: 500" }



async function fetchAccount(req, res) {

  const accntID = req.params["ID"] ? req.params["ID"] : req.userId;

  try {

    const posts = await getPostsById(accntID);
    const accounts = await getAccountById(accntID);

    res.render("P_account", {
      check: !!req.userId,
      profile: accounts,
      posts: posts.reverse()
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }
}

async function sessionLogin(req, res) {

  try {

    const pass = req.body.pass;
    const email = req.body.email;

    const account = await getAccountByEmail(email);

    bcrypt.compare(pass, account.password, function (err, result) {

      if (result) {

        token = generateToken({
          userId: account._id,
          userCity: account.city,
          userName: account.fName,
          userEmail: account.email
        })

        res.cookie('Authorization', token);
        res.redirect("/articles/1");

      }

    })

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}


function sessionLogout(req, res) {

  try {
    res.clearCookie('Authorization', { path: '/' });
    res.redirect("/");

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}


async function registerAccount(req, res) {

  try {

    const random_no = Math.floor(Math.random() * 5) + 1;
    const file_path = `../../uploads/m${random_no}`;
    const profile_img = fs.readFileSync(path.join(__dirname, file_path));

    bcrypt.hash(req.body.pass1, 5, async function (err, hash) {

      account = await createAccount({
        fName: _.capitalize(req.body.fname),
        lName: _.capitalize(req.body.lname),
        email: req.body.email,
        occupation: _.capitalize(req.body.occup),
        gender: req.body.gender,
        imgdata: profile_img,
        password: hash
      })

      res.redirect('/account/' + account._id);
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

};

async function fetchProfile(req, res) {

  try {

    if (!req.userId) res.redirect("/articles/1");

    const account = await getAccountById(req.userId);

    res.render("P_profile", {
      check: true,
      profile: account
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

};


async function checkEmail(req, res) {

  try {
    const email = req.params["email"];
    const account = await getAccountByEmail(email);

    if (account) res.json({ check: "true" })
    else res.json({ check: "false" })

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}

async function changePassword(req, res) {

  try {

    if (!req.userId) res.redirect("/")

    bcrypt.hash(req.body.CPass, 5, async function (err, hash) {

      await Account.updateOne({ _id: req.userId }, { password: hash })
      res.redirect("/")
    })

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}


async function matchPassword(req, res) {

  try {

    if (!req.userId) res.redirect("/")

    const account = await Account.findOne({ _id: req.userId });

    bcrypt.compare(req.params["pass"], account.password, function (err, result) {
      res.json({ boolean: result });
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }


}


async function updateProfile(req, res, next) {

  try {

    var image = null;

    if (req.body.checkbox == "Checked") {

      await sharp(req.file.path).resize(200, 200)
        .toFile(path.resolve(__dirname, '../../uploads/profile'));

      fs.unlinkSync(req.file.path);
      image = fs.readFileSync(path.join(__dirname, '../../uploads/profile'));

    }

    await updateAccount(req.userId, image, {
      fName: _.capitalize(req.body.fname),
      lName: _.capitalize(req.body.lname),
      email: req.body.email,
      birthDay: req.body.birthday,
      occupation: _.capitalize(req.body.occupation),
      country: _.capitalize(req.body.country),
      city: _.capitalize(req.body.city),
      bio: _.capitalize(req.body.bio),
      gender: req.body.gender,
    })

    res.redirect('/profile');

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}

async function fetchArticles(req, res) {

  try {

    if (!req.userId) res.redirect("/");

    const posts = await getPostsById(req.userId);

    res.render("P_myArticle", {
      check: true,
      posts: posts.reverse()
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }
}

async function removeArticles(req, res) {

  try {

    if (!req.userId) res.redirect("/");

    await Post.findByIdAndRemove(req.params["postID"]);

    res.redirect("/myArticles/");

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }
}


async function searchArticlesbyKeyword(req, res) {

  try {

    const posts = await getPostbykeyword(req.params["keyword"])

    res.render("P_article", {
      page: 0,
      posts: posts,
      doc: posts.length,
      check: !!req.userId,
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}


async function searchArtilesbyTag(req, res) {

  try {

    const key = req.params["keyword"]

    if (key == "All") res.redirect("/articles/1")

    const posts = await getPostbyTag(key)

    res.render("P_article", {
      page: 0,
      posts: posts,
      doc: posts.length,
      check: !!req.userId,
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}

function getPublishPage(req, res) {


  try {

    if (!req.userId) res.redirect("articles/1");
    else res.render("P_publish", { check: true });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}

async function pubilshArticle(req, res) {

  try {

    await createPost(req.userId, {
      mainHeading: _.capitalize(req.body.mainHeading),
      subHeading: _.capitalize(req.body.subHeading),
      paraOne: _.capitalize(req.body.paraOne),
      paraTwo: _.capitalize(req.body.paraTwo),
      paraThree: _.capitalize(req.body.paraThree),
      tags: req.body?.tags || "",
      time: req.body?.time,
    })

    res.redirect("/articles/1");

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);

  }

}

async function fetchAllArticles(req, res) {

  try {

    const page = req.params["page"]
    const { posts, postcount } = await getPostbypagination(page);

    res.render("P_article", {
      check: !!req.userId,
      doc: postcount,
      page: page,
      posts: posts
    });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }

}

function getHomePage(req, res) {

  try {

    res.render("P_home", { check: !!req.userId });

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).render("P_error", error_obj);
  }
}


module.exports = {
  checkEmail,
  getHomePage,
  sessionLogin,
  fetchAccount,
  fetchProfile,
  fetchArticles,
  updateProfile,
  sessionLogout,
  matchPassword,
  removeArticles,
  getPublishPage,
  pubilshArticle,
  changePassword,
  registerAccount,
  fetchAllArticles,
  searchArtilesbyTag,
  searchArticlesbyKeyword,
};



