const express = require('express');

const userController = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/signup", userController.registerUser);

router.post("/login", userController.authenticateUser);

router.get("/", protect, userController.allUsers)

module.exports = router;