const { server } = require('./src/app');

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Socket.IO ready at ws://localhost:${PORT}`);
});