import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from '../models/user.model.js';
import Message from '../models/Message.js';

const onlineUsers = new Map();
let io; 

const socketHandler = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit('userOnline', { userId });
    }

    console.log('User connected:', socket.id);

    socket.on('register', async ({ username }) => {
      await User.findOneAndUpdate({ username }, { socketId: socket.id });
    });

    socket.on('private_message', async ({ sender, receiver, text }) => {
      const receiverUser = await User.findOne({ username: receiver });
      const newMsg = await Message.create({ sender, receiver, text });

      if (receiverUser?.socketId) {
        io.to(receiverUser.socketId).emit('private_message', newMsg);
      }
    });

    socket.on('group_message', async ({ sender, group, text }) => {
      const newMsg = await Message.create({ sender, group, text });
      io.to(group).emit('group_message', newMsg);
    });

    socket.on('join_group', ({ groupName }) => {
      socket.join(groupName);
    });

    socket.on('typing', ({ to }) => {
      io.to(to).emit('typing', { from: socket.id });
    });

    socket.on('stopTyping', ({ to }) => {
      io.to(to).emit('stopTyping', { from: socket.id });
    });

    socket.on('callUser', ({ to, offer }) => {
      io.to(to).emit('callIncoming', { from: socket.id, offer });
    });

    socket.on('answerCall', ({ to, answer }) => {
      io.to(to).emit('callAnswered', { from: socket.id, answer });
    });

    socket.on('iceCandidate', ({ to, candidate }) => {
      io.to(to).emit('iceCandidate', { from: socket.id, candidate });
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      if (userId) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('userOffline', { userId });
      }

      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
    });
  });

  return io;
};


export const getSocketInstance = () => io;

export default socketHandler;
