
const User = require('../User')
const crypto = require("crypto");
const bcrypt = require('bcrypt');


// Generate a secure random token
function generateRandomToken() {
  return crypto.randomBytes(64).toString('hex');
}

exports.getAllUser = async(req,res) =>{
  try {
      const users = await User.find();
      res.status(200).json(users);
  
  } catch (error) {
      res.status(400).json({error: error.message })
  }
}


exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Save the hashed password
    });

    await newUser.save();

    const token = generateRandomToken();
    newUser.tokens = newUser.tokens.concat({ token });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserById =  async(req,res) => {
  try{
      const user = await User.findById(req.params.userId);
      if(!user) {
          return res.status(404).json({error: 'User not Found'});
      }
      res.status(200).json(user);
  }catch(error){
      res.status(500).json({error: error.message})
  }
}

exports.findByIdAndUpdate =  async(req, res) =>{
  try {
      const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } 

exports.findByIdAndDelete = async (req,res) => {
      try {
          const user = await User.findByIdAndDelete(req.params.userId);
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.status(204).json(); // No content
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
  }

// Authentication
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid login credentials');
    }

    // Validate the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid login credentials');
    }

    // Clear existing tokens
    user.tokens = [];

    // Generate a new token
    const token = generateRandomToken();
    user.tokens = user.tokens.concat({ token });
    
    await user.save();

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    // Assuming you send the token in the request header
    const token = req.headers.authorization.replace('Bearer ', '');
    const user = await User.findOne({ 'tokens.token': token });

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Sign out
exports.signOut = async (req, res) => {
  try {
    // Check if user is available in the request and has the expected structure
    if (!req.user || !req.user.tokens || !Array.isArray(req.user.tokens)) {
      return res.status(404).json({ error: 'User not found or invalid user structure' });
    }

    // Assuming you send the token in the request header
    const tokenToRemove = req.headers.authorization?.replace('Bearer ', '');

    // Check if the token to remove is provided
    if (!tokenToRemove) {
      return res.status(400).json({ error: 'Token not provided in the request header' });
    }

    // Remove the specific token from the user's tokens
    req.user.tokens = req.user.tokens.filter((token) => token.token !== tokenToRemove);

    // Save the user with the updated tokens
    await req.user.save();

    res.status(200).json({ message: 'Sign-out successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};