function checkMatching(firstCard, secondCard) {
  const matchedCardIndexList = [];

  if (firstCard.card === secondCard.card) {
    matchedCardIndexList.push(firstCard.index);
    matchedCardIndexList.push(secondCard.index);
   }

  return matchedCardIndexList;
}

module.exports = {
  checkMatching,
};
