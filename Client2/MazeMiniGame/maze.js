var config = {
    type: Phaser.AUTO,
    width:  690,//128*7,
    height: 360, //128*7,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
          debug : true,
          gravity: { y: 0 }, // Top down game, so no gravity
        }
      }
};

var game = new Phaser.Game(config);
var cursors;
var player;
var done = 0;
var counter = 0;
var mazeIndex;
function preload ()
{
    this.load.image("tiles","mazeMaps/MazeTile.png");
    this.load.tilemapTiledJSON('maze', "mazeMaps/maze.json");
    this.load.tilemapTiledJSON('maze2', "mazeMaps/maze2.json");
    this.load.tilemapTiledJSON('maze3', "mazeMaps/maze3.json");
    this.load.tilemapTiledJSON('maze4', "mazeMaps/maze4.json");
    this.load.tilemapTiledJSON('maze5', "mazeMaps/maze5.json");
    this.load.spritesheet('randomGuy',"spriteGOKU.png", { frameWidth: 128, frameHeight: 280 });
    //{ frameWidth: 32, frameHeight: 70 }
}

function create ()
{   
    mazeIndex = Math.floor(Math.random() * 4); 
    $("#done").hide();
    var map;
    switch(mazeIndex){
      case 0:
        map = this.make.tilemap({key:"maze"});
        break;
      case 1:
        map = this.make.tilemap({key:"maze2"});
        break;
      case 2:
        map = this.make.tilemap({key:"maze3"});
        break;
      case 3:
        map = this.make.tilemap({key:"maze4"});
        break;
      case 4:
        map = this.make.tilemap({key:"maze5"});
        break;
      default:
        console.log("The maze index doesn't exist load the maze 1 by default");
        map = this.make.tilemap({key:"maze"});
    }
    
    const tileset = map.addTilesetImage("tiles", "tiles");
    

    const backGroundLayer = map.createStaticLayer("background", tileset, 0, 0);
    const blockingLayer = map.createStaticLayer("blocking", tileset, 0, 0);
    const done = map.createDynamicLayer("done",tileset,0,0);
    backGroundLayer.setScale(0.8);
    blockingLayer.setScale(0.8);
    done.setScale(0.8);

    blockingLayer.setCollisionBetween(1,2500,true, 'blocking');

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // blockingLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    player = this.physics.add.sprite(192,192, 'randomGuy');
    //player.setCollideWorldBounds(true);
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('randomGuy', { start: 15, end: 19 }),
        frameRate: 5,
        repeat: 1
    });

    this.anims.create({
        key:'idle',
        frames: this.anims.generateFrameNumbers('randomGuy', { start: 0, end: 4 }),
        frameRate: 5,
        repeat: 1
    })
    
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('randomGuy', { start: 20, end: 24 }),
        frameRate: 10,
        repeat: 1
    });
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('randomGuy', { start: 5, end: 9 }),
        frameRate: 5,
        repeat: 1
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('randomGuy', { start: 10, end: 14 }),
        frameRate: 5,
        repeat: 1
    });
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(player, blockingLayer);
    this.cameras.main.startFollow(player);

    
    player.setScale(0.45);
    player.setSize(90,100);
    player.setOffset(0,155);
    done.setTileIndexCallback(71, finishMaze, this); 
    this.physics.add.overlap(player, done);
    const gateLayer = map.createStaticLayer("gate", tileset, 0, 0);
    gateLayer.setScale(0.8);

}
function finishMaze(){
  if (done == 1){
    console.log("done");
    localStorage.setItem("coin_win", 200);
    setTimeout(function(){ this.game.destroy();}, 1000);
  }
  else{
    // shake the camera
    this.cameras.main.shake(300);
    
    // fade camera
    this.time.delayedCall(250, function() {
      this.cameras.main.fade(250);
    }, [], this);
    done = 1;
    $("#done").show();
    $("#start").hide();
  }
  
  
}

function update ()
{
    player.body.setVelocity(0);
    player.anims.play('idle',true);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-600);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(600);
    player.anims.play('right', true);
  }

  // Vertical movement
  else if (cursors.up.isDown) {
    player.body.setVelocityY(-600);
    player.anims.play('up', true);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(600);
    player.anims.play('down', true);
  }
  if(counter <=100){
    counter ++;
  }
  if(counter > 100){
    $("#start").hide();
  }
  // Normalize and scale the velocity so that player can't move faster along a diagonal
  //this.player.body.velocity.normalize().scale(speed);
}