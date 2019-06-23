import Player from './player.js';
import Ghost from './ghost.js';

const config = {
  type: Phaser.AUTO,
  width: 896,
  height: 640,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};
const offset = 16;
const port = 8080;
const questionTimeout = 17000;
const adminNumber = 1;
let map;
let scene;
let cursors;
let worldLayer;
let ghostsGroup;
let candiesGroup;
let cherriesGroup;
let questions;
let questionCnt = 0;
let candiesCnt = 0;
let socket;
let ready = false;
let me;
let enemy;
let keyA, keyW, keyS, keyD;
const ghosts = [];
const ghostsTexture = ['blue-ghost.0','orange-ghost.0','pink-ghost.0','red-ghost.0'];
const name = localStorage.getItem('name');
const email = localStorage.getItem('email');
const numberOfPlayers = localStorage.getItem('number-of-players');
const game = new Phaser.Game(config);


// Runs once, loads up assets like images and audio
function preload() {
  // add the tile map
  this.load.tilemapTiledJSON("map", "images/map/tilemap.json");
  this.load.image("tiles", "images/map/tiles-32px.png");
  this.load.image("candy", "images/candy/candy.png");
  this.load.image("cherry", "images/candy/cherry.png");
  this.load.atlas("atlas", "images/atlas/atlas.png", "images/atlas/atlas.json");
  if (numberOfPlayers == 1) ready = true;
}

// Runs once, after all assets in preload are loaded
function create() {
  scene = this;
  map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("tiles");

  worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  worldLayer.setCollisionByProperty({ collides: true });

  // initialize the desgin
  initDesign();

  // add Ghosts/candy to the map
  addGhostsAndCandies(); 

  // manage animations
  addAnimations();
  cursors = scene.input.keyboard.createCursorKeys();
  keyW = scene.input.keyboard.addKey('W');
  keyA = scene.input.keyboard.addKey('A');
  keyS = scene.input.keyboard.addKey('S'); 
  keyD = scene.input.keyboard.addKey('D');

  // // Debug graphics
  scene.input.keyboard.once('keydown_X', event => {
    // Turn on physics debugging to show player's hitbox
    scene.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = scene.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });

    for (let ghost of ghosts) ghost.debugMode = true;
  });

  // get all questions from server
  fetch('/questions').then((response) => { response.json().then(q =>  questions = q)});

  // init game for one player or two players
  if (numberOfPlayers == 1) initGameForOne();
  else initGameForTwo();
}

// Runs once per frame for the duration of the scene
function update() {
  if (!ready) return;

  me.animate();
  if (enemy) enemy.animate();

  if (cursors.left.isDown)        me.go(Phaser.LEFT);
  else if (cursors.right.isDown)  me.go(Phaser.RIGHT);
  else if (cursors.up.isDown)     me.go(Phaser.UP);
  else if (cursors.down.isDown)   me.go(Phaser.DOWN);
  if (enemy) {
    if (keyA.isDown)              enemy.go(Phaser.LEFT);
    else if (keyW.isDown)         enemy.go(Phaser.UP);
    else if (keyS.isDown)         enemy.go(Phaser.DOWN);
    else if (keyD.isDown)         enemy.go(Phaser.RIGHT);
  }

  if (me.isCollide) me.stopAnimate();
  if (enemy && enemy.isCollide) enemy.stopAnimate();

  for (let ghost of ghosts) ghost.go();

  if (numberOfPlayers == 2 && me.id == adminNumber) {
    const ghostsMovement = [];
    for (let ghost of ghosts) {
      ghostsMovement.push({ 
        frame: ghost.sprite.frame.name,
        x: ghost.sprite.x,
        y: ghost.sprite.y
      });
    }
    socket.emit('ghostsMove', ghostsMovement);
  }
}

