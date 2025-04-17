// const User = require('./models/User');
// const Message = require('./models/Message');

// module.exports = (io) => {
//   io.on('connection', socket => {
//     console.log('User connected:', socket.id);

//     socket.on('register', async ({ username }) => {
//       await User.findOneAndUpdate({ username }, { socketId: socket.id });
//     });

//     socket.on('private_message', async ({ sender, receiver, text }) => {
//       const receiverUser = await User.findOne({ username: receiver });
//       const newMsg = await Message.create({ sender, receiver, text });
//       if (receiverUser?.socketId) {
//         io.to(receiverUser.socketId).emit('private_message', newMsg);
//       }
//     });

//     socket.on('group_message', async ({ sender, group, text }) => {
//       const newMsg = await Message.create({ sender, group, text });
//       io.to(group).emit('group_message', newMsg);
//     });

//     socket.on('join_group', ({ groupName }) => {
//       socket.join(groupName);
//     });

//     // WebRTC signaling for calls
//     socket.on('signal', ({ to, data }) => {
//       io.to(to).emit('signal', { from: socket.id, data });
//     });

//     socket.on('disconnect', async () => {
//       console.log('User disconnected:', socket.id);
//       await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
//     });
//   });
// };
// io.on('connection', (socket) => {
//     socket.on('typing', ({ to }) => {
//       io.to(to).emit('typing', { from: socket.id });
//     });
  
//     socket.on('stopTyping', ({ to }) => {
//       io.to(to).emit('stopTyping', { from: socket.id });
//     });
//   });
//   const onlineUsers = new Map();

// io.on('connection', (socket) => {
//   const userId = socket.handshake.query.userId;
//   onlineUsers.set(userId, socket.id);

//   // Notify friends
//   socket.broadcast.emit('userOnline', { userId });

//   socket.on('disconnect', () => {
//     onlineUsers.delete(userId);
//     socket.broadcast.emit('userOffline', { userId });
//   });
// });
// io.on('connection', (socket) => {
//     socket.on('callUser', ({ to, offer }) => {
//       io.to(to).emit('callIncoming', { from: socket.id, offer });
//     });
  
//     socket.on('answerCall', ({ to, answer }) => {
//       io.to(to).emit('callAnswered', { from: socket.id, answer });
//     });
  
//     socket.on('iceCandidate', ({ to, candidate }) => {
//       io.to(to).emit('iceCandidate', { from: socket.id, candidate });
//     });
//   });
  

const User = require('./models/User');
const Message = require('./models/Message');

const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit('userOnline', { userId });
    }

    console.log('User connected:', socket.id);

    // Register user socket
    socket.on('register', async ({ username }) => {
      await User.findOneAndUpdate({ username }, { socketId: socket.id });
    });

    // Private message
    socket.on('private_message', async ({ sender, receiver, text }) => {
      const receiverUser = await User.findOne({ username: receiver });
      const newMsg = await Message.create({ sender, receiver, text });

      if (receiverUser?.socketId) {
        io.to(receiverUser.socketId).emit('private_message', newMsg);
      }
    });

    // Group message
    socket.on('group_message', async ({ sender, group, text }) => {
      const newMsg = await Message.create({ sender, group, text });
      io.to(group).emit('group_message', newMsg);
    });

    // Join group
    socket.on('join_group', ({ groupName }) => {
      socket.join(groupName);
    });

    // Typing indicators
    socket.on('typing', ({ to }) => {
      io.to(to).emit('typing', { from: socket.id });
    });

    socket.on('stopTyping', ({ to }) => {
      io.to(to).emit('stopTyping', { from: socket.id });
    });

    // WebRTC signaling
    socket.on('callUser', ({ to, offer }) => {
      io.to(to).emit('callIncoming', { from: socket.id, offer });
    });

    socket.on('answerCall', ({ to, answer }) => {
      io.to(to).emit('callAnswered', { from: socket.id, answer });
    });

    socket.on('iceCandidate', ({ to, candidate }) => {
      io.to(to).emit('iceCandidate', { from: socket.id, candidate });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      if (userId) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('userOffline', { userId });
      }

      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
    });
  });
};

