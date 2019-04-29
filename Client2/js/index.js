import { ToolTip, APIHandler, MapLoader, Chat, PlayerDataHandler, InteractableTileMapping, Physics } from './Modules/ModuleLoader.js';

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
const ITM = new InteractableTileMapping;
let SKIN;
let cursors;
let player;
let showDebug = true;

var aboveLayer;
var act;
var map;
var PDH;
var speed = 200;
var collidedInteractable = false;

function preload() {
  SKIN = localStorage.getItem("skin") || "Brown";
  this.load.image("tiles2", "assets/tilesets/SBU RD (1).png");
  this.load.image("tiles4", "assets/tilesets/SBU house .png");
  this.load.image("beds", "assets/tilesets/Beds.png");

  this.load.image("tiles3", "assets/tilesets/Maze Tile.png");
  this.load.image("foods", "assets/tilesets/food.png");
  this.load.image("chair_tables", "assets/tilesets/ChairTables.png");
  this.load.image("tiles", "assets/tilesets/SBU.png");
  this.load.image("signs", "assets/tilesets/signs.png");
  this.load.image("solids", "assets/tilesets/Solids.png");

  this.load.tilemapTiledJSON("map", "assets/tilemaps/mainMap.json");
  this.load.atlas("Brown", "assets/atlas/Brown.png", "assets/atlas/Brown.json");
  this.load.atlas("Goku_Black", "assets/atlas/Goku_Black.png", "assets/atlas/Goku_Black.json");
}

