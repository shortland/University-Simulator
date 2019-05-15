import { ToolTip, MapLoader, InteractableTileMapping, Animations, Physics, PlayerDataHandler, SharedEventData, Chat, JNotify } from '../ModuleLoader.js';

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
const PDHandler = new PlayerDataHandler;
const JNotifier = new JNotify;
const JSLoader = new MapLoader;
const ITM = new InteractableTileMapping;

const eventModifiableState = {
  speed: 200,
  devMode: false
};
var SED;

let cursors;
let player;
let SKIN;

var act;
var map;
var collidedInteractable = false;

function preload() {
  SKIN = localStorage.getItem("skin") || "Brown";
  this.load.image("indoor", "assets/tilesets/indoor.png");
  this.load.image("foods", "assets/tilesets/food.png");
  this.load.image("signs", "assets/tilesets/signs.png");
  this.load.image("solids", "assets/tilesets/Solids.png");
  
  this.load.tilemapTiledJSON("FoodCourt", "assets/tilemaps/FoodCourt.json");
  this.load.atlas("Brown", "assets/atlas/Brown.png", "assets/atlas/Brown.json");
  this.load.atlas("Cars", "assets/atlas/Cars.png", "assets/atlas/Cars.json");

  this.load.atlas("Goku_Red", "assets/atlas/Goku_Red.png", "assets/atlas/Goku_Red.json");
  this.load.atlas("Goku_Black", "assets/atlas/Goku_Black.png", "assets/atlas/Goku_Black.json");

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
  map = this.make.tilemap({ key: "FoodCourt" });

  const indoorSet = map.addTilesetImage("indoor", "indoor");
  const foodSet = map.addTilesetImage("food", "foods");
  const signsSet = map.addTilesetImage("signs", "signs");
  const solidsSet = map.addTilesetImage("Solids", "solids");

  let allTileSets = [indoorSet, foodSet, signsSet, solidsSet];

  const belowLayer = map.createStaticLayer("Below Player", allTileSets, 0, 0);
  const worldLayer = map.createStaticLayer("World", allTileSets, 0, 0);
  const interactableLayer = map.createStaticLayer("Interactables", [signsSet, foodSet], 0, 0);

  belowLayer.setScale( 0.25 );
  worldLayer.setScale( 0.25 );
  interactableLayer.setScale( 0.25 );

  interactableLayer.setCollisionBetween(1, 10000, true, 'Interactables');
  worldLayer.setCollisionBetween(1, 10000, true, 'World');

  act = this;
  //console.log(interactableLayer); // get gids for collision

  /**
   * INTERACTIONS WITH TILES
   */
  const gidDoorSign = [];
  for (let i = 32; i <= 73; ++i) {
    gidDoorSign.push(i);
  }
  interactableLayer.setTileIndexCallback(gidDoorSign, () => {
    tileInteraction("door-wang");
  });
  interactableLayer.setTileIndexCallback([26], () => {
    tileInteraction("food-pizza");
  });
  interactableLayer.setTileIndexCallback([27], () => {
    tileInteraction("food-pizza-pepperoni"); 
  });
  interactableLayer.setTileIndexCallback([28], () => {
    tileInteraction("food-rice-curry");
  });
  interactableLayer.setTileIndexCallback([29], () => {
    tileInteraction("food-steak");
  });
  interactableLayer.setTileIndexCallback([30], () => {
    tileInteraction("food-cola");
  });
  interactableLayer.setTileIndexCallback([31], () => {
    tileInteraction("food-water");
  });

  const physics = new Physics({physics: this.physics});
  const collisionLayers = [worldLayer, interactableLayer];
  /**
   * Add NPCs
   */
  const npc1 = physics.add_npc({
    spawn: {x: 180, y: 180},
    immovable: true,
    name: "James Kellenberger, a CulinArt Chef",
    story: {
      next: {
        line: "Hi! I'm James Kellenberger, a CulinArt Chef! Want to talk more?",
        Y: {
          next: {
            line: "I love talking to students! I love doing what I do and coming to work everyday. Do you like doing what you do?",
            N: {
              next: {
                line: "You should find what makes you happy :) and then do that."
              }
            },
            Y: {
              next: {
                line: "I love hearing that some people know what they're doing. Some people have it all figured out already!"
              }
            }
          }
        },
        N: {
          next: {
            line: "Okay! Have a good day!"
          }
        }
      }
    }
  });
  const npc2 = physics.add_npc({
    spawn: {x: 160, y: 140},
    immovable: false,
    motion: "Walking-Right", 
    frame: "001",
    name: "Laura Martorano",
    story: {
      next: {
        line: "Hi " + JSON.parse(localStorage.getItem("player")).username + "! I'm Laura Martorano, a registered dietician!",
        timeout: 8000
      }
    }
  });
  /**
   * Add the player
   */
  let brown = {size: {w: 15, h: 15}, offset: {x: 56, y: 50}, scale: 1.0};
  let goku = {size: {w: 60, h: 60}, offset: {x: 15, y: 200}, scale: 0.25};
  let car = {size: {w: 50, h: 50}, offset: {x: 40, y: 40}, scale: 0.25};
  let skinData;
  if (SKIN == "Brown") {
    skinData = brown;
  } else if (SKIN == "Goku_Black" || SKIN == "Goku_Red") {
    skinData = goku;
  } else if (SKIN == "car-red" || SKIN == "car-blue" || SKIN == "car-yellow") {
    skinData = car;
  } else {
    skinData = goku;
  }
  player = physics.add_player({
    atlas: SKIN,
    prefix: SKIN,
    name: SKIN, 
    scale: skinData["scale"], 
    width: skinData["size"].w, 
    height: skinData["size"].h,
    offsetX: skinData["offset"].x,
    offsetY: skinData["offset"].y,
    spawn: {x: 160, y: 176}
  });
  /**
   * Add collisions for NPCs after the player has been added - so that we can add the player to the npc's collisions
   */
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc1,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc2,
    callback: JNotifier.toastPlayerInteraction
  });
  /**
   * Add collisions for the player
   */
  physics.add_player_layer_collisions({layers: collisionLayers.concat([npc1, npc2])});
  physics.add_camera_follow({
    camera: this.cameras.main,
    object: player
  });

  const anims = new Animations({
    animations: this.anims
  });
  anims.create_player({
    prefix: SKIN
  });
  
  cursors = this.input.keyboard.createCursorKeys();
  
  /**
   * SharedEventData (basic specifically for index.js)
   */
  SED = new SharedEventData({
    game: this,
    keyboard: this.input.keyboard, 
    state: eventModifiableState,
    skinSpeed: ITM.SKINS[SKIN].speed,
    createAIs: 0,
    worldLayer: worldLayer,
    player: player
  });

  const chat = new Chat({initChat: true, state: eventModifiableState});
}

