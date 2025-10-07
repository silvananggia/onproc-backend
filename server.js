const app = require('./src/app');
const { createServer } = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 9000;

// Create HTTP server
const server = createServer(app);


// Initialize Socket.IO
const io = new Server(server, {
  path: '/be/socket.io/', // Socket.IO path to match nginx proxy
  cors: {
    origin: "*", // ubah ke domain frontend kamu kalau perlu security lebih ketat
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available globally
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  console.log('✅ Client namespace:', socket.nsp.name);
  console.log('✅ Client transport:', socket.conn.transport.name);

  // Join job-specific room for real-time updates
  socket.on('join-job', (jobId) => {
    socket.join(`job-${jobId}`);
    console.log(`Client ${socket.id} joined job room: job-${jobId}`);
  });

  // Leave job-specific room
  socket.on('leave-job', (jobId) => {
    socket.leave(`job-${jobId}`);
    console.log(`Client ${socket.id} left job room: job-${jobId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'reason:', reason);
  });

  // Add error handling
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

server.listen(port, () => {
  console.log('Server is running on ', port);
});