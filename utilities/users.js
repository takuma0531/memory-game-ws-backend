const _ = require('lodash');

let users = [];

function joinUser(userId, nickname, isHost, roomId, maximumPlayers) {
  const user = { userId: userId, nickname: nickname, isHost: isHost, roomId: roomId, maximumPlayers: maximumPlayers };
  users.push(user);
}

function createRooms() {
  const rooms = [];
  const hostPlayers = users.filter((hostPlayer) => hostPlayer.isHost);

  hostPlayers.forEach((hostPlayer) => {
    const participants = users.filter((user) => user.roomId === hostPlayer.roomId);
    const isRoomFull = (hostPlayer.maximumPlayers === participants.length) ? true : false;
    const room = {
      roomId: hostPlayer.roomId,
      participants: participants,
      maximumPlayers: hostPlayer.maximumPlayers,
      isRoomFull: isRoomFull,
    };
    rooms.push(room);
  });
  return rooms;
}

function setPlayersInfo(roomId) {
  const playersStatus = [];
  const roomUsers = users.filter((roomUser) => roomUser.roomId === roomId);

  roomUsers.forEach((roomUser) => {
    const playerStatus = {
      id: roomUser.userId,
      name: roomUser.nickname,
      score: 0,
    };
    playersStatus.push(playerStatus);
  });

  return playersStatus;
}

function leaveUsersInRoom(roomId) {
  _.remove(users, (user) => {
    return user.roomId === roomId;
  });
}

module.exports = {
  users,
  joinUser,
  createRooms,
  setPlayersInfo,
  leaveUsersInRoom,
};
