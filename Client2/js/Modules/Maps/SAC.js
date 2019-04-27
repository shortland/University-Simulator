import { ToolTip, MapLoader, InteractableTileMapping, Animations, Physics, PlayerDataHandler, SharedEventData, Chat, JNotify } from '../ModuleLoader.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
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
const JNotifier = new JNotify();
const JSLoader = new MapLoader();
const eventModifiableState = {
  speed: 200
};

let cursors;
let player;

var act;
var map;
var collidedInteractable = false;

function preload() {
  this.load.image("indoor", "assets/tilesets/indoor.png");
  this.load.image("signs", "assets/tilesets/signs.png");
  this.load.image("solids", "assets/tilesets/Solids.png");
  
  this.load.tilemapTiledJSON("SAC", "assets/tilemaps/SAC.json");
  this.load.atlas("Brown", "assets/atlas/Brown.png", "assets/atlas/Brown.json");
  this.load.atlas("Cars", "assets/atlas/Cars.png", "assets/atlas/Cars.json");
}

function create() {
  map = this.make.tilemap({ key: "SAC" });

  const indoorSet = map.addTilesetImage("indoor", "indoor");
  const signsSet = map.addTilesetImage("signs", "signs");
  const solidsSet = map.addTilesetImage("Solids", "solids");

  let allTileSets = [indoorSet, signsSet, solidsSet];

  const belowLayer = map.createStaticLayer("Below Player", allTileSets, 0, 0);
  const worldLayer = map.createStaticLayer("World", allTileSets, 0, 0);
  const interactableLayer = map.createStaticLayer("Interactables", [signsSet], 0, 0);

  belowLayer.setScale( 0.25 );
  worldLayer.setScale( 0.25 );
  interactableLayer.setScale( 0.25 );

  interactableLayer.setCollisionBetween(1, 10000, true, 'Interactables');
  worldLayer.setCollisionBetween(1, 10000, true, 'World');

  act = this;
  console.log(interactableLayer); // get gids for collision

  /**
   * INTERACTIONS WITH TILES
   */
  interactableLayer.setTileIndexCallback([36], () => {
    tileInteraction("sign-the-sac");
  });
  interactableLayer.setTileIndexCallback([37], () => {
    tileInteraction("door-the-sac");
  });

  const physics = new Physics({physics: this.physics});
  const collisionLayers = [worldLayer, interactableLayer];
  /**
   * Add NPCs
   */
  const car1 = physics.add_npc({
    prefix: "Car-Yellow",
    motion: "Up",
    offsetX: 30,
    offsetY: 0,
    width: 70,
    height: 125,
    atlas: "Cars",
    spawn: {x: 320, y: 320},
    immovable: true,
    name: "Car 1",
    price: 2000,
    story: {
      next: {
        line: "Buy skin for $2000?",
        Y: {
          next: {
            line: "Congrats! You can change your skin via your inventory [I]"
          }
        },
        N: {
          next: {
            line: "Ok."
          }
        }
      }
    }
  });
  const car2 = physics.add_npc({
    prefix: "Car-Blue",
    motion: "Up",
    offsetX: 30,
    offsetY: 0,
    width: 70,
    height: 125,
    atlas: "Cars",
    spawn: {x: 220, y: 320},
    immovable: true,
    name: "Car 2",
    price: 1500,
    story: {
      next: {
        line: "Buy skin for $1500?",
        Y: {
          next: {
            line: "Congrats! You can change your skin via your inventory [I]"
          }
        },
        N: {
          next: {
            line: "Ok."
          }
        }
      }
    }
  });
  const car3 = physics.add_npc({
    prefix: "Car-Red",
    motion: "Up",
    offsetX: 30,
    offsetY: 0,
    width: 70,
    height: 125,
    atlas: "Cars",
    spawn: {x: 120, y: 320},
    immovable: true,
    name: "Car 3",
    price: 1000,
    story: {
      next: {
        line: "Buy skin for $1000?",
        Y: {
          next: {
            line: "Congrats! You can change your skin via your inventory [I]"
          }
        },
        N: {
          next: {
            line: "Ok."
          }
        }
      }
    }
  });
  const npc1 = physics.add_npc({
    spawn: {x: 45, y: 265},
    immovable: true,
    name: "Skin 1",
    story: {
      next: {
        line: "Buy skin?",
        price: 200,
        Y: {
          next: {
            line: "Congrats! You can change your skin via your inventory [I]"
          }
        },
        N: {
          next: {
            line: "Ok."
          }
        }
      }
    }
  });
  const npc2 = physics.add_npc({
    spawn: {x: 80, y: 265},
    immovable: true,
    frame: "001",
    name: "Skin 2",
    story: {
      next: {
        line: "Buy skin?",
        price: 250,
        Y: {
          next: {
            line: "Congrats! You can change your skin via your inventory [I]"
          }
        },
        N: {
          next: {
            line: "Ok."
          }
        }
      }
    }
  });
  /**
   * Add the player
   */
  player = physics.add_player({
    prefix: "Brown", 
    scale: 0.8, 
    spawn: {x: 320, y: 600}
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
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: car1,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: car2,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: car3,
    callback: JNotifier.storyPlayerInteraction
  });
  /**
   * Add collisions for the player
   */
  physics.add_player_layer_collisions({layers: collisionLayers.concat([npc1, npc2, car1, car2, car3])});
  physics.add_camera_follow({
    camera: this.cameras.main,
    object: player
  });

  const anims = new Animations({
    animations: this.anims
  });
  anims.create_player({
    prefix: "Brown"
  });
  
  cursors = this.input.keyboard.createCursorKeys();
  
  const sharedEventsDatas = new SharedEventData({
    game: this,
    keyboard: this.input.keyboard, 
    state: eventModifiableState
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

  const chat = new Chat({initChat: true});
}

/**
 * [2] Maybe move this into its own maps/dir type
 */
function update(time, delta) {
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

/**
 * [1] Maybe move this into its own maps/dir type
 */
function tileInteraction(itemType) {
  if (collidedInteractable) {
    return; // the menu is open. so don't open new interactions... stop here.
  }

  console.log("interactions...");

  const ITM = new InteractableTileMapping;
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
});