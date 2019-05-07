import { ToolTip, APIHandler, MapLoader, Chat, PlayerDataHandler, InteractableTileMapping, Physics, JNotify, Sounds } from './Modules/ModuleLoader.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 0
      }
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
const JNotifier = new JNotify;
const aud = new Sounds;
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

/**
 * AI
 */
const listAI = [];
var movingAI = false;
const prevAiPositions = [];

function preload() {
  SKIN = localStorage.getItem("skin") || "Brown";

  /**
   * Loading Bar
   */
  const progressBar = this.add.graphics();  
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;
  const loadingText = this.make.text({
    x: width / 2,
    y: height / 2 - 50,
    text: 'Loading...',
    style: {
      font: '20px monospace',
      fill: '#ffffff'
    }
  });
  loadingText.setOrigin(0.5, 0.5);
  
  const percentText = this.make.text({
    x: width / 2,
    y: height / 2 - 5,
    text: '0%',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  percentText.setOrigin(0.5, 0.5);
  
  const assetText = this.make.text({
    x: width / 2,
    y: height / 2 + 50,
    text: '',
    style: {
      font: '18px monospace',
      fill: '#ffffff'
    }
  });
  assetText.setOrigin(0.5, 0.5);
  
  this.load.on('progress', function (value) {
    percentText.setText(parseInt(value * 100) + '%');
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(width / 2 - 150, 280, 300 * value, 30);
  });
  
  this.load.on('fileprogress', function (file) {
    assetText.setText('Loading asset: ' + file.key);
  });

  this.load.on('complete', function () {
    progressBar.destroy();
    loadingText.destroy();
    percentText.destroy();
    assetText.destroy();
  });
  
  this.load.image('logo', 'assets/images/UniversitySimulatorLogo.png');
  /**
   * End Loading Bat
   */

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
  this.load.atlas("Cars", "assets/atlas/Cars.png", "assets/atlas/Cars.json");
  
  this.load.atlas("Goku_Black", "assets/atlas/Goku_Black.png", "assets/atlas/Goku_Black.json");
  this.load.atlas("Goku_Red", "assets/atlas/Goku_Red.png", "assets/atlas/Goku_Red.json");

  this.load.atlas("Black_Brown", "assets/atlas/Black_Brown.png", "assets/atlas/Black_Brown.json");
  this.load.atlas("Black", "assets/atlas/Black.png", "assets/atlas/Black.json");
  this.load.atlas("Blue_Clone", "assets/atlas/Blue_Clone.png", "assets/atlas/Blue_Clone.json");
  this.load.atlas("Blue", "assets/atlas/Blue.png", "assets/atlas/Blue.json");
  this.load.atlas("BrownV2", "assets/atlas/BrownV2.png", "assets/atlas/BrownV2.json");
  this.load.atlas("Green_Brown", "assets/atlas/Green_Brown.png", "assets/atlas/Green_Brown.json");
  this.load.atlas("Green", "assets/atlas/Green.png", "assets/atlas/Green.json");
  this.load.atlas("Purple_Brown", "assets/atlas/Purple_Brown.png", "assets/atlas/Purple_Brown.json");
  this.load.atlas("Purple", "assets/atlas/Purple.png", "assets/atlas/Purple.json");
  this.load.atlas("Red_Brown", "assets/atlas/Red_Brown.png", "assets/atlas/Red_Brown.json");
  this.load.atlas("Red", "assets/atlas/Red.png", "assets/atlas/Red.json");

  this.load.atlas("car-yellow", "assets/atlas/car-yellow.png", "assets/atlas/car-yellow.json");
  this.load.atlas("car-blue", "assets/atlas/car-blue.png", "assets/atlas/car-blue.json");
  this.load.atlas("car-red", "assets/atlas/car-red.png", "assets/atlas/car-red.json");
}

function create() {
  map = this.make.tilemap({ key: "map" });
  PDH = new PlayerDataHandler();
  speed = ITM.SKINS[SKIN].speed;

  const tileset = map.addTilesetImage("SBU", "tiles", 128, 128, 0, 0);
  const tileset2 = map.addTilesetImage("SBU RD (1)", "tiles2", 128, 128, 0, 0);
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
  interactableLayer.setTileIndexCallback([198], data => {
    tileInteraction(data, "sign-west");
  });
  interactableLayer.setTileIndexCallback([199], data => {
    tileInteraction(data, "door-west");
  });
  interactableLayer.setTileIndexCallback([200], data => {
    tileInteraction(data, "sign-east");
  });
  interactableLayer.setTileIndexCallback([201], data => {
    tileInteraction(data, "door-east");
  });
  interactableLayer.setTileIndexCallback([202], data => {
    tileInteraction(data, "sign-roth");
  });
  interactableLayer.setTileIndexCallback([203], data => {
    tileInteraction(data, "door-roth");
  });
  interactableLayer.setTileIndexCallback([204], data => {
    tileInteraction(data, "sign-javitz");
  });
  interactableLayer.setTileIndexCallback([205], data => {
    tileInteraction(data, "door-javitz");
  });
  interactableLayer.setTileIndexCallback([206], data => {
    tileInteraction(data, "sign-new-cs");
  });
  interactableLayer.setTileIndexCallback([207], data => {
    tileInteraction(data, "door-new-cs");
  });
  interactableLayer.setTileIndexCallback([208], data => {
    tileInteraction(data, "sign-the-sac");
  });
  interactableLayer.setTileIndexCallback([209], data => {
    tileInteraction(data, "door-the-sac");
  });
  interactableLayer.setTileIndexCallback([210], data => {
    tileInteraction(data, "sign-humanities");
  });
  interactableLayer.setTileIndexCallback([211], data => {
    tileInteraction(data, "door-humanities");
  });
  interactableLayer.setTileIndexCallback([212], data => {
    tileInteraction(data, "sign-rec-center");
  });
  interactableLayer.setTileIndexCallback([213], data => {
    tileInteraction(data, "door-rec-center");
  });
  interactableLayer.setTileIndexCallback([214], data => {
    tileInteraction(data, "sign-staller");
  });
  interactableLayer.setTileIndexCallback([215], data => {
    tileInteraction(data, "door-staller");
  });
  interactableLayer.setTileIndexCallback([216], data => {
    tileInteraction(data, "sign-wang");
  });
  interactableLayer.setTileIndexCallback([217], data => {
    tileInteraction(data, "door-wang");
  });
  interactableLayer.setTileIndexCallback([218], data => {
    tileInteraction(data, "sign-library");
  });
  interactableLayer.setTileIndexCallback([219], data => {
    tileInteraction(data, "door-library");
  });
  interactableLayer.setTileIndexCallback([220], data => {
    tileInteraction(data, "sign-frey-hall");
  });
  interactableLayer.setTileIndexCallback([221], data => {
    tileInteraction(data, "door-frey-hall");
  });
  interactableLayer.setTileIndexCallback([222], data => {
    tileInteraction(data, "sign-chemistry");
  });
  interactableLayer.setTileIndexCallback([223], data => {
    tileInteraction(data, "door-chemistry");
  });
  interactableLayer.setTileIndexCallback([224], data => {
    tileInteraction(data, "sign-physics");
  });
  interactableLayer.setTileIndexCallback([225], data => {
    tileInteraction(data, "door-physics");
  });
  interactableLayer.setTileIndexCallback([226], data => {
    tileInteraction(data, "sign-ess");
  });
  interactableLayer.setTileIndexCallback([227], data => {
    tileInteraction(data, "door-ess");
  });
  interactableLayer.setTileIndexCallback([228], data => {
    tileInteraction(data, "sign-engineering");
  });
  interactableLayer.setTileIndexCallback([229], data => {
    tileInteraction(data, "door-engineering");
  });
  interactableLayer.setTileIndexCallback([230], data => {
    tileInteraction(data, "sign-light-engineering");
  });
  interactableLayer.setTileIndexCallback([231], data => {
    tileInteraction(data, "door-light-engineering");
  });
  interactableLayer.setTileIndexCallback([232], data => {
    tileInteraction(data, "sign-heavy-engineering");
  });
  interactableLayer.setTileIndexCallback([233], data => {
    tileInteraction(data, "door-heavy-engineering");
  });
  interactableLayer.setTileIndexCallback([234], data => {
    tileInteraction(data, "sign-harriman-hall");
  });
  interactableLayer.setTileIndexCallback([235], data => {
    tileInteraction(data, "door-harriman-hall");
  });
  interactableLayer.setTileIndexCallback([236], data => {
    tileInteraction(data, "sign-psychology");
  });
  interactableLayer.setTileIndexCallback([237], data => {
    tileInteraction(data, "door-psychology");
  });


  // doors! // 195 is invisible doormat
  interactableLayer.setTileIndexCallback([193, 194, 195], data => {
    tileInteraction(data, "door");
  });

  // crappy chest credit
  interactableLayer.setTileIndexCallback(135, data => {
    tileInteraction(data, "cashForCredit");
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

  let brown = {size: {w: 15, h: 15}, offset: {x: 56, y: 50}, scale: 1.0};
  let goku = {size: {w: 60, h: 60}, offset: {x: 15, y: 200}, scale: 0.25};
  let car = {size: {w: 50, h: 50}, offset: {x: 40, y: 40}, scale: 1};
  let skinData;
  let maxFrame = 4;
  if (SKIN == "Brown") {
    skinData = brown;
  } else if (SKIN == "Goku_Black" || SKIN == "Goku_Red") {
    skinData = goku;
  } else if (SKIN == "car-red" || SKIN == "car-blue" || SKIN == "car-yellow") {
    skinData = car;
    maxFrame = 0;
  } else {
    skinData = goku;
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
      end: maxFrame,
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
      end: maxFrame,
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
      end: maxFrame,
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
      end: maxFrame,
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
    text: "⬅️: Move left\n➡️: Move right\n⬆️: Move up\n⬇️: Move down\n\n[H] Show/hide this help menu\n\n[S] Show all player stats\n\n[Z] Toggle running (devmode)\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: showHelp,
    y: 90,
    x: 16,
  });
  let helpMenuRight = new ToolTip({
    game: this,
    text: "[Y] Accept transaction\n[N] Reject transaction\n\n[T] Toggle chat\n\n[I] Open/close inventory\n\n[P] Show/Hide phone\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: showHelp,
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
      document.getElementById('phone_frame').src += '#';
      $("#player-phone").show();
    }
  });

  this.input.keyboard.on("keydown-" + "I", event => {
    // ONLY FOR FOR MAIN WORLD...
    localStorage.setItem("location", player.x + "," + player.y);
    PDH.toggleInventory();
  });

  // Debug graphics
  // this.input.keyboard.once("keydown_D", event => {
  //   this.physics.world.createDebugGraphic();
  //   const graphics = this.add
  //     .graphics()
  //     .setAlpha(0.75)
  //     .setDepth(20);
  //   interactableLayer.renderDebug(graphics, {
  //     tileColor: null,
  //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
  //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
  //   });
  // });

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
    setTimeout(() => {
      let message = $("#chat-box").val();
      if (message.indexOf("spawn") == 0) {
        let amt = message.substr(5, 5);
        alert("Spawning " + amt + " more!");
        createAIs(amt);
      }
    }, 5000);
    event.preventDefault();
    event.stopPropagation();
  });

  if (JSON.parse(localStorage.getItem("chat_loaded")) === false) {
    const chat = new Chat();
    /**
     * Music
     */
    const sound = new Howl({
      src: ["assets/audio/song.wav"],
      autoplay: true,
      loop: true,
      volume: 0.5,
      onend: function() {
        console.log('Finished!');
      }
    });
    sound.play();
  } else {
    const chat = new Chat({initChat: true});
  }

  /**
   * AI?
   */
  function createAIs(amt) {
    const physicsGen = new Physics({physics: act.physics});
    const dist = 600;
    for (let i = 0; i < amt; ++i) {
      let sign_a = Math.random() < 0.5 ? 1 : -1;
      let sign_b = Math.random() < 0.5 ? 1 : -1;
      let SKIN = ITM.SAFE_SKINS[Math.floor(Math.random() * ITM.SAFE_SKINS.length)];
      const newAI = physicsGen.add_npc({
        spawn: {x: player.x + (Math.floor(Math.random() * dist) * sign_a), y: player.y + (Math.floor(Math.random() * dist) * sign_b)},
        maxVX: 1000,
        maxVY: 1000,
        name: "student_" + i,
        nameSprite: SKIN,
        width: 60,
        height: 60,
        offsetX: 15,
        offsetY: 200,
        scale: 0.25,
        atlas: SKIN,
        prefix: SKIN,
        immovable: false,
        story: {
          next: {
            line: ITM.QOUTES[Math.floor(Math.random() * ITM.QOUTES.length)],
            timeout: 3000
          }
        }
      });
      physicsGen.add_player_layer_collisions({
        player: newAI,
        layers: [worldLayer, player],
        callback: JNotifier.toastPlayerInteraction
      });
      act.physics.add.collider(player, newAI);
      listAI.push(newAI);

      /**
       * Create the animations for each of the sprite/skin types
       */
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
      
      /**
       * Record the original positions of each AI
       */
      prevAiPositions[newAI.name] = {
        x: newAI.x,
        y: newAI.y
      };
    }
  }
  createAIs(50);

  toggleDirection();
}

