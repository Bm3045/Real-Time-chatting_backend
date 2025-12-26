Real-Time Chat Backend - Socket.IO Implementation
A real-time one-to-one chat backend built with Node.js, Socket.IO, and MongoDB. This project implements a complete chat system with authentication, real-time messaging, online/offline status, and message persistence.

🚀 Features
🔐 JWT Authentication for socket connections

💬 Real-time messaging between users

📱 Online/Offline status tracking

💾 Message persistence in MongoDB

📜 Chat history retrieval

⌨️ Typing indicators

✅ Message read receipts

🛡️ Error handling and validation

📋 Prerequisites
Node.js (v14 or higher)

MongoDB (v4.4 or higher)

npm or yarn

🛠️ Installation
Clone the repository

bash
git clone <your-repo-url>
cd realtime-chat-backend
Install dependencies

bash
npm install
Environment Configuration
Create a .env file in the root directory:

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/realtime_chat
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
🏃‍♂️ Running the Application
Development Mode
bash
npm run dev
Production Mode
bash
npm start
Check Server Health
bash
curl http://localhost:5000/health
🌐 API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	User login
GET	/api/auth/profile	Get user profile (protected)
Chat
Method	Endpoint	Description
GET	/api/chat/history/:userId	Get chat history with user
GET	/api/users	Get all users (for testing)
🔌 Socket.IO Events
Client to Server Events
Event	Data Format	Description
private_message	{ receiverId: string, message: string }	Send private message
typing	{ receiverId: string, isTyping: boolean }	Typing indicator
message_read	{ messageId: string }	Mark message as read
get_chat_history	{ otherUserId: string, limit?: number, skip?: number }	Get chat history
Server to Client Events
Event	Data Format	Description
private_message	{ id: string, senderId: string, receiverId: string, message: string, timestamp: Date, isRead: boolean }	Incoming message
online_users	Array<{ userId: string, username: string, socketId: string }>	List of online users
user_online	{ userId: string, username: string }	User came online
user_offline	{ userId: string, username: string }	User went offline
typing	{ senderId: string, username: string, isTyping: boolean }	User typing status
message_read	{ messageId: string }	Message was read
chat_history	{ otherUserId: string, messages: Array }	Chat history response
error	{ message: string, details?: string }	Error notification
📖 Database Schema
User Model
javascript
{
  username: String,      // Unique username
  email: String,         // Unique email
  password: String,      // Hashed password
  isOnline: Boolean,     // Online status
  lastSeen: Date,        // Last seen timestamp
  createdAt: Date,       // Account creation date
  updatedAt: Date        // Last update date
}
Message Model
javascript
{
  sender: ObjectId,      // Reference to User
  receiver: ObjectId,    // Reference to User
  message: String,       // Message content
  isRead: Boolean,       // Read status
  timestamp: Date        // Message timestamp
}
🔧 Socket Connection Setup
Client-Side Implementation Example
javascript
import { io } from 'socket.io-client';

// Connect with JWT authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'  // From login API
  }
});

// Event listeners
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('private_message', (data) => {
  console.log('New message:', data);
});

socket.on('user_online', (data) => {
  console.log(`${data.username} is now online`);
});

socket.on('user_offline', (data) => {
  console.log(`${data.username} went offline`);
});

// Send a message
socket.emit('private_message', {
  receiverId: 'RECEIVER_USER_ID',
  message: 'Hello there!'
});

// Show typing indicator
socket.emit('typing', {
  receiverId: 'RECEIVER_USER_ID',
  isTyping: true
});
🧪 Testing
