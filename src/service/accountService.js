const { Account, Post } = require('../schema');
const bcrypt = require("bcrypt");

async function getAccountById(accountId) {

    try {
        const account = await Account.findOne({ _id: accountId });
        return account;

    } catch (error) {
        console.error("Error fetching account:", error);
        throw new Error("Failed to retrieve account information");
    }
}

async function getAccountByEmail(_email) {

    try {
        const account = await Account.findOne({ email: _email });
        return account;

    } catch (error) {
        console.error("Error fetching account:", error);
        throw new Error("Failed to retrieve account information");
    }
}

async function createAccount(account_obj) {

    try {

        const default_bio = "My brain is broken down into two parts: Right & Left.\
                               Nothing is left in Right and Nothing in Right in Left Half..."

        account_obj.bio = default_bio
        account_obj.city = "London"
        account_obj.country = "UK"
        account_obj.birthDay = "1999-03-31"

        const account = new Account(account_obj);
        account.save();

        return account

    } catch (error) {
        console.error("Error fetching account:", error);
        throw new Error("Failed to retrieve account information");
    }

}


async function updateAccount(accntID, image, account_obj) {

    const post_name = account_obj.fName + " " + account_obj.lName + " ( " + account_obj.gender + " )";
    const post_obj = { name: post_name, }

    try {

        if (image) {
            post_obj.imgdata    = image;
            account_obj.imgdata = image;
        }

        await Account.updateOne({ _id: accntID }, account_obj);
        await Post.updateMany({ accountId: accntID }, post_obj);

    } catch (error) {
        console.error("Error fetching account:", error);
        throw new Error("Failed to retrieve account information"); 
    }

}


module.exports = {
    getAccountById,
    getAccountByEmail,
    createAccount,
    updateAccount
};