function toggleDirection() {
  movingAI = true;
  setTimeout(toggleDirection, 1000);//Math.floor(Math.random() * 5000) + 500);
}

function update(time, delta) {

  if (movingAI) {
    movingAI = false;
    listAI.forEach(ai => {
      let p = Math.random() < 0.5 ? -1 : 1;
      let d = Math.random() < 0.5 ? true : false;
      let m = Math.random() < 0.5 ? true : false;
      let v = Math.random() < 0.5 ? 50 : Math.floor(Math.random() * 100) + 100;
      let speed = v;
      if (m) {
        speed = 0;
      }
      
      /**
       * Resets the AI velocity from the last update...
       * This is hit or miss whether it resets a given ai's velocity
       */
      ai.body.setVelocity(0);

      let realSpeed = speed * p;
      if (d) {
        ai.body.setVelocityX(realSpeed);
        if (realSpeed > 0) {
          ai.anims.play(ai.nameSprite + "-Walking-Right", true);
        } else if (realSpeed < 0) {
          ai.anims.play(ai.nameSprite + "-Walking-Left", true);
        }
      } else {
        ai.body.setVelocityY(realSpeed);
        if (realSpeed < 0) {
          ai.anims.play(ai.nameSprite + "-Walking-Up", true);
        } else if (realSpeed > 0) {
          ai.anims.play(ai.nameSprite + "-Walking-Down", true);
        }
      }

      if (realSpeed == 0) {
        ai.anims.stop();
      }

      ai.body.velocity.normalize().scale(speed);
    });
  }

  /**
   * Stop any animations if the prev. position is the same as the current position
   *  Always check every update, not just during AI movement cycles
   * NOTE: This sometimes causes the AI animation to stop moving even though the sprite is moving on the world...
   * I rather have no animation than a sprite look like its trying to defy physics and keep walking into a wall... So this stays.
   */
  listAI.forEach(ai => {
    if (ai.x == prevAiPositions[ai.name].x && ai.y == prevAiPositions[ai.name].y) {
      ai.anims.stop();
    } else {
      prevAiPositions[ai.name] = {
        x: ai.x,
        y: ai.y
      };
    }
  });

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

function tileInteraction(data, itemType) {
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
        console.log("DEFAULTING TO CLASSROOM!");
        act.game.destroy();
        const loader = new MapLoader();
        loader.loadMap({map: "Classroom.js", prevMapLoc: {x: player.x, y: player.y}});
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
    url: "https://universitysimulator.com/UniversitySimulator/Server/index.php?method=save_user&username="+encodeURI(playerData.name),
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
  $('body').bind('gameComplete', () => {
    let winnings = localStorage.getItem("coin_win");
    JNotifier.toast({
      html: "You won $" + winnings + "!", 
      position: "center", 
      important: true
    });
    let player = JSON.parse(localStorage.getItem("player"));
    player.cash = parseInt(player.cash) + parseInt(winnings);
    updateStats(player);
    localStorage.setItem("coin_win", 0);
  });

  $('body').bind('closePhone', () => {
    $("#player-phone").hide();
    $("#choice-collector").show();
    $("#choice-collector").focus();
    $("#choice-collector").hide();
  });
});