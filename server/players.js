const players = [];
let cnt = 1;

function addPlayer({ id, email, name }) {
  const existingPlayer = players.find(player => player.email === email);

  if (existingPlayer) return { error: 'player is loggedin allready' };
  const player = { id, email, name, number: cnt };
  players.push(player);
  cnt = cnt == 1 ? 2 : 1;
  return { player };
}

function removePlayer(id) {
  cnt = cnt == 1 ? 2 : 1;
  const index = players.findIndex(player => player.id === id);
  return players.splice(index, 1)[0];
}

function getPlayer(id) {
  return players.find(player => player.id === id);
}

function getPlayers() {
  return players;
}

module.exports = {
  addPlayer,
  removePlayer,
  getPlayer,
  getPlayers
};