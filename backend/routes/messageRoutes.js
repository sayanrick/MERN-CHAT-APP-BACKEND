const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, allMessages, sendImage } = require('../controllers/messageController');

const router = express.Router()

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, allMessages);
router.post("/send-image", protect, sendImage);


module.exports = router;