// add collision between objects
function addColliders() {
  scene.physics.add.overlap(me.sprite, ghostsGroup, (player, ghost) => {
    let g;
    for (let gg of ghosts) if (gg.sprite == ghost) g = gg;
    playerCollideWithGhost(me, g);
  });

  scene.physics.add.overlap(me.sprite, candiesGroup, (player, candy) => {
    playerCollideWithCandy(me, candy);
  });

  scene.physics.add.overlap(me.sprite, cherriesGroup, (player, cherry) => {
    cherry.disableBody(true, true);
    ateCherry(me);
  });

  // if (player2) {
  //   scene.physics.add.overlap(player2.sprite, ghostsGroup, (player, ghost) => { 
  //     let g;
  //     for (let gg of ghosts) if (gg.sprite == ghost) g = gg;
  //     playerCollideWithGhost(player2, g);
  //   });
    
  //   scene.physics.add.overlap(player2.sprite, candiesGroup, (player, candy) => {
  //     playerCollideWithCandy(player2, candy);
  //   });

  //   scene.physics.add.overlap(player2.sprite, cherriesGroup, (player, cherry) => {
  //     cherry.disableBody(true, true);
  //     ateCherry(player2);
  //   });
  // }
}

// add player to the maze
function addPlayer(name, number) {
  let spawnPoint = map.findObject("Objects", obj => obj.name === 'player' + number + ' spawn point');
  let position = new Phaser.Geom.Point(spawnPoint.x + offset, spawnPoint.y + offset);
  let angle;
  if (number == 1) angle = 0;
  else angle = 180;
  const player = new Player(number, name, scene, position, angle);
  scene.physics.add.collider(player.sprite, worldLayer, () => player.isCollide = true);
  document.getElementById('player' + number + '-name').innerHTML = name;
  return player;
}

// add ghosts and candies to the maze
function addGhostsAndCandies() {
  ghostsGroup = scene.physics.add.group();
  candiesGroup = scene.physics.add.group();
  cherriesGroup = scene.physics.add.group();
  let i = 0;
  map.filterObjects("Objects", value => {
    if (value.name == 'Ghost') {
      let currentTile = map.getTileAtWorldXY(value.x + offset, value.y + offset, true);
      let pixelX = currentTile.pixelX;
      let pixelY = currentTile.pixelY;
      let ghost = new Ghost(
        scene.physics.add.sprite(pixelX, pixelY, 'atlas', ghostsTexture[i]).setOrigin(0).setDepth(1),
        new Phaser.Geom.Point(pixelX, pixelY),
        worldLayer, map, scene
      );
      ghosts.push(ghost);
      ghostsGroup.add(ghost.sprite);
      i++;
    }
    else if (value.name == 'candy') {
      candiesGroup.add(scene.physics.add.sprite(value.x + offset, value.y + offset, 'candy').setScale(0.8));
      candiesCnt++;
    }
    else if (value.name == 'cherry') {
      cherriesGroup.add(scene.physics.add.sprite(value.x + offset, value.y + offset, 'cherry').setScale(0.8));
    }
  });
}

