export default class Ghost {
  constructor(id, sprite, position, layer, map, scene) {
    this.id = id;
    this.sprite = sprite;
    this.initPosition = position;
    this.speed = 1;
    this.movement = Phaser.NONE;
    this.layer = layer;
    this.map = map;
    this.graphics = scene.add.graphics();
    this.debugMode = false;
    this.isEaten = false;
    this.answer = scene.add.text(position.x + 16, position.y - 16, '', { fontFamily: '"Roboto Condensed"' }).setOrigin(0.5);
    this.enabled = false;
  }

  go() {
    if (!this.enabled) return;
    const directions = new Set();
    const sx = Phaser.Math.FloorTo(this.sprite.x);
    const sy = Phaser.Math.FloorTo(this.sprite.y);
    const currentTile = this.map.getTileAtWorldXY(sx, sy, true);
    const x = currentTile.x;
    const y = currentTile.y;

    if (!this.map.getTileAt(x - 1, y, true, this.layer).properties.collides) directions.add(Phaser.LEFT);
    if (!this.map.getTileAt(x + 1, y, true, this.layer).properties.collides) directions.add(Phaser.RIGHT);
    if (!this.map.getTileAt(x, y - 1, true, this.layer).properties.collides) directions.add(Phaser.UP);
    if (!this.map.getTileAt(x, y + 1, true, this.layer).properties.collides) directions.add(Phaser.DOWN);
    
    if (directions.has(this.movement))
      directions.delete(this.getOppositeDirection(this.movement));

    this.debug(x, y, directions);

    if (currentTile.pixelX == this.sprite.x && currentTile.pixelY == this.sprite.y)
      this.movement = [...directions][Math.floor( Math.random() * (directions.size))];
    
    this.goTo(this.movement);
  }

  goTo(dir) {
    if (!this.enabled) return;
    switch (dir) {
      case Phaser.LEFT:
        this.sprite.setFlipX(true);
        this.sprite.x -= this.speed;
        this.answer.x -= this.speed;
        break;
      case Phaser.RIGHT:
        this.sprite.setFlipX(false);
        this.sprite.x += this.speed;
        this.answer.x += this.speed;
        break;
      case Phaser.UP:
        this.sprite.y -= this.speed;
        this.answer.y -= this.speed;
        break;
      case Phaser.DOWN:
        this.sprite.y += this.speed;
        this.answer.y += this.speed;
        break;
    }
  }

  getRandomDirection() {
    return this.directions[Math.floor(Math.random() * Math.floor(4))];
  }

  getAnotherDirectionExcept(...dirs) {
    let directions = [Phaser.LEFT, Phaser.RIGHT, Phaser.UP, Phaser.DOWN];
    for (let dir of dirs) {
      let index = directions.indexOf(dir);
      directions.splice(index, 1);
    }
    return directions[Math.floor(Math.random() * Math.floor(4 - dirs.length))];
  }

  getOppositeDirection(dir) {
    if (dir === Phaser.LEFT)  return Phaser.RIGHT;
    if (dir === Phaser.RIGHT) return Phaser.LEFT;
    if (dir === Phaser.UP)    return Phaser.DOWN;
    return Phaser.UP;
  }

  restart() {
    this.sprite.x = this.initPosition.x;
    this.sprite.y = this.initPosition.y;
    this.answer.text = '';
    this.answer.x = this.initPosition.x;
    this.answer.y = this.initPosition.y;
    this.enabled = true;
  }

  debug(x, y, directions) {
    if (!this.debugMode) return;
    this.graphics.clear();
    this.graphics.lineStyle(3, 256);
    this.graphics.strokeRect(
      this.map.getTileAt(x, y, true, this.layer).pixelX,
      this.map.getTileAt(x, y, true, this.layer).pixelY,
      32, 32
    );
    this.graphics.lineStyle(3, 230);
    if (directions.has(Phaser.LEFT)) {
      this.graphics.strokeRect(
        this.map.getTileAt(x - 1, y, true, this.layer).pixelX,
        this.map.getTileAt(x - 1, y, true, this.layer).pixelY,
        32, 32
      );
    }
    if (directions.has(Phaser.RIGHT)) {
      this.graphics.strokeRect(
        this.map.getTileAt(x + 1, y, true, this.layer).pixelX, 
        this.map.getTileAt(x + 1, y, true, this.layer).pixelY,
        32, 32
      );
    }
    if (directions.has(Phaser.UP)) {
      this.graphics.strokeRect(
        this.map.getTileAt(x, y - 1, true, this.layer).pixelX, 
        this.map.getTileAt(x, y - 1, true, this.layer).pixelY,
        32, 32
      );
    }
    if (directions.has(Phaser.DOWN)) {
      this.graphics.strokeRect(
        this.map.getTileAt(x, y + 1, true, this.layer).pixelX, 
        this.map.getTileAt(x, y + 1, true, this.layer).pixelY,
        32, 32
      );
    }
  }
}