const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { addPlayer, removePlayer, getPlayer, getPlayers } = require('./players');
const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(__dirname + '/../client'));
app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/../client/index.html')));


app.get('/questions', (req, res) => {
  const questions = fs.readFileSync(path.join(__dirname + '/questions.json'));
  res.send(JSON.parse(questions.toString()));
});


app.post('/questions', (req, res) => {
  const questions = req.body;
  fs.writeFileSync(path.join(__dirname + '/questions.json'), JSON.stringify(questions));
  res.send({ status: 'SUCCESS' });
});


app.post('/login', (req, res) => {
  const user = req.body;
  const users = JSON.parse(fs.readFileSync(path.join(__dirname + '/authentication.json')).toString());
  for (let u of users) {
    if (u.email == user.email) {
      if (u.pass == user.pass) {
        res.send({ 
          status: 'success',
          email: user.email,
          name: u.name
        });
      }
      else {
        res.send({ error: 'wrong password' });
      }
      return;
    }
  }
  res.send({ error: 'user not found' });
});


app.post('/signup', (req, res) => {
  const player = req.body;
  const players = JSON.parse(fs.readFileSync(path.join(__dirname + '/authentication.json')).toString());
  for (let p of players) {
    if (p.email == player.email) {
      res.send({ error: 'user allready exists' });
      return;
    }
  }
  players.push(player);
  fs.writeFileSync(path.join(__dirname + '/authentication.json'), JSON.stringify(players));
  res.send({ status: 'success' });
});


app.post('/scores', (req, res) => {
  const { email, scores, enemy } = req.body;
  const players = JSON.parse(fs.readFileSync(path.join(__dirname + '/authentication.json')).toString());
  for (let p of players) 
    if (p.email == email) 
      p.scores.push({ enemy, scores, date: new Date() });
  fs.writeFileSync(path.join(__dirname + '/authentication.json'), JSON.stringify(players));
  io.to('game').emit('players', getPlayers());
  res.send({ status: 'success' });
});


app.get('/scores', (req, res) => {
  const email = req.query.email;
  const players = JSON.parse(fs.readFileSync(path.join(__dirname + '/authentication.json')).toString());
  for (let p of players) 
    if (p.email == email) 
      res.send(p.scores);
});


io.on('connection', socket => {
  const name = socket.handshake.query.name;
  console.log('new connection, name = ' + name);
  
  socket.on('join', ({ email, name }, callback) => {
    const { error, player } = addPlayer({ id: socket.id, email, name });
    if (error) return callback(error);
    socket.join('game');
    socket.broadcast.to('game').emit('playerHasJoined', name);
    io.to('game').emit('players', getPlayers());
    callback();
  });

  socket.on('pacmanMove', dir => socket.broadcast.to('game').emit('pacmanMove', dir));
  socket.on('ghostsMove', ghosts => socket.broadcast.to('game').emit('ghostsMove', ghosts));
  socket.on('ateCherry', question => socket.broadcast.to('game').emit('ateCherry', question));

  socket.on('disconnect', () => {
    console.log(name + ' disconnected');
    removePlayer(socket.id);
    io.to('game').emit('disconnected', name);
  });
});


server.listen(port, () => console.log(`App listening on port ${port}!`));