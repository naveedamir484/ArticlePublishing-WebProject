const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectToDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true, 
    };

    await mongoose.connect(process.env.MONGODB_CONN, options);
    console.log("Connected to MongoDB Successfully.");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectToDB;