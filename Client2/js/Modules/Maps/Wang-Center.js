import { ToolTip, JSLoader, InteractableTileMapping, Animations, Physics, GlobalListeners } from '../ModuleLoader.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
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

var aboveLayer;
var act;
var map;
var speed = 200;
var collidedInteractable = false;

function preload() {
  this.load.image("tiles3", "assets/tilesets/Maze Tile.png");
  this.load.image("foods", "assets/tilesets/food.png");
  this.load.image("chair_tables", "assets/tilesets/ChairTables.png");
  this.load.image("tiles", "assets/tilesets/SBU.png");
  this.load.image("signs", "assets/tilesets/signs.png");
  this.load.image("solids", "assets/tilesets/Solids.png");
  
  this.load.tilemapTiledJSON("map_wang-center", "assets/tilemaps/Wang-Center.json");
  this.load.atlas("Brown", "assets/atlas/Brown.png", "assets/atlas/Brown.json");
}

function create() {
  map = this.make.tilemap({ key: "map_wang-center" });

  const mazeSet = map.addTilesetImage("Maze Tile", "tiles3");
  const foodSet = map.addTilesetImage("food", "foods");
  const chairTableSet = map.addTilesetImage("ChairTables", "chair_tables");
  const tileSet = map.addTilesetImage("SBU", "tiles");
  const signsSet = map.addTilesetImage("signs", "signs");
  const solidsSet = map.addTilesetImage("Solids", "solids");

  let allTileSets = [mazeSet, foodSet, chairTableSet, tileSet, signsSet, solidsSet];

  const belowLayer2 = map.createStaticLayer("Below Player2", allTileSets, 0, 0);
  const belowLayer = map.createStaticLayer("Below Player", allTileSets, 0, 0);
  const worldLayer = map.createStaticLayer("World", allTileSets, 0, 0);
  const interactableLayer = map.createStaticLayer("Interactables", [signsSet, foodSet], 0, 0);

  belowLayer2.setScale( 0.25 );
  belowLayer.setScale( 0.25 );
  worldLayer.setScale( 0.25 );
  interactableLayer.setScale( 0.25 );

  interactableLayer.setCollisionBetween(1, 10000, true, 'Interactables');
  worldLayer.setCollisionBetween(1, 10000, true, 'World');

  act = this;

  /**
   * INTERACTIONS WITH TILES
   */
  interactableLayer.setTileIndexCallback([26], () => {
    tileInteraction("door-wang");
  });
  interactableLayer.setTileIndexCallback([25], () => {
    tileInteraction("sign-wang");
  });
  interactableLayer.setTileIndexCallback([1], () => {
    tileInteraction("food-pizza");
  });
  interactableLayer.setTileIndexCallback([2], () => {
    tileInteraction("food-pizza-pepperoni"); 
  });
  interactableLayer.setTileIndexCallback([3], () => {
    tileInteraction("food-rice-cake"); // Yes
  });
  interactableLayer.setTileIndexCallback([4], () => {
    tileInteraction("food-steak");
  });
  interactableLayer.setTileIndexCallback([5], () => {
    tileInteraction("food-cola"); // Yes
  });
  interactableLayer.setTileIndexCallback([6], () => {
    tileInteraction("food-water");
  });

  const physics = new Physics({physics: this.physics});
  player = physics.add_player({
    prefix: "Brown", 
    scale: 0.8, 
    spawn: map.findObject("Objects", obj => obj.name === "Spawn Point")
  });
  physics.add_player_layer_collisions({layers: [worldLayer, interactableLayer]});
  physics.add_camera_follow({
    camera: this.cameras.main,
    object: player
  });

  const anims = new Animations({animations: this.anims});
  anims.create_player({prefix: "Brown"});
  


  cursors = this.input.keyboard.createCursorKeys();

  let helpMenuTitle = new ToolTip({
    game: this,
    text: "Help Menu\n",
    align: "center",
    clickDestroy: false,
    depth: 100,
    visible: false,
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
    visible: false,
    y: 90,
    x: 16,
  });
  let helpMenuRight = new ToolTip({
    game: this,//[P] Turn on/off phone //[I] Open/close inventory
    text: "[M] Show Minigames\n\n[Y] Accept transaction\n[N] Reject transaction\n\n[T] Toggle chat\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
    align: "left",
    clickDestroy: false,
    depth: 100,
    visible: false,
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
    alert("Not yet implemented");
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

  let playerData = JSON.parse(localStorage.getItem("player"));
  let message;
  let cost;
  let benefit;

  const ITM = new InteractableTileMapping;

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
    message = "Exit " + location.toUpperCase() + "?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
  } else if (Object.keys(ITM.FOODS).includes(itemType)) {
    message = "Purchase <span style='font-style: oblique;'>" + ITM.FOODS[itemType]["name"] + "</span> for <span style='font-weight: heavy;'>$" + Math.abs(ITM.FOODS[itemType]["stats"]["cash"]) + "</span>?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
  } else {
    message = "UNKNOWN INTERACTION @function tileInteract(itemType:" + itemType + ")";
  }

  collidedInteractable = true;
  if (!$("#prompt").is(":visible")) {
    $("#prompt").show();
    $("#prompt").html(
      "<center>" + message + "</center>"
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
      } else if (ITM.door_ids.includes(itemType)) {
        act.game.destroy();
        const loader = new JSLoader();
        loader.loadMap({map: "MAIN"});
      } else if (Object.keys(ITM.FOODS).includes(itemType)) {
        // This makes the player auto-eat the food...
        // We want to place it in their inventory so they can eat it later.
        playerData["inventory"].push(itemType);
        // Object.keys(ITM.FOODS[itemType]["stats"]).forEach(stat => {
        //   playerData[stat] += parseInt(ITM.FOODS[itemType]["stats"][stat]);
        // });
        updateStats(playerData);
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
    url: "http://ilankleiman.com/StonyBrookSimu/CServer/index.php?method=save_user&username=" + encodeURI(playerData.name),
    type: 'post',
    dataType: 'json',
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

function noInteractionsForDelay(millisec) {
  collidedInteractable = true;
  setTimeout(() => {
    collidedInteractable = false;
  }, millisec);
}

$(document).ready(function() {
  updateStats(JSON.parse(localStorage.getItem("player")));
  $(document).add('*').off();
});