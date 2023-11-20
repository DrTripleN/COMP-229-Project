const mongoose = require ("mongoose")
const jwt = require('jsonwebtoken')
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: ()=> Date.now(),
    },
    updated:  {
        type: Date,
        default: ()=> Date.now(),
    },

    tokens:[{
        token: {
            type: String,
            required: true,
        },
    }],
}
);

// Generate a secure random token
function generateRandomToken() {
    return crypto.randomBytes(64).toString('hex');
  }

// Generate JWT token for user
userSchema.methods.generateAuthToken = function () {
    const user = this;
    const existingToken = user.tokens[0];
  
    if (existingToken) {
      // If there's an existing token, update it
      existingToken.token = jwt.sign({ _id: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET);
    } else {
      // If no existing token, add a new one
      const newToken = jwt.sign({ _id: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET);
      user.tokens.push({ token: newToken });
    }
  
    return user.tokens[0].token;
  };
  
  // Remove a specific token from the user's tokens
  userSchema.methods.removeToken = function (tokenToRemove) {
    const user = this;
    user.tokens = user.tokens.filter((token) => token.token !== tokenToRemove);
  };

// Create the 'users' model
const User = mongoose.model('User', userSchema)

//export user model
module.exports = User;