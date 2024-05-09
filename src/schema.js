const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    accountId: String,
    name: String,
    time: String,
    mainHeading: String,
    subHeading: String,
    paraOne: String,
    paraTwo: String,
    paraThree: String,
    tags: [String],
    date: String,
    imgdata: Buffer
});

const accountSchema = new mongoose.Schema({
    fName: String,
    lName: String,
    email: String,
    birthDay: String,
    occupation: String,
    country: String,
    city: String,
    bio: String,
    gender: String,
    password: String,
    imgdata: Buffer
});

module.exports = {
    Post: mongoose.model("Post", postSchema),
    Account: mongoose.model("Account", accountSchema)
};
