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
  this.load.image("Beds", "assets/tilesets/Beds.png");
  this.load.image("signs", "assets/tilesets/signs.png");
  this.load.image("solids", "assets/tilesets/Solids.png");
  
  this.load.tilemapTiledJSON("Dorm", "assets/tilemaps/Dorm.json");
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
  map = this.make.tilemap({ key: "Dorm" });

  const indoorSet = map.addTilesetImage("indoor", "indoor");
  const bedsSet = map.addTilesetImage("Beds", "Beds");
  const signsSet = map.addTilesetImage("signs", "signs");
  const solidsSet = map.addTilesetImage("Solids", "solids");

  let allTileSets = [indoorSet, bedsSet, signsSet, solidsSet];

  const belowLayer = map.createStaticLayer("Below Player", allTileSets, 0, 0);
  const worldLayer = map.createStaticLayer("World", allTileSets, 0, 0);
  const interactableLayer = map.createStaticLayer("Interactables", [signsSet, bedsSet], 0, 0);

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
  for (let i = 44; i <= 87; ++i) {
    gidDoorSign.push(i);
  }
  interactableLayer.setTileIndexCallback(gidDoorSign, () => {
    tileInteraction("door-wang");
  });
  const gidBeds = [];
  for (let i = 1; i <= 9; ++i) {
    gidBeds.push(i);
  }
  interactableLayer.setTileIndexCallback(gidBeds, () => {
    tileInteraction("bed");
  });

  const physics = new Physics({physics: this.physics});
  const collisionLayers = [worldLayer, interactableLayer];
  /**
   * Add NPCs
   */
  const npc1 = physics.add_npc({
    spawn: {x: 180, y: 130},
    immovable: true,
    name: "Jimmy",
    story: {
      next: {
        line: "Hi! I'm Jimmy, a Political Science major. Want to hear my opinions on the world?",
        Y: {
          next: {
            line: "A lot of people don't think PolySci majors are important. But we're just as important as other scientists. I think we should be considered scientists ourselves.",
            N: {
              next: {
                line: "Your opinions are invalid. Do some research before you disagree with a PolySci major. <br>Bye."
              }
            },
            Y: {
              next: {
                line: "I'm glad you agree with me. You should think about a PolySci minor. Your opinions align perfectly with how we think!"
              }
            }
          }
        },
        N: {
          next: {
            line: "Hopefully next time you can hear me out!"
          }
        }
      }
    }
  });
  const npc2 = physics.add_npc({
    spawn: {x: 160, y: 90},
    immovable: true,
    motion: "Walking-Left", 
    frame: "001",
    name: "Billy",
    story: {
      next: {
        line: "Hi " + JSON.parse(localStorage.getItem("player")).username + "! I'm Billy, a CSE student!",
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
    spawn: {x: 160, y: 146}
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
  if (eventModifiableState.newSkin == "yes") {
    SKIN = localStorage.getItem("skin") || "Brown";
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
    player = player
      .setSize(skinData["size"].w, skinData["size"].h)
      .setOffset(skinData["offset"].x, skinData["offset"].y);
    player.setScale( skinData["scale"] );
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
  } else if (itemType == "bed") {
    message = "Sleep?<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
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
    } else if (itemType == "bed") {
      $("canvas").finish();
      $("canvas").fadeOut(3500).fadeIn(2500);
      JNotifier.toast({color: "green", html: "1 week passes..."});
      /**
       * SLEEP SOUND
       */
      let plays = 0;
      const sound = new Howl({
        src: ["assets/audio/Snoring.wav"],
        autoplay: true,
        loop: true,
        volume: 0.05,
        onend: function() {
          console.log('Finished!');
          if (++plays == 2) {
            sound.loop(false);
          }
        }
      });
      sound.play();
      /**
       * NEXT TURN
       */
      nextTurn();

      // no spam sleeping
      noInteractionsForDelay(2000);
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


function nextTurn() {
  const playerData = PDHandler.getStats();

  if (playerData["thirst"] <= 0 || playerData["hunger"] <= 0) {
    PDHandler.restartGame();
    setTimeout(() => {
      document.write(`<center><h3>Game Over!</h3>
      <p>You died!</p>
      <br>
      <p>Unfortunately, due to health reason, your player was unable to survive the night.</p>
      <br>
      <p>Try again next time!</p>
      </center>
    `);
    }, 1000);
    return;
  }

  if (playerData.week == 52) {
    let health = (playerData["thirst"] + playerData["hunger"]) / 2;
    var end = gameEnding(playerData["cash"], playerData["credits"], playerData["followers"], health);

    // [healthEnding,goldEnding,creditEnding,followersEnding,overallEnding];

    document.write(`<center><h3>Game Complete</h3>
      <p>` + end[0] + `</p><br>
      <p>` + end[1] + `</p><br>
      <p>` + end[2] + `</p><br>
      <p>` + end[3] + `</p><br>
      <p>` + end[4] + `</p><br></center>
    `);
  }

  if (playerData.week == 28 && playerData.credits < 14) {
    JNotifier.toast({
      important: true,
      html: "You don't have enough credits!",
      color: "red",
      position: "center"
    });
  } else {
    // JNotifier.toast({
    //   important: true,
    //   html: "You Have enough credits!",
    //   color: "green",
    //   position: "center"
    // });
  }

  PDHandler.addStats({stats: {
    sleep: 100,
    hunger: -1 * Math.floor(Math.random() * 40) + 1,
    thirst: -1 * Math.floor(Math.random() * 30) + 1,
    happiness: Math.floor(Math.random() * 10) + 1,
    followers: 1,
    week: 1
  }});
}

function gameEnding(gold,credit,followers,health){
  var maxcount = 0;
  var goldEnding;
  var creditEnding;
  var followersEnding;
  var healthEnding;
  var overallEnding;
  if(gold>=1000){
      maxcount++;
      goldEnding = "You were smart in saving and investing your money while also being able to provide for your family whatever the cost. Money was never an issue in your life and your family prospered as the 1% from the wealth that you had attained due to your decisions.";
  }
  else if(gold<1000 && gold >= 250){
      goldEnding = "You were able to get by in life with the money you saved from work and some assets that you had kept. A few unfortunate money losses caused some setbacks in family plans but nothing too deterring. Your family lived a normal life in the middle class.";
  }
  else{
      goldEnding = "Money was always an issue in your life and you had trouble getting by in life. You spent money on items you didn’t need rather than saving it and didn’t have enough money for the more important things in life which resulted in many hindrances and obstacles while trying to live a happy life. Your family had to scrape by because of your money problems. ";
  }

  // full credit for 11 class
  if(credit >= 44){
      maxcount++;
      creditEnding = "You graduated as a Double Major with a 4.0 GPA and as the valedictorian of your class. You were recognized around the institution as a once in a generation genius. You received offers from all the top companies and organizations in your field with unheard of starting salaries.";
  }
  // full credit for 7 class
  else if(credit >= 28 && credit < 44){
      creditEnding = "You completed your undergraduate degree with a good GPA and you were able to get a job just a few months after graduation that had a solid starting salary with the ability to work your way up in your field, you did just fine in your career.";
  }
  else{
      creditEnding = "As the saying goes, “C’s get degrees” and that’s the creed you lived by. For many years after college you had to work in the retail and fast food industry to provide for yourself while you went job hunting. You faced a life full of rejections from companies that you had applied to and had to slowly build connections to work your way up to a stable job.";
  }

  if(followers >= 100){
      maxcount++;
      followersEnding = "You lived a very happy and social lifestyle, always buying yourself things to keep you happy and always surrounding yourself with many friends to keep yourself entertained throughout your life. Your friends believed you were a good person loved your outgoing personality.";
  }
  else if(followers < 67 && followers >= 34){
      followersEnding = "You treated yourself when you believed it was right to do so and you kept a close-knit group of friends to do campus activities with. Even though you never expanded far past your small group of friends, people believed you were a decent person and respected your personality. You were never too outgoing or too shy but just right in the middle. You were a family man.";
  }
  else{
      followersEnding = "You were extremely depressed throughout college because you did not participate in any events or make many friends. You chose to save your money and not buy yourself much or anything at all. No one could really get to know you because you were a very cold person and cut yourself off from people and society, only seeking to fulfill an objective.";
  }
  if(health>=67 && health <=100){
      maxcount++;
      healthEnding = "Your health was never an issue in your life, you took great care of yourself and lived a healthy life until the end of your days in your 90s.";
  }
  else if(health == 42){
      healthEnding = "You have achieved the meaning of life, although it may not be an adequate amount of health, you have reached a divine realm where you will live a healthy life and prosper as a god.";
  }
  else if(health>34 && health < 67){
      healthEnding = "Although you didn’t live the healthiest life, you tried your best to keep your health well enough to perform your daily activities. You passed away in your 60s from a slow developing sickness because you didn’t make health an extreme priority.";
  }
  else{
      healthEnding = "Your health was always an issue because you never prioritized it during your college life. Your life was riddled with sickness and you spent many nights in the hospital at some points. Unfortunately, you were attacked by a deadly virus because of how vulnerable your body was an died in your late 40s.";
  }

  if(maxcount<=4){
      overallEnding = "I was satisfied with my University life and wouldn’t make any changes.";
  }
  else if(maxcount<4 && maxcount > 2){
      overallEnding = "I think I made some right and wrong decisions which I was ultimately okay with, but I wish I could correct the things I did wrong.";
  }
  else{
      overallEnding = "I did not enjoy my University life and I wish I could start over.";
  }
  var ending = [healthEnding,goldEnding,creditEnding,followersEnding,overallEnding];
  return ending;
}

$(document).ready(function() {
  PDHandler.refresh();
  $(document).add('*').off();

  $('body').bind('gameComplete', () => {
    if (localStorage.getItem("credit_win") > 0) {
      let winnings = localStorage.getItem("credit_win");
      JNotifier.toast({
        html: "You won " + winnings + " credits!", 
        position: "center", 
        important: true
      });
      let player = JSON.parse(localStorage.getItem("player"));
      player.credits = parseInt(player.credits) + parseInt(winnings);
      PDHandler.updateStats(player);
      localStorage.setItem("credit_win", 0);
    } else if (localStorage.getItem("coin_win") > 0) {
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
    } else if (localStorage.getItem("social_win") > 0) {
      let winnings = localStorage.getItem("social_win");
      JNotifier.toast({
        html: "You gained " + winnings + " popularity!", 
        position: "center", 
        important: true
      });
      let player = JSON.parse(localStorage.getItem("player"));
      if (winnings > 10) {
        winnings = 10;
      }
      player.followers = parseInt(player.followers) + parseInt(winnings);
      PDHandler.updateStats(player);
      localStorage.setItem("social_win", 0);
    }
  });

  $('body').bind('closePhone', () => {
    $("#player-phone").hide();
    $("#choice-collector").show();
    $("#choice-collector").focus();
    $("#choice-collector").hide();
  });

  // $("#game-container").css({"zoom": 2, "backgroundColor": "red"});
});