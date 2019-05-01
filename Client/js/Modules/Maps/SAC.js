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
let SKIN;

var act;
var map;
var collidedInteractable = false;

function preload() {
  SKIN = localStorage.getItem("skin") || "Brown";
  this.load.image("indoor", "assets/tilesets/indoor.png");
  this.load.image("signs", "assets/tilesets/signs.png");
  this.load.image("solids", "assets/tilesets/Solids.png");
  
  this.load.tilemapTiledJSON("SAC", "assets/tilemaps/SAC.json");
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
  //console.log(interactableLayer); // get gids for collision

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
    prefix: "car-yellow",
    motion: "Up",
    offsetX: 30,
    offsetY: 0,
    width: 70,
    height: 125,
    atlas: "Cars",
    spawn: {x: 220, y: 550},
    immovable: true,
    name: "car-yellow",
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
    prefix: "car-blue",
    motion: "Up",
    offsetX: 30,
    offsetY: 0,
    width: 70,
    height: 125,
    atlas: "Cars",
    spawn: {x: 145, y: 550},
    immovable: true,
    name: "car-blue",
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
    prefix: "car-red",
    motion: "Up",
    offsetX: 30,
    offsetY: 0,
    width: 70,
    height: 125,
    atlas: "Cars",
    spawn: {x: 70, y: 550},
    immovable: true,
    name: "car-red",
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
  const gokuBlack = physics.add_npc({
    atlas: "Goku_Black",
    prefix: "Goku_Black",
    name: "Goku_Black",
    motion: "Standing",
    spawn: {x: 45, y: 265},
    immovable: true,
    price: 2000,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
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
  const npc2 = physics.add_npc({
    spawn: {x: 80, y: 290},
    immovable: true,
    frame: "000",
    name: "Brown",
    price: 50,
    story: {
      next: {
        line: "Buy skin for $50?",
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
   * ADD DHRUBA MASS SKINS
   */
  const npc_0 = physics.add_npc({
    spawn: {x: 120, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Black_Brown",
    prefix: "Black_Brown",
    name: "Black_Brown",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_1 = physics.add_npc({
    spawn: {x: 160, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Blue_Clone",
    prefix: "Blue_Clone",
    name: "Blue_Clone",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_2 = physics.add_npc({
    spawn: {x: 200, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Blue",
    prefix: "Blue",
    name: "Blue",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_3 = physics.add_npc({
    spawn: {x: 240, y: 265},
    immovable: true,
    frame: "000",
    atlas: "BrownV2",
    prefix: "BrownV2",
    name: "BrownV2",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_4 = physics.add_npc({
    spawn: {x: 280, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Green_Brown",
    prefix: "Green_Brown",
    name: "Green_Brown",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_5 = physics.add_npc({
    spawn: {x: 320, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Green",
    prefix: "Green",
    name: "Green",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_6 = physics.add_npc({
    spawn: {x: 360, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Purple_Brown",
    prefix: "Purple_Brown",
    name: "Purple_Brown",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_7 = physics.add_npc({
    spawn: {x: 400, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Purple",
    prefix: "Purple",
    name: "Purple",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_8 = physics.add_npc({
    spawn: {x: 440, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Red_Brown",
    prefix: "Red_Brown",
    name: "Red_Brown",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  const npc_9 = physics.add_npc({
    spawn: {x: 480, y: 265},
    immovable: true,
    frame: "000",
    atlas: "Red",
    prefix: "Red",
    name: "Red",
    motion: "Standing",
    immovable: true,
    price: 200,
    scale: 0.25,
    width: 60,
    height: 60,
    offsetX: 15,
    offsetY: 200,
    story: {
      next: {
        line: "Buy skin for $200?",
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
  let brown = {size: {w: 20, h: 20}, offset: {x: 54, y: 44}, scale: 0.8};
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
    player: npc_0,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_1,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_2,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_3,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_4,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_5,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_6,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_7,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_8,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: npc_9,
    callback: JNotifier.storyPlayerInteraction
  });
  physics.add_player_layer_collisions({
    layers: collisionLayers.concat(player),
    player: gokuBlack,
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
  physics.add_player_layer_collisions({layers: collisionLayers.concat([npc_0, npc_1, npc_2, npc_3, npc_4, npc_5, npc_6, npc_7, npc_8, npc_9, gokuBlack, npc2, car1, car2, car3])});
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