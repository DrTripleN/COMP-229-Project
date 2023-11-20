const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');

router.get('/', (req, res) => {
  console.log("Here");
  res.json({ message: "welcome to my Project" });
});

router.get('/api/users', userController.getAllUser);
router.post('/api/users', userController.createUser);
router.get('/api/users/:userId', userController.getUserById);
router.put('/api/users/:userId', userController.findByIdAndUpdate);
router.delete('/api/users/:userId', userController.findByIdAndDelete);

// Authentication routes
router.post('/auth/signin', userController.signIn);
router.get('/auth/signout',  userController.signOut);

// Export the router for use in server.js
module.exports = router;
