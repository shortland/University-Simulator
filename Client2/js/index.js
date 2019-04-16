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
  this.load.image("signs", "assets/tilesets/signs.png");
  this.load.image("beds", "assets/tilesets/Beds.png");
  this.load.image("foods", "assets/tilesets/food.png");
  this.load.tilemapTiledJSON("map", "assets/tilemaps/mainMap.json");

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("Brown", "assets/atlas/Brown.png", "assets/atlas/Brown.json");
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
  const signs = map.addTilesetImage("signs", "signs");
  const beds = map.addTilesetImage("Beds", "beds");
  //const foods = map.addTilesetImage("foods", "foods");

  let allTileSets = [tileset, tileset2, tileset3, tileset4, signs, beds];
  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer2 = map.createStaticLayer("Below Player2", allTileSets, 0, 0);
  const belowLayer = map.createStaticLayer("Below Player", allTileSets, 0, 0);
  const worldLayer = map.createStaticLayer("World", allTileSets, 0, 0);
  aboveLayer = map.createStaticLayer("Above Player", allTileSets, 0, 0);
  const interactableLayer = map.createStaticLayer("Interactables", allTileSets, 0, 0);
  //const dynamicLayer = map.createBlankDynamicLayer("DynamicItems", tileset4, 0, 0);

  belowLayer2.setScale( 0.25 );
  belowLayer.setScale( 0.25 );
  worldLayer.setScale( 0.25 );
  aboveLayer.setScale( 0.25 );
  //dynamicLayer.setScale( 0.25 );
  interactableLayer.setScale( 0.25 );

  // set collisions with player and world tiles
  interactableLayer.setCollisionBetween(1, 10000, true, 'Interactables');
  worldLayer.setCollisionBetween(1, 10000, true, 'World');
  act = this;

  /**
   * INTERACTIONS WITH TILES
   */

  // let doors = [
  //   "door-west",
  //   "door-east",
  //   "door-roth",
  //   "door-javitz",
  //   "door-new-cs",
  //   "door-the-sac",
  //   "door-humanities",
  //   "door-rec-center",
  //   "door-staller",
  //   "door-wang",
  //   "door-library",
  //   "door-frey-hall",
  //   "door-chemistry",
  //   "door-physics",
  //   "door-ess",
  //   "door-engineering",
  //   "door-light-engineering",
  //   "door-heavy-engineering",
  //   "door-harriman-hall",
  //   "door-psychology"
  // ];

  // welcoming signs 198 [42 long]
  //let signsArr = Array.from({length: 42}, (v, k) => k+198); 
  interactableLayer.setTileIndexCallback([198], () => {
    tileInteraction("sign-west");
  });
  interactableLayer.setTileIndexCallback([199], () => {
    tileInteraction("door-west");
  });
  interactableLayer.setTileIndexCallback([200], () => {
    tileInteraction("sign-east");
  });
  interactableLayer.setTileIndexCallback([201], () => {
    tileInteraction("door-east");
  });
  interactableLayer.setTileIndexCallback([202], () => {
    tileInteraction("sign-roth");
  });
  interactableLayer.setTileIndexCallback([203], () => {
    tileInteraction("door-roth");
  });
  interactableLayer.setTileIndexCallback([204], () => {
    tileInteraction("sign-javitz");
  });
  interactableLayer.setTileIndexCallback([205], () => {
    tileInteraction("door-javitz");
  });
  interactableLayer.setTileIndexCallback([206], () => {
    tileInteraction("sign-new-cs");
  });
  interactableLayer.setTileIndexCallback([207], () => {
    tileInteraction("door-new-cs");
  });
  interactableLayer.setTileIndexCallback([208], () => {
    tileInteraction("sign-the-sac");
  });
  interactableLayer.setTileIndexCallback([209], () => {
    tileInteraction("door-the-sac");
  });
  interactableLayer.setTileIndexCallback([210], () => {
    tileInteraction("sign-humanities");
  });
  interactableLayer.setTileIndexCallback([211], () => {
    tileInteraction("door-humanities");
  });
  interactableLayer.setTileIndexCallback([212], () => {
    tileInteraction("sign-rec-center");
  });
  interactableLayer.setTileIndexCallback([213], () => {
    tileInteraction("door-rec-center");
  });
  interactableLayer.setTileIndexCallback([214], () => {
    tileInteraction("sign-staller");
  });
  interactableLayer.setTileIndexCallback([215], () => {
    tileInteraction("door-staller");
  });
  interactableLayer.setTileIndexCallback([216], () => {
    tileInteraction("sign-wang");
  });
  interactableLayer.setTileIndexCallback([217], () => {
    tileInteraction("door-wang");
  });
  interactableLayer.setTileIndexCallback([218], () => {
    tileInteraction("sign-library");
  });
  interactableLayer.setTileIndexCallback([219], () => {
    tileInteraction("door-library");
  });
  interactableLayer.setTileIndexCallback([220], () => {
    tileInteraction("sign-frey-hall");
  });
  interactableLayer.setTileIndexCallback([221], () => {
    tileInteraction("door-frey-hall");
  });
  interactableLayer.setTileIndexCallback([222], () => {
    tileInteraction("sign-chemistry");
  });
  interactableLayer.setTileIndexCallback([223], () => {
    tileInteraction("door-chemistry");
  });
  interactableLayer.setTileIndexCallback([224], () => {
    tileInteraction("sign-physics");
  });
  interactableLayer.setTileIndexCallback([225], () => {
    tileInteraction("door-physics");
  });
  interactableLayer.setTileIndexCallback([226], () => {
    tileInteraction("sign-ess");
  });
  interactableLayer.setTileIndexCallback([227], () => {
    tileInteraction("door-ess");
  });
  interactableLayer.setTileIndexCallback([228], () => {
    tileInteraction("sign-engineering");
  });
  interactableLayer.setTileIndexCallback([229], () => {
    tileInteraction("door-engineering");
  });
  interactableLayer.setTileIndexCallback([230], () => {
    tileInteraction("sign-light-engineering");
  });
  interactableLayer.setTileIndexCallback([231], () => {
    tileInteraction("door-light-engineering");
  });
  interactableLayer.setTileIndexCallback([232], () => {
    tileInteraction("sign-heavy-engineering");
  });
  interactableLayer.setTileIndexCallback([233], () => {
    tileInteraction("door-heavy-engineering");
  });
  interactableLayer.setTileIndexCallback([234], () => {
    tileInteraction("sign-harriman-hall");
  });
  interactableLayer.setTileIndexCallback([235], () => {
    tileInteraction("door-harriman-hall");
  });
  interactableLayer.setTileIndexCallback([236], () => {
    tileInteraction("sign-psychology");
  });
  interactableLayer.setTileIndexCallback([237], () => {
    tileInteraction("door-psychology");
  });


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
    .sprite(spawnPoint.x, spawnPoint.y, "Brown", "Brown-Standing.000")
    .setSize(30, 40)
    .setOffset(49, 24); // x then y
  player.setScale( 0.8 );

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);
  //this.physics.add.collider(player, dynamicLayer);
  this.physics.add.collider(player, interactableLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const anims = this.anims;
  anims.create({
    key: "Brown-Walking-Left",
    frames: anims.generateFrameNames("Brown", {
      prefix: "Brown-Walking-Left.",
      start: 0,
      end: 4,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "Brown-Walking-Right",
    frames: anims.generateFrameNames("Brown", {
      prefix: "Brown-Walking-Right.",
      start: 0,
      end: 4,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "Brown-Walking-Up",
    frames: anims.generateFrameNames("Brown", {
      prefix: "Brown-Walking-Up.",
      start: 0,
      end: 4,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "Brown-Walking-Down",
    frames: anims.generateFrameNames("Brown", {
      prefix: "Brown-Walking-Down.",
      start: 0,
      end: 4,
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
    text: "⬅️: Move left\n➡️: Move right\n⬆️: Move up\n⬇️: Move down\n\n[H] Show/hide this help menu\n\n[S] Show all player stats\n\n[Z] Toggle running (devmode)\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: true,
    y: 90,
    x: 16,
  });
  let helpMenuRight = new ToolTip({
    game: this,//[P] Turn on/off phone //[I] Open/close inventory
    text: "[M] Show Minigames\n\n[Y] Accept transaction\n[N] Reject transaction\n\n[T] Toggle chat\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: true,
    y: 90,
    x: 416
  });

  this.input.keyboard.on("keydown-" + "M", event => {
    if ($(".minigames").is(":visible")) {
      $(".minigames").hide();
    } else {
      $(".minigames").show();
      $(".minigames").html(
        "<center>"+
        "<h3>More games coming soon!</h3>" +
        "Click <b id='play_coin' style='text-decoration:underline;cursor:pointer;'>[here]</b> to play the minigame: 'Coin Game'"+
        "<br>You'll have 10 seconds to win cash for your player!" +
        "</center>"
      );
      $("#play_coin").click(function(event)  {
        localStorage.setItem("coin_win", 0);
        $(".minigames").html("<iframe id='minigame_frame' src='coin.html' frameBorder='0px'></iframe>");
        $("#minigame_frame").focus();
        setTimeout(() => {
          $(".minigames").html("");
          $(".minigames").hide();
          alert("Time's up! You won " + localStorage.getItem("coin_win"));
          let player = JSON.parse(localStorage.getItem("player"));
          player.cash = parseInt(player.cash) + parseInt(localStorage.getItem("coin_win"));
          updateStats(player);
        }, 10000);
      });
    }
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

  this.input.keyboard.on("keydown-" + "S", event => {
    if ($("#player-stats-all").is(":visible")) {
      $("#player-stats-all").hide();
    } else {
      $("#player-stats-all").show();
    }
  });

  this.input.keyboard.on("keydown-" + "P", event => {
    alert("Not yet implemented");
  });

  this.input.keyboard.on("keydown-" + "I", event => {
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
      e.keyCode == 83 || // s
      e.keyCode == 73 || // i
      e.keyCode == 77 ||
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
    player.anims.play("Brown-Walking-Left", true);
  } else if (cursors.right.isDown) {
    player.anims.play("Brown-Walking-Right", true);
  } else if (cursors.up.isDown) {
    player.anims.play("Brown-Walking-Up", true);
  } else if (cursors.down.isDown) {
    player.anims.play("Brown-Walking-Down", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("Brown", "Brown-Walking-Left.000");
    else if (prevVelocity.x > 0) player.setTexture("Brown", "Brown-Walking-Right.000");
    else if (prevVelocity.y < 0) player.setTexture("Brown", "Brown-Walking-Up.000");
    else if (prevVelocity.y > 0) player.setTexture("Brown", "Brown-Walking-Down.000");
  }
}

function tileInteraction(itemType) {
  if (collidedInteractable) {
    return; // the menu is open. so don't open new interactions... stop here.
  }

  console.log("interactions...");

  let player = JSON.parse(localStorage.getItem("player"));
  let message;
  let cost;
  let benefit;

  let signs = [
    "sign-west",
    "sign-east",
    "sign-roth",
    "sign-javitz",
    "sign-new-cs",
    "sign-the-sac",
    "sign-humanities",
    "sign-rec-center",
    "sign-staller",
    "sign-wang",
    "sign-library",
    "sign-frey-hall",
    "sign-chemistry",
    "sign-physics",
    "sign-ess",
    "sign-engineering",
    "sign-light-engineering",
    "sign-heavy-engineering",
    "sign-harriman-hall",
    "sign-psychology"
  ];

  let doors = [
    "door-west",
    "door-east",
    "door-roth",
    "door-javitz",
    "door-new-cs",
    "door-the-sac",
    "door-humanities",
    "door-rec-center",
    "door-staller",
    "door-wang",
    "door-library",
    "door-frey-hall",
    "door-chemistry",
    "door-physics",
    "door-ess",
    "door-engineering",
    "door-light-engineering",
    "door-heavy-engineering",
    "door-harriman-hall",
    "door-psychology"
  ];

  if (itemType == "cashForCredit") {
    message = "Buy 1 credit for $200?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
    cost = 200; // cash
    benefit = 1; // credit
  } else if (signs.includes(itemType)) {
    let location = itemType.substring(5);
    $("#toastNotification").show();
    $("#toastNotification").html(
      "<center style='color:blue'>Welcome to "+location.toUpperCase()+"!</center>"
    ).fadeOut(3000);
    return;
  } else if (doors.includes(itemType)) {
    let location = itemType.substring(5);
    message = "Enter "+location.toUpperCase()+"?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
  } else if (itemType == 'door') {
    console.log("There's a hidden doormat here. Devs need to remove it - as it's now deprecated...");
    return;
  }
  else {
    message = "UNKNOWN INTERACTION @function tileInteract(itemType:"+itemType+")";
  }

  if ($("#prompt").is(":visible")) {
    collidedInteractable = true;
  } else {
    $("#prompt").show();
    collidedInteractable = true;
    $("#prompt").html(
      "<center>"+message+"</center>"
    );

    act.input.keyboard.on("keydown-" + "Y", event => {
      if (itemType == "cashForCredit") {
        $("#toastNotification").show();
        if (player.cash - cost < 0) {
          $("#toastNotification").html(
            "<center style='color:red'>Not enough cash!</center>"
          ).fadeOut(3000);
        } else {
          $("#toastNotification").html(
            "<center style='color:green'>Purchased successfuly!</center>"
          ).fadeOut(3000);
          player.cash -= cost;
          player.credits += benefit;
          updateStats(player);
        }
      } else {
        alert("Not yet implemented!");
        console.log("unimplemented process!");
      }
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

    act.input.keyboard.on("keydown-" + "Y", event => {
    });
    act.input.keyboard.on("keydown-" + "N", event => {
    });
  }
}

function updateStats(player) {
  let playerString = JSON.stringify(player);
  localStorage.setItem("player", playerString);

  $.ajax({
    url: "http://ilankleiman.com/StonyBrookSimu/CServer/index.php?method=save_user&username="+encodeURI(player.name),
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
      console.log("success");
    },
    data: playerString
  });

  $("#player-name").html(player.name);
  $("#player-idn").html("ID: "+player.idn);
  $("#player-year").html("Year: "+player.year);
  $("#player-credits").html("Credits: "+player.credits + "/120");
  $("#player-cash").html("$"+player.cash);
  player.day = 22;
  let classes = "";
  let i = 0;
  player.classes.forEach(function (value) {
    if (i == 0) {
      classes += value;
    } else {
      classes += ", " + value;
    }
    i++;
  });
  $("#player-stats-all").html(
    "" + player.name + "\n<br>Day [" + player.day + "] - Week ["+ Math.ceil(player.day / 7) +"]<br><hr style='border:1px solid white'>" +
    "GPA: " + player.gpa + ", " + player.year + "<br>" +
    "" + player.credits + "/120 Credits <br><hr style='border:1px solid white'>" +
    "Cash: <b>$" + player.cash + "</b><br>"+
    "Energy: " + player.sleep + "%<br>"+
    "Hunger: " + player.hunger + "%<br>"+
    "Thirst: " + player.thirst + "%<br>"+
    "Happiness: " + player.happiness + "%<br><hr style='border:1px solid white'>"+
    "Classes: " + classes + "<br><hr style='border:1px solid white'>"
  );
}

$(document).ready(function() {
  updateStats(JSON.parse(localStorage.getItem("player")));
});