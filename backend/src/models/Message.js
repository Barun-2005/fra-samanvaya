const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Keep only last 50 messages per session
messageSchema.index({ sessionId: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
