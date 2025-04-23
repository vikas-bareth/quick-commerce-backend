const User = require("../models/user");

exports.findUserByEmail = async (email) => {
  try {
    return await User.findOne({ emailId: email });
  } catch (error) {
    throw Error("Error in find user by email", error.message);
  }
};
