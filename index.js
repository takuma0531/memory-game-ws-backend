const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const { users, joinUser, createRooms, leaveUsersInRoom, setPlayersInfo } = require('./utilities/users');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
  socket.on('joinRoom', ({ nickname, id, isHost, maxNumPlayers }) => {
    let roomId;
    const userId = socket.id;
    let maximumPlayers;

    if (!id) {
      // host
      roomId = socket.id;
      maximumPlayers = maxNumPlayers;      
    } else {
      // join
      roomId = id;
      maximumPlayers = null;
    }

    socket.join(roomId);
    joinUser(userId, nickname, isHost, roomId, maximumPlayers);

    const participants = users.filter((user) => user.roomId === roomId); // participants = [player1, player2, ...];
    io.sockets.to(roomId).emit('joined', participants);
  });

  // pass hosts data when loading room selection page
  socket.on('loadRooms', () => {
    const rooms = createRooms();
    socket.emit('loadedRooms', rooms);
  });

  socket.on('start', ({ roomId, allCards }) => {
    const playersStatus = setPlayersInfo(roomId);
    socket.broadcast.emit('move');
    io.sockets.to(roomId).emit('started', { playersStatus, allCards });
  });

  socket.on('disband', () => {
    console.log('disband');
    leaveUsersInRoom(socket.id);
    socket.broadcast.emit('disbanded', 'The group was disbanded.');
  });

    // Socket during game

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
