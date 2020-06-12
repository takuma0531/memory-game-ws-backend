const clonedeep = require("lodash.clonedeep");
const gameInfo = require('../gameInfo');

function SetPlayersStatus(nPlayer, hostNickname) {
  const playersStatus = [];
  const gameData = gameInfo; // avoid multiple users' overwriting

  gameData.playersStatus[0].name = hostNickname;
  for (let i = 0; i < nPlayer; i++) {
    playersStatus.push(gameData.playersStatus[i])
  }

  return playersStatus;
}

function setCards(nCard) {
  const cards = [];

  for (let j = 0; j < nCard / 2; j++) {
    cards.push(gameInfo.cards[j]);
  }

  return cards.concat(clonedeep(cards));
}

module.exports = {
  SetPlayersStatus,
  setCards,
};