function create() {
  map = this.make.tilemap({ key: "map" });
  PDH = new PlayerDataHandler();

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
   * 
   * Welcoming signs 198 [42 long]
   */
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
  interactableLayer.setTileIndexCallback(135, function() {
    tileInteraction("cashForCredit");
  });

  aboveLayer.setDepth(10);

  // this code snippet only for main map... not for submaps
  let spawnData = document.getElementById("map").getAttribute("prevmaploc");
  let spawnPoint = {};
  if (spawnData === null || spawnData === undefined) {
    if (localStorage.getItem("location") === null || localStorage.getItem("location") === undefined) {
      spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    } else {
      console.log("USE OLD SPAWN");
      let spawnP = localStorage.getItem("location").split(",");
      spawnPoint.x = parseFloat(spawnP[0]);
      spawnPoint.y = parseFloat(spawnP[1]);
    }
  } else {
    spawnPoint.x = parseFloat(spawnData.split(",")[0]);
    spawnPoint.y = parseFloat(spawnData.split(",")[1]);
    document.getElementById("map").removeAttribute("prevmaploc");
  }

  let brown = {size: {w: 20, h: 20}, offset: {x: 54, y: 44}, scale: 0.8};
  let goku = {size: {w: 60, h: 60}, offset: {x: 15, y: 200}, scale: 0.25};
  let skinData;
  if (SKIN == "Brown") {
    skinData = brown;
  } else if (SKIN == "Goku_Black" || SKIN == "Goku_Red") {
    skinData = goku;
  } else {
    skinData = brown;
  }
  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, SKIN, SKIN + "-Standing.000")
    .setSize(skinData["size"].w, skinData["size"].h)
    .setOffset(skinData["offset"].x, skinData["offset"].y); // x then y
  player.setScale( skinData["scale"] );

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);
  this.physics.add.collider(player, interactableLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const anims = this.anims;
  anims.create({
    key: SKIN + "-Walking-Left",
    frames: anims.generateFrameNames(SKIN, {
      prefix: SKIN + "-Walking-Left.",
      start: 0,
      end: 4,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: SKIN + "-Walking-Right",
    frames: anims.generateFrameNames(SKIN, {
      prefix: SKIN + "-Walking-Right.",
      start: 0,
      end: 4,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: SKIN + "-Walking-Up",
    frames: anims.generateFrameNames(SKIN, {
      prefix: SKIN + "-Walking-Up.",
      start: 0,
      end: 4,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: SKIN + "-Walking-Down",
    frames: anims.generateFrameNames(SKIN, {
      prefix: SKIN + "-Walking-Down.",
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

  // for hiding the help menu on future visits
  let showHelp = JSON.parse(localStorage.getItem("showHelp"));
  if (typeof showHelp != "boolean") {
    localStorage.setItem("showHelp", false); // for next time
    showHelp = true; // for this time
  }
  let helpMenuTitle = new ToolTip({
    game: this,
    text: "Help Menu\n",
    align: "center",
    clickDestroy: false,
    depth: 100,
    visible: showHelp,
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
    visible: showHelp,
    y: 90,
    x: 16,
  });
  let helpMenuRight = new ToolTip({
    game: this,
    text: "[M] Show Minigames\n\n[Y] Accept transaction\n[N] Reject transaction\n\n[T] Toggle chat\n\n[I] Open/close inventory\n\n[P] Turn on/off phone\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: showHelp,
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
    if ($("#player-phone").is(":visible")) {
      $("#player-phone").hide();
    } else {
      $("#player-phone").show();
    }
  });

  this.input.keyboard.on("keydown-" + "I", event => {
    // ONLY FOR FOR MAIN WORLD...
    localStorage.setItem("location", player.x + "," + player.y);
    PDH.toggleInventory();
  });

  // Debug graphics
  this.input.keyboard.once("keydown_D", event => {
    this.physics.world.createDebugGraphic();
    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    interactableLayer.renderDebug(graphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    });
  });

  this.input.keyboard.on("keydown-" + "T", event => {
    if ($("#chat-box").is(":visible")) {
      $("#chat-box").hide();
      $("#chat-box").val("");
      $("#chat-box").blur();
      $("#pre-chat").removeClass("visible-box");
      $(".child-comment").finish().hide();
    } else {
      $("#chat-box").show();
      $("#chat-box").focus();
      $("#chat-box").val("");
      $("#pre-chat").addClass("visible-box");
      $(".child-comment").finish().show();
    }
    event.preventDefault();
    event.stopPropagation();
  });

  if (JSON.parse(localStorage.getItem("chat_loaded")) === false) {
    const chat = new Chat();
  } else {
    const chat = new Chat({initChat: true});
  }

  const physicsGen = new Physics({physics: this.physics});
  physicsGen.add_npc({
    spawn: {x: player.x + 50, y: player.y},
    immovable: false
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
    player.anims.play(SKIN + "-Walking-Left", true);
  } else if (cursors.right.isDown) {
    player.anims.play(SKIN + "-Walking-Right", true);
  } else if (cursors.up.isDown) {
    player.anims.play(SKIN + "-Walking-Up", true);
  } else if (cursors.down.isDown) {
    player.anims.play(SKIN + "-Walking-Down", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture(SKIN, SKIN + "-Walking-Left.000");
    else if (prevVelocity.x > 0) player.setTexture(SKIN, SKIN + "-Walking-Right.000");
    else if (prevVelocity.y < 0) player.setTexture(SKIN, SKIN + "-Walking-Up.000");
    else if (prevVelocity.y > 0) player.setTexture(SKIN, SKIN + "-Walking-Down.000");
  }
}

function tileInteraction(itemType) {
  if (collidedInteractable) {
    return; // the menu is open. so don't open new interactions... stop here.
  }

  console.log("interactions...");

  let playerData = JSON.parse(localStorage.getItem("player"));
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
  } else {
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

    act.input.keyboard.once("keydown-" + "Y", event => {
      if (itemType == "cashForCredit") {
        $("#toastNotification").show();
        if (playerData.cash - cost < 0) {
          $("#toastNotification").html(
            "<center style='color:red'>Not enough cash!</center>"
          ).fadeOut(3000);
        } else {
          $("#toastNotification").html(
            "<center style='color:green'>Purchased successfuly!</center>"
          ).fadeOut(3000);
          playerData.cash -= cost;
          playerData.credits += benefit;
          updateStats(playerData);
        }
      } else if (["door-east", "door-west", "door-wang"].includes(itemType)) {
        console.log("Loading FoodCourt");
        act.game.destroy();
        const loader = new MapLoader();
        loader.loadMap({map: "FoodCourt.js", prevMapLoc: {x: player.x, y: player.y}});
      } else if (["door-roth"].includes(itemType)) {
        console.log("Loading Dorm");
        act.game.destroy();
        const loader = new MapLoader();
        loader.loadMap({map: "Dorm.js", prevMapLoc: {x: player.x, y: player.y}});
      } else if (["door-the-sac"].includes(itemType)) {
        console.log("Loading SAC");
        act.game.destroy();
        const loader = new MapLoader();
        loader.loadMap({map: "SAC.js", prevMapLoc: {x: player.x, y: player.y}});
      } else {
        alert("Not yet implemented!");
        console.log("unimplemented process!");
      }
      $("#prompt").hide();
      collidedInteractable = false;
      delete act.input.keyboard._events['keydown-N']
      return;
    });
  
    act.input.keyboard.once("keydown-" + "N", event => {
      console.log("dont interact thing");
      $("#prompt").hide();
      collidedInteractable = false;
      delete act.input.keyboard._events['keydown-Y']
      return;
    });
  }
}

function updateStats(playerData) {
  let playerString = JSON.stringify(playerData);
  localStorage.setItem("player", playerString);

  $.ajax({
    url: "http://ilankleiman.com/StonyBrookSimu/CServer/index.php?method=save_user&username="+encodeURI(playerData.name),
    type: 'post',
    dataType: 'json',
    //contentType: 'application/json', // ????
    success: function (data) {
      console.log("success");
    },
    data: playerString
  });

  $("#player-name").html(playerData.name);
  $("#player-idn").html("ID: "+playerData.idn);
  $("#player-year").html("Year: "+playerData.year);
  $("#player-credits").html("Credits: "+playerData.credits + "/120");
  $("#player-cash").html("$"+playerData.cash);
  playerData.day = 22;
  let classes = "";
  let i = 0;
  playerData.classes.forEach(function (value) {
    if (i == 0) {
      classes += value;
    } else {
      classes += ", " + value;
    }
    i++;
  });
  $("#player-stats-all").html(
    "" + playerData.name + "\n<br>Day [" + playerData.day + "] - Week ["+ Math.ceil(playerData.day / 7) +"]<br><hr style='border:1px solid white'>" +
    "GPA: " + playerData.gpa + ", " + playerData.year + "<br>" +
    "" + playerData.credits + "/120 Credits <br><hr style='border:1px solid white'>" +
    "Cash: <b>$" + playerData.cash + "</b><br>"+
    "Energy: " + playerData.sleep + "%<br>"+
    "Hunger: " + playerData.hunger + "%<br>"+
    "Thirst: " + playerData.thirst + "%<br>"+
    "Happiness: " + playerData.happiness + "%<br><hr style='border:1px solid white'>"+
    "Classes: " + classes + "<br><hr style='border:1px solid white'>"
  );
}

$(document).ready(function() {
  updateStats(JSON.parse(localStorage.getItem("player")));
  $(document).add('*').off();
});