export default class Player {
  constructor(id, name, scene, position, initAngle) {
    this.sprite = scene.physics.add.sprite(position.x, position.y, 'atlas', 'pacman-eat.0').setScale(0.75);
    this.sprite.angle = initAngle;
    this.position = position;
    this.lifes = 3;
    this.prevMovement = Phaser.NONE;
    this.scores = 0;
    this.initAngle = initAngle;
    this.speed = 150;
    this.name = name;
    this.id = id;
  }

  animate() {
    switch (this.prevMovement) {
      case Phaser.LEFT:
        this.sprite.anims.play('pacman-left-walk', true);
        break;
      case Phaser.RIGHT:
        this.sprite.anims.play('pacman-right-walk', true);
        break;
      case Phaser.UP:
        this.sprite.anims.play('pacman-up-walk', true);
        break;
      case Phaser.DOWN:
        this.sprite.anims.play('pacman-down-walk', true);
        break;
      case Phaser.NONE:
        this.sprite.anims.stop();
        this.sprite.body.setVelocityX(0);
        this.sprite.body.setVelocityY(0);
        this.sprite.setTexture('atlas', 'pacman-eat.0');
        this.sprite.angle = this.initAngle;
        break;
    }
  }

  stopAnimate() {
    this.sprite.anims.stop();
  }

  go(dir) {
    switch (dir) {
      case Phaser.LEFT:
        this.sprite.body.setVelocityX(-this.speed);
        this.sprite.body.setVelocityY(0);
        this.prevMovement = Phaser.LEFT;
        this.sprite.angle = 180;
        this.isCollide = false;
        break;
      case Phaser.RIGHT:
        this.sprite.body.setVelocityX(this.speed);
        this.sprite.body.setVelocityY(0);
        this.prevMovement = Phaser.RIGHT;
        this.sprite.angle = 0;
        this.isCollide = false;
        break;
      case Phaser.UP:
        this.sprite.body.setVelocityY(-this.speed);
        this.sprite.body.setVelocityX(0);
        this.prevMovement = Phaser.UP;
        this.sprite.angle = 270;
        this.isCollide = false;
        break;
      case Phaser.DOWN:
        this.sprite.body.setVelocityY(this.speed);
        this.sprite.body.setVelocityX(0);
        this.prevMovement = Phaser.DOWN;
        this.sprite.angle = 90;
        this.isCollide = false;
        break;
    }
  }

  restart() {
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
    this.lifes = 3;
    this.scores = 0;
    this.sprite.angle = this.initAngle;
  }

  addPoint(point) {
    this.scores += point;
    document.getElementById('player' + this.id + '-scores').innerHTML = this.scores;
  }

  subPoint(point) {
    this.scores -= point;
    document.getElementById('player' + this.id + '-scores').innerHTML = this.scores;
  }

  setLifes(lifes) {
    this.lifes = lifes;
    document.getElementById('player' + this.id + '-lifes').innerHTML = this.lifes;
    this.sprite.setPosition(this.position.x, this.position.y);
    this.prevMovement = Phaser.NONE;
    return this.lifes;
  }
}