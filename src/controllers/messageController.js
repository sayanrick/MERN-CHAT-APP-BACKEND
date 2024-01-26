const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel"); // Make sure to import your Chat model
const { s3, upload } = require('../services/s3Service');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ error: "Invalid data passed into request" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    // Populate sender and chat.users
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat.users", "name pic email");

    // Update the latestMessage in the associated chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

exports.allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat.users", "name pic email");

    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// New controller for sending images
exports.sendImage = asyncHandler(async (req, res) => {
  // Handle image upload using Multer middleware
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { location: imageUrl } = req.file;
    const { chatId } = req.body;

    if (!imageUrl || !chatId) {
      return res.status(400).json({ error: 'Invalid data passed into request' });
    }

    const newImageMessage = {
      sender: req.user._id,
      imageUrl: imageUrl,
      chat: chatId,
    };

    try {
      let imageMessage = await Message.create(newImageMessage);

      // Populate sender and chat.users
      imageMessage = await imageMessage.populate('sender', 'name pic');
      imageMessage = await imageMessage.populate('chat.users', 'name pic email');

      // Update the latestMessage in the associated chat
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: imageMessage,
      });

      res.json(imageMessage);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
});