/**
 * [2] Maybe move this into its own maps/dir type
 */
function update(time, delta) {
  SED.updateAIs();

  if (eventModifiableState.createAIs > 0) {
    SED.createAIs(eventModifiableState.createAIs)
  }

  const prevVelocity = player.body.velocity.clone();
  const speed = eventModifiableState["speed"];
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

/**
 * [1] Maybe move this into its own maps/dir type
 */
function tileInteraction(itemType) {
  if (collidedInteractable) {
    return; // the menu is open. so don't open new interactions... stop here.
  }

  console.log("interactions...");
  let playerData = PDHandler.getStats();
  let message;

  if (ITM.sign_ids.includes(itemType)) {
    let location = itemType.substring(5);
    $("#toastNotification").show();
    $("#toastNotification").html(
      "<center style='color:blue'>Welcome to " + location.toUpperCase() + "!</center>"
    ).fadeOut(3000);
    noInteractionsForDelay(1000);
    return;
  } else if (ITM.door_ids.includes(itemType)) {
    let location = itemType.substring(5);
    message = "Exit building?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
  } else if (Object.keys(ITM.FOODS).includes(itemType)) {
    message = "Purchase <span style='font-style: oblique;'>" + ITM.FOODS[itemType]["name"] + "</span> for <span style='font-weight: heavy;'>$" + Math.abs(ITM.FOODS[itemType]["stats"]["cash"]) + "</span>?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
  } else {
    message = "UNKNOWN INTERACTION @function tileInteract(itemType:" + itemType + ")";
  }

  collidedInteractable = true;

  JNotifier.prompt({
    html: message
  });
  
  act.input.keyboard.once("keydown-" + "Y", () => {
    if (ITM.door_ids.includes(itemType)) {
      /**
       * Regardless of the door type/id we're going to make the user go back to the main world.
       * It's assumed we're NOT in the main world, and the only place we can go is the main world.
       * NO traveling to sub maps from a sub map. Only can go to main map from sub-maps.
       */
      act.game.destroy();
      JSLoader.loadMap({map: "MAIN"});
    } else if (Object.keys(ITM.FOODS).includes(itemType)) {
      if (playerData["cash"] < Math.abs(ITM.FOODS[itemType]["stats"]["cash"])) {
        JNotifier.toast({color: "red", html: "Not enough cash!"});
      } else {
        PDHandler.addStats({stats: {cash: ITM.FOODS[itemType]["stats"]["cash"]}});
        PDHandler.addInventory({itemList: [itemType]});
        JNotifier.toast({color: "green", html: "Purchased successfully!"});
      }
    }

    JNotifier.promptHide();
    collidedInteractable = false;
    delete act.input.keyboard._events['keydown-N'];
    return;
  });

  act.input.keyboard.once("keydown-" + "N", () => {
    console.log("dont interact thing");
    JNotifier.promptHide();
    collidedInteractable = false;
    delete act.input.keyboard._events['keydown-Y'];
    return;
  });
}

function noInteractionsForDelay(millisec) {
  collidedInteractable = true;
  setTimeout(() => {
    collidedInteractable = false;
  }, millisec);
}

$(document).ready(function() {
  PDHandler.refresh();
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
    PDHandler.updateStats(player);
    localStorage.setItem("coin_win", 0);
  });

  $('body').bind('closePhone', () => {
    $("#player-phone").hide();
    $("#choice-collector").show();
    $("#choice-collector").focus();
    $("#choice-collector").hide();
  });
});