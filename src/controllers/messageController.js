const Message = require('../models/Message');

const getChatHistory = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: otherUserId },
                { sender: otherUserId, receiver: req.user._id }
            ]
        })
        .sort({ timestamp: 1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .populate('sender', 'username')
        .populate('receiver', 'username');

        res.json({
            otherUserId,
            messages
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        await Message.findByIdAndUpdate(messageId, { isRead: true });
        
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
};

module.exports = { getChatHistory, markAsRead };