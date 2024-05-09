const { Post, } = require('../schema');
const { getAccountById } = require('./accountService');


async function getPostsById(_accntId) {

    try {
        const posts = await Post.find({ accountId: _accntId });
        return posts;

    } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to retrieve post information");
    }
}

async function getPostbykeyword(_key){

    try {

        const regex = new RegExp(_key, 'i');
        const posts = await Post.find({ mainHeading: {$regex: regex}});

        return posts;

    } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to retrieve post information");
    }
}

async function getPostbyTag(_tag){

    try {

        const regex = new RegExp(_tag, 'i');
        const posts = await Post.find({ tags: { "$in": [regex] } });

        return posts;

    } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to retrieve post information");
    }

}

async function getPostbypagination(page ){

    try {

        const skip       = (page - 1) * 6;
        const page_limit = 6;
      
        const postcount = await Post.countDocuments({});
      
        const posts = await Post.find({})
                                .sort({ date: -1 })
                                .limit(page_limit)
                                .skip(skip);;
        return {posts, postcount};

    } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to retrieve post information");
    }

}

async function createPost(accntID, post_obj) {

    try {

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yy = today.getFullYear();

        const account = await getAccountById({ _id: accntID });

        post_obj.date      = dd + '/' + mm + '/' + yy;
        post_obj.tags      = post_obj.tags.replace(/\r?\n|\r/g, "").split("#")
        post_obj.name      = account.fName + " " + account.lName + " ( " + account.gender + " )";
        post_obj.imgdata   = account.imgdata
        post_obj.accountId = accntID;

        const post = new Post(post_obj);
        await post.save();

        return post;

    } catch (error) {
        console.error("Error fetching post:", error);
        throw new Error("Failed to retrieve post information");
    }
}

module.exports = {
    createPost,
    getPostsById,
    getPostbykeyword,
    getPostbyTag,
    getPostbypagination
};