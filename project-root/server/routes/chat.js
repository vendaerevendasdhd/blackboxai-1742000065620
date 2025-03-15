const express = require('express');
const router = express.Router();
const { auth } = require('./auth');

// Mock chat storage (replace with real database in production)
let chatHistory = [];

/**
 * @route   GET api/chat/history
 * @desc    Get chat history
 * @access  Private
 */
router.get('/history', auth, (req, res, next) => {
  try {
    // For admin, return all chat history
    if (req.user.role === 'admin') {
      return res.json(chatHistory);
    }

    // For regular users, return only their chat history
    const userChats = chatHistory.filter(
      msg => msg.userId === req.user.id || msg.recipientId === req.user.id
    );
    res.json(userChats);
  } catch (err) {
    next(err);
  }
});

// WebSocket message handler (to be used in server.js)
const handleWebSocketMessage = (ws, message, wss) => {
  try {
    const msgData = JSON.parse(message);
    
    // Validate message structure
    if (!msgData.type || !msgData.content) {
      ws.send(JSON.stringify({
        type: 'error',
        content: 'Invalid message format'
      }));
      return;
    }

    const newMessage = {
      id: chatHistory.length + 1,
      ...msgData,
      timestamp: new Date()
    };

    // Store message in history
    chatHistory.push(newMessage);

    // Broadcast to relevant clients
    wss.clients.forEach(client => {
      if (
        client !== ws && // Don't send to sender
        client.readyState === ws.OPEN && // Check if client connection is open
        (!msgData.recipientId || // If no specific recipient, broadcast to all
          client.userId === msgData.recipientId || // Send to intended recipient
          client.userId === msgData.userId) // Send to sender (for multiple devices)
      ) {
        client.send(JSON.stringify(newMessage));
      }
    });
  } catch (err) {
    console.error('WebSocket message handling error:', err);
    ws.send(JSON.stringify({
      type: 'error',
      content: 'Message processing failed'
    }));
  }
};

// WebSocket connection handler (to be used in server.js)
const handleWebSocketConnection = (ws, req) => {
  console.log('New WebSocket connection');

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    content: 'Connected to chat server'
  }));

  // Handle incoming messages
  ws.on('message', message => {
    handleWebSocketMessage(ws, message, ws.server);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected from chat');
  });

  // Handle errors
  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
};

module.exports = {
  router,
  handleWebSocketConnection,
  handleWebSocketMessage
};
