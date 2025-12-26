const User = require('../models/User');
const Message = require('../models/Message');

const connectedUsers = new Map();

const socketHandler = (io) => {
    io.on('connection', async (socket) => {
        console.log(`✅ User connected: ${socket.username} (${socket.userId})`);
        
        // Add user to connected users map
        connectedUsers.set(socket.userId.toString(), socket.id);
        
        // Update user status to online
        await User.findByIdAndUpdate(socket.userId, {
            isOnline: true,
            lastSeen: new Date()
        });

        // Notify other users about this user's online status
        socket.broadcast.emit('user_online', {
            userId: socket.userId,
            username: socket.username
        });

        // Send list of online users to the connected user
        const onlineUsers = [];
        for (let [userId, socketId] of connectedUsers) {
            if (userId !== socket.userId.toString()) {
                const user = await User.findById(userId).select('username email');
                if (user) {
                    onlineUsers.push({
                        userId: user._id,
                        username: user.username,
                        socketId: socketId
                    });
                }
            }
        }
        socket.emit('online_users', onlineUsers);

        // Handle private message
        socket.on('private_message', async (data) => {
            try {
                const { receiverId, message } = data;
                
                if (!receiverId || !message) {
                    return socket.emit('error', { message: 'Receiver ID and message are required' });
                }

                // Save message to database
                const newMessage = new Message({
                    sender: socket.userId,
                    receiver: receiverId,
                    message: message
                });

                await newMessage.save();

                // Prepare message object to send
                const messageObj = {
                    id: newMessage._id,
                    senderId: socket.userId,
                    receiverId: receiverId,
                    message: message,
                    timestamp: newMessage.timestamp,
                    isRead: false
                };

                // Send to receiver if online
                const receiverSocketId = connectedUsers.get(receiverId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('private_message', messageObj);
                }

                // Send back to sender
                socket.emit('private_message', messageObj);

            } catch (error) {
                console.error('Message sending error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { receiverId, isTyping } = data;
            const receiverSocketId = connectedUsers.get(receiverId.toString());
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing', {
                    senderId: socket.userId,
                    isTyping: isTyping
                });
            }
        });

        // Handle message read receipt
        socket.on('message_read', async (data) => {
            try {
                const { messageId } = data;
                await Message.findByIdAndUpdate(messageId, { isRead: true });
                
                // Notify sender that message was read
                const message = await Message.findById(messageId);
                if (message) {
                    const senderSocketId = connectedUsers.get(message.sender.toString());
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('message_read', { messageId });
                    }
                }
            } catch (error) {
                console.error('Message read error:', error);
            }
        });

        // Fetch chat history
        socket.on('get_chat_history', async (data) => {
            try {
                const { otherUserId, limit = 50, skip = 0 } = data;
                
                const messages = await Message.find({
                    $or: [
                        { sender: socket.userId, receiver: otherUserId },
                        { sender: otherUserId, receiver: socket.userId }
                    ]
                })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sender', 'username')
                .populate('receiver', 'username');

                socket.emit('chat_history', {
                    otherUserId,
                    messages: messages.reverse() // Oldest first
                });
            } catch (error) {
                console.error('Chat history error:', error);
                socket.emit('error', { message: 'Failed to fetch chat history' });
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`❌ User disconnected: ${socket.username}`);
            
            // Remove user from connected users map
            connectedUsers.delete(socket.userId.toString());
            
            // Update user status to offline
            await User.findByIdAndUpdate(socket.userId, {
                isOnline: false,
                lastSeen: new Date()
            });

            // Notify other users about this user's offline status
            socket.broadcast.emit('user_offline', {
                userId: socket.userId,
                username: socket.username
            });
        });
    });
};

module.exports = socketHandler;