// add animations to the pacman
function addAnimations() {
  scene.anims.create({
    key: "pacman-left-walk",
    frames: scene.anims.generateFrameNames("atlas", {
      prefix: "pacman-eat.",
      start: 0,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: "pacman-right-walk",
    frames: scene.anims.generateFrameNames("atlas", {
      prefix: "pacman-eat.",
      start: 0,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: "pacman-up-walk",
    frames: scene.anims.generateFrameNames("atlas", {
      prefix: "pacman-eat.",
      start: 0,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: "pacman-down-walk",
    frames: scene.anims.generateFrameNames("atlas", {
      prefix: "pacman-eat.",
      start: 0,
      end: 4
    }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: "pacman-die",
    frames: scene.anims.generateFrameNames("atlas", {
      prefix: 'pacman-death.',
      start: 0,
      end: 2
    }),
    frameRate: 10,
    repeat: -1
  });
}

function restart() {
  me.restart();
  document.getElementById('player1-lifes').innerHTML = me.lifes;
  document.getElementById('player1-points').innerHTML = me.points;
  if (enemy) {
    enemy.restart();
    document.getElementById('player2-lifes').innerHTML = enemy.lifes;
    document.getElementById('player2-points').innerHTML = enemy.points;
  }
  for (let ghost of ghosts) ghost.restart();
  map.filterObjects("Objects", value => {
    if (value.name == 'candy') 
      candiesGroup.add(scene.physics.add.sprite(value.x + offset, value.y + offset, 'candy').setScale(0.8));
      candiesCnt++;
  });
}

function ateCherry(player) {
  let dom = 'player' + player.id + '-question';
  if (!questions.length) {
    alert('No questions');
    return;
  }
  const choosed = Math.floor( Math.random() * (questions.length));
  player.question = questions[choosed];
  questions.splice(choosed, 1);
  document.getElementById(dom).innerHTML = player.question.question;
  updateGhostsToEaten(player.question);
  questionCnt++;
  setTimeout(() => {
    if (!--questionCnt) updateGhostsToNotEaten();
    document.getElementById(dom).innerHTML = '';
  }, questionTimeout);
}

function playerCollideWithGhost(player, ghost) {
  const question = player.question;
  if (ghost.isEaten && question) {
    const correctAns = question.options[question.answer];
    const ghostAns = ghost.answer.text;
    ghost.restart();
    if (correctAns == ghostAns) {
      player.addPoint(question.point);
      updateGhostsToNotEaten();
      document.getElementById('player' + player.id + '-question').innerHTML = '';
    }
    else {
      player.subPoint(question.point);
      ghost.enabled = false;
    }
    return;
  }
  if (!player.setLifes(player.lifes - 1))
  {
    if (player.id == 1) {
      if (enemy) alert(`${enemy.name} is the winner`);
      else alert('Loser');
    }
    else alert(`${me.name} is the winner`);
    restart();
  }
}

function playerCollideWithCandy(player, candy) {
  candy.disableBody(true, true);
  player.addPoint(1);
  if (!--candiesCnt) {     
    enemy && enemy.points > me.points ? alert(`${enemy.name} winner`) : alert(`${me.name} winner`);
    restart();
  }
}

function updateGhostsToEaten(question) {
  let i = 0;
  for (let ghost of ghosts) {
    ghost.sprite.setTexture('atlas', 'gost-afraid.0');
    ghost.answer.text = question.options[i++];
    ghost.isEaten = true;
  }
}

function updateGhostsToNotEaten() {
  let i = 0;
  for (let ghost of ghosts) {
    ghost.sprite.setTexture('atlas', ghostsTexture[i++]);
    ghost.answer.text = '';
    ghost.isEaten = false;
    ghost.enabled = true;
  }
}

function initDesign() {
  if (numberOfPlayers == 2) return; 
  document.getElementById('player2').style.display = 'none';
  document.getElementById('player1').style.top = '10px';
  document.getElementById('player1').style.left = '50%';
  document.getElementById('player1').style.transform = 'translate(-50%)';
  document.getElementById('player1').style.minHeight = '120px';
  document.getElementById('player1').style.width = '936px';
  document.getElementById('player1-name').style.marginTop = '8px';
  document.getElementById('player1-points').style.marginRight = '30px';
  document.querySelector('#player1 p:nth-child(2)').style.display = 'inline';
  document.querySelector('#player1 p:nth-child(3)').style.display = 'inline';
  document.getElementById('game-container').style.top = '98%';
  document.getElementById('game-container').style.transform = 'translate(-50%,-100%)';
}

function initGameForOne() {
  me = addPlayer(name, 1);
  addColliders();
  updateGhostsToNotEaten();
}

function initGameForTwo() {
  socket = io('', { query: 'name=' + name });

  socket.emit('join', { email, name }, error => {
    if (error) {
      alert(error);
      location.href = '/';
    }
  });
    
  socket.on('disconnected', userName => console.log(userName + ' disconnected'));
  
  socket.on('playerHasJoined', playerName => {
    console.log(playerName + ' has joiend');
    updateGhostsToNotEaten();
  });

  socket.on('players', players => {
    if (players.length != 2) return; 
    const player = players.find(player => player.email !== email);
    const myNumber = player.number == 1 ? 2 : 1;
    const enemyNumber = player.number;
    // add players
    me = addPlayer(name, myNumber);
    enemy = addPlayer(player.name, enemyNumber);
    // manage colliders
    addColliders();
    // update method can be execute now
    ready = true;
  });
  socket.on('ghostsMove', ghostsMovement => {
    for (let move of ghostsMovement) {
      for (let ghost of ghosts) {
        if (ghost.sprite.frame.name == move.frame) {
          ghost.sprite.x = move.x;
          ghost.sprite.y = move.y;
        }
      }
    }
  });
}