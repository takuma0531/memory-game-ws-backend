const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const gameInfo = require("./gameInfo");
const { checkMatching } = require('./utilities/gameLogic');
const { SetPlayersStatus, setCards } = require('./utilities/settingRoom');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Variables for room
const rooms = []; // [{roomId: n, playersStatus: {}, allCards: [] }]

// Variables for game play
const playersStatus = [];
let allCards = null;
let firstCard = secondCard = {
  index: null,
  card: null,
  isFlipped: false
};
let matchedCardIndexList = [];
let isInitialized = false;

io.on("connection", (socket) => {
  // host setting
  socket.on("setGame", ({ nickname, nPlayer, nCard }) => {
    socket.join(socket.id);
    rooms.push({
      roomId: socket.id,
      playersStatus: SetPlayersStatus(nPlayer, nickname),
      allCards: setCards(nCard)
    });
  });

  // when loading RoomSelectionPage
  socket.on('loadRooms', () => {
    socket.emit('renderRooms', rooms);
  });

  // set joining person's nickname
  socket.on('join', ({ roomId, nickname }) => {

    const room = rooms.find((room) => room.roomId === roomId);
    let bool;

    try {
      // new player joins in case that the room has a vacant position
      bool = room.playersStatus.find((player) => player.name === '');      
    } catch (e) {
      socket.emit('noRoom', 'Room is not found');
    }

    if (bool) {
      for (i = 1; i < room.playersStatus.length; i++) {
        if (!room.playersStatus[i].name) {
          room.playersStatus[i].name = nickname;
          // TODO: socket.join?
          socket.join(room.id);
          return;
        }
      }
    } else {
      socket.emit('fullRoom', 'The room is full');
    }
  });

  socket.on('activate', () => {
    const room = rooms.find((room) => room.roomId = socket.id); // TODO: check if socket.id works?
    io.in(socket.id).emit("startGame", room);
  });

  socket.on('flip', (data) => {
    if (!firstCard.isFlipped) {
      firstCard = {
        index: data.index,
        card: data.card,
        isFlipped: data.isFlipped
      };
    } else {
      secondCard = {
        index: data.index,
        card: data.card,
        isFlipped: data.isFlipped
      };

      matchedCardIndexList = checkMatching(firstCard, secondCard);
      isInitialized = true;
    }

    io.sockets.emit('flipped', {
      isFlipped: data.isFlipped,
      firstCard: firstCard,
      secondCard: secondCard,
      matchedCardIndexList: matchedCardIndexList,
    });

    if (isInitialized) {
      firstCard = secondCard = {
        index: null,
        card: null,
        isFlipped: false,
      };

      isInitialized = false;
    }
  });

  socket.on('disconnect', (msg) => {
    console.log(msg);

    firstCard = secondCard = {
      index: null,
      card: null,
      isFlipped: false,
    };

    isInitialized = false;

    matchedCardIndexList = [];
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
