import { ToolTip, APIHandler } from './Modules/ModuleLoader.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  // height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let cursors;
let player;
let showDebug = true;

var some;
var aboveLayer;
var act;
var map;
var speed = 200;
var collidedInteractable = false;

function preload() {
  this.load.image("tiles", "assets/tilesets/SBU.png");
  this.load.image("tiles2", "assets/tilesets/SBU RD (1).png");
  this.load.image("tiles3", "assets/tilesets/Maze Tile.png");
  this.load.image("tiles4", "assets/tilesets/SBU house .png");
  this.load.tilemapTiledJSON("map", "assets/tilemaps/mainMap.json");

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "assets/atlas/atlas.png", "assets/atlas/atlas.json");
}

function create() {
  some = this;
  map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("SBU", "tiles");
  const tileset2 = map.addTilesetImage("SBU RD (1)", "tiles2");
  const tileset3 = map.addTilesetImage("Maze Tile", "tiles3");
  const tileset4 = map.addTilesetImage("SBU house", "tiles4");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer2 = map.createStaticLayer("Below Player2", [tileset, tileset2, tileset3, tileset4], 0, 0);
  const belowLayer = map.createStaticLayer("Below Player", [tileset, tileset2, tileset3, tileset4], 0, 0);
  const worldLayer = map.createStaticLayer("World", [tileset, tileset2, tileset3, tileset4], 0, 0);
  aboveLayer = map.createStaticLayer("Above Player", [tileset, tileset2, tileset3, tileset4], 0, 0);
  const interactableLayer = map.createStaticLayer("Interactables", [tileset3, tileset4], 0, 0);
  const dynamicLayer = map.createBlankDynamicLayer("DynamicItems", tileset4, 0, 0);

  belowLayer2.setScale( 0.25 );
  belowLayer.setScale( 0.25 );
  worldLayer.setScale( 0.25 );
  aboveLayer.setScale( 0.25 );
  dynamicLayer.setScale( 0.25 );
  interactableLayer.setScale( 0.25 );

  // set collisions with player and world tiles
  interactableLayer.setCollisionBetween(1, 10000, true, 'Interactables');
  worldLayer.setCollisionBetween(1, 10000, true, 'World');
  act = this;

  /**
   * INTERACTIONS WITH TILES
   */
  
  // doors! // 195 is invisible doormat
  interactableLayer.setTileIndexCallback([193, 194, 195], () => {
    tileInteraction("door");
  });

  // crappy chest credit
  interactableLayer.setTileIndexCallback(135, () => {
    tileInteraction("cashForCredit");
  });

  aboveLayer.setDepth(10);

  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    .setSize(30, 40)
    .setOffset(0, 30);
  
  player.setScale( .5 );

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);
  this.physics.add.collider(player, dynamicLayer);
  this.physics.add.collider(player, interactableLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-left-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-right-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-front-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-back-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, 3200, 3200);
  cursors = this.input.keyboard.createCursorKeys();

  let helpMenuTitle = new ToolTip({
    game: this,
    text: "Help Menu\n",
    align: "center",
    clickDestroy: false,
    depth: 100,
    visible: true,
    x: 330,
    y: 16,
  });
  let helpMenuLeft = new ToolTip({
    game: this,
    // \nShift+⬅️: Scroll left\nShift+➡️: Scroll right\nShift+⬆️: Scroll up\nShift+⬇️: Scroll down
    text: "[H] Show/Hide this help menu\n\n⬅️: Move left\n➡️: Move right\n⬆️: Move up\n⬇️: Move down\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: true,
    y: 90,
    x: 16,
  });
  let helpMenuRight = new ToolTip({
    game: this,
    text: "[P] Turn on/off phone\n[Y] Accept transaction\n[N] Reject transaction\n[I] Open/close inventory\n[Tab] Show online players\n[Esc] Show settings\n[T] Toggle chat\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: true,
    y: 90,
    x: 416
  });
  
  this.input.keyboard.on("keydown-" + "H", event => {
    if (helpMenuTitle.visible) {
      helpMenuTitle.setVisible(false);
      helpMenuLeft.setVisible(false);
      helpMenuRight.setVisible(false);
    } else {
      helpMenuTitle.setVisible(true);
      helpMenuLeft.setVisible(true);
      helpMenuRight.setVisible(true);
    }
  });

  this.input.keyboard.on("keydown-" + "Z", event => {
    if (speed == 200) {
      speed = 1000;
    } else {
      speed = 200;
    }
  });

  this.input.keyboard.on("keydown-" + "P", event => {
    alert("Not yet implemented");
  });

  $("#chat-box").on("keydown", function (e) {
    if (
      e.keyCode == 72 || // h
      e.keyCode == 84 || // t
      e.keyCode == 32 || // SpaceBar
      e.keyCode == 80 || // p 
      e.keyCode == 89 || // y
      e.keyCode == 78 || // n
      e.keyCode == 27 || // esc
      e.keyCode == 9 || // tab
      e.keyCode == 13 // enter
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (e.keyCode == 27) {
        $("#chat-box").hide();
        $("#chat-box").val("");
        $("#chat-box").blur();
        return;
      }
      if (e.keyCode == 13) {
        console.log($("#chat-box").val());
        alert("Not yet implemented!");
        $("#chat-box").hide();
        $("#chat-box").val("");
        $("#chat-box").blur();
        return;
      }
      $("#chat-box").val($("#chat-box").val() + String.fromCharCode(e.keyCode).toLowerCase());
    }
  });

  this.input.keyboard.on("keydown-" + "T", event => {
    if ($("#chat-box").is(":visible")) {
      $("#chat-box").hide();
      $("#chat-box").val("");
      $("#chat-box").blur();
    } else {
      $("#chat-box").show();
      $("#chat-box").focus();
      $("#chat-box").val("");
    }
    event.preventDefault();
    event.stopPropagation();
  });
}

function update(time, delta) {
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
  }
}

function tileInteraction(itemType) {
  let message;
  if (itemType == "door") {
    message = "Enter building?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
  } else if (itemType == "cashForCredit") {
    message = "Buy 1 credit for $200?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
  } else {
    message = "UNKNOWN INTERACTION @function tileInteract(itemType):";
  }


  if (!collidedInteractable) {
    if ($("#prompt").is(":visible")) {
      collidedInteractable = true;
    } else {
      $("#prompt").show();
      collidedInteractable = true;
      $("#prompt").html(
        "<center>"+message+"</center>"
      );

      act.input.keyboard.on("keydown-" + "Y", event => {
        console.log("interact thing");
        $("#prompt").hide();
        collidedInteractable = false;
        return;
      });
    
      act.input.keyboard.on("keydown-" + "N", event => {
        console.log("dont interact thing");
        $("#prompt").hide();
        collidedInteractable = false;
        return;
      });
    }
  }
}