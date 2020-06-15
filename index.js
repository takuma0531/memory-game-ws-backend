const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const { users, joinUser, createRooms, leaveUsersInRoom, setPlayersInfo, leaveRoom } = require('./utilities/users');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let roomId;

io.on("connection", (socket) => {
  console.log('connected');
  socket.on('joinRoom', ({ nickname, id, isHost, maxNumPlayers }) => {
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

    const players = users.filter((user) => user.roomId === roomId); // players = [player1, player2, ...];
    io.sockets.to(roomId).emit('joined', { players, userId });
  });

  // pass hosts data when loading room selection page
  socket.on('loadRooms', () => {
    const rooms = createRooms();
    socket.emit('loadedRooms', rooms);
  });

  socket.on('start', ({ roomId, allCards }) => {
    const playersStatus = setPlayersInfo(roomId);
    socket.broadcast.to(roomId).emit('move');
    io.sockets.to(roomId).emit('started', { playersStatus, allCards });
  });

  socket.on('disband', () => {
    leaveUsersInRoom(socket.id);
    socket.broadcast.to(roomId).emit('disbanded', 'The group was disbanded.');
  });

  socket.on('leaveRoom', () => {
    leaveRoom(socket.id);
  });

  // Socket during game
  socket.on('flip', ({ card, index, isFlipped }) => {
    const flippedCard = {
      index: index,
      card: card,
      isFlipped: isFlipped
    };
    io.sockets.to(roomId).emit('flipped', flippedCard);
  });

  socket.on('restart', () => {
    io.sockets.to(roomId).emit('restarted');
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
