import { ToolTip, PlayerDataHandler, Sounds, InteractableTileMapping, Physics, JNotify } from './ModuleLoader.js';

export class SharedEventData {
  constructor({game, keyboard, state, skinSpeed, helpVisible = false, createAIs = 0, worldLayer, player} = {}) {
    this.game = game;
    this.state = state;
    this.player = player;
    this.keyboard = keyboard;
    this.helpVisible = helpVisible;
    this.helpMenuTitle;
    this.helpMenuLeft;
    this.helpMenuRight;
    this.skinSpeed = skinSpeed;
    this.PDH = new PlayerDataHandler;
    this.ITM = new InteractableTileMapping;
    this.initHiddenMenus();
    this.initKeyboardEvents();
    this.audio = new Sounds;
    this.JNotifier = new JNotify;
    this.worldLayer = worldLayer;
    this.physicsGen = new Physics({physics: game.physics});

    /**
     * AI
     */
    this.listAI = [];
    this.movingAI = false;
    if (createAIs > 0) {
      this.createAIs(createAIs);
      this.toggleAIMovement();
    }
  }

  /**
   * Initialize all the keyboard events that are shared across maps
   */
  initKeyboardEvents() {
    /**
     * Temporary during development
     * Rapidly change the user velocity... 
     * Warning: User will be able to walk through walls
     */
    this.keyboard.on("keydown-" + "Z", () => {
      if (!this.state.devMode) {
        this.state.speed = 1000;
        this.state.devMode = true;
      } else {
        this.state.speed = this.skinSpeed;
        this.state.devMode = false;
      }
    });

    /**
     * Show/Hide the Help menu
     */
    this.keyboard.on("keydown-" + "H", () => {
      if (this.helpMenuTitle.visible) {
        this.helpMenuTitle.setVisible(false);
        this.helpMenuLeft.setVisible(false);
        this.helpMenuRight.setVisible(false);
      } else {
        this.helpMenuTitle.setVisible(true);
        this.helpMenuLeft.setVisible(true);
        this.helpMenuRight.setVisible(true);
      }
    });

    /**
     * Show/Hide player stats
     */
    this.keyboard.on("keydown-" + "S", () => {
      if ($("#player-stats-all").is(":visible")) {
        $("#player-stats-all").hide();
      } else {
        $("#player-stats-all").show();
      }
    });

    /**
     * Show/Hide player phone
     */
    this.keyboard.on("keydown-" + "P", event => {
      if ($("#player-phone").is(":visible")) {
        $("#player-phone").hide();
      } else {
        document.getElementById("phone_frame").src += '';
        $("#player-phone").show();
      }
    });


    /**
     * Show/Hide map
     */
    this.keyboard.on("keydown-" + "M", event => {
      if ($("#mini-map").is(":visible")) {
        $("#mini-map").hide();
        $("#mini-map-bg-cover").hide();
      } else {
        $("#mini-map").show();
        $("#mini-map-bg-cover").show();
      }
    });

    /**
     * Show/Hide player inventory
     */
    this.keyboard.on("keydown-" + "I", () => {
      console.log("SHOW INVENTORY");
      this.PDH.toggleInventory();
      this.state.newSkin = "yes";
    });

    /**
     * Show/Hide the chat
     */
    this.keyboard.on("keydown-" + "T", event => {
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
  }

  /**
   * Build all the hidden menus/tooltips that are created on create()
   */
  initHiddenMenus() {
    this.helpMenuTitle = new ToolTip({
      game: this.game,
      text: "Help Menu\n",
      align: "center",
      clickDestroy: false,
      depth: 100,
      visible: this.helpVisible,
      x: 330,
      y: 16,
    });

    this.helpMenuLeft = new ToolTip({
      game: this.game,
      text: "⬅️: Move left\n➡️: Move right\n⬆️: Move up\n⬇️: Move down\n\n[H] Show/hide this help menu\n\n[S] Show all player stats\n\n[Z] Toggle running (devmode)\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
      align: "left",
      clickDestroy: false,
      depth: 100,
      visible: this.helpVisible,
      y: 90,
      x: 16,
    });
    
    this.helpMenuRight = new ToolTip({
      game: this.game,
      text: "[Y] Accept transaction\n[N] Reject transaction\n\n[T] Toggle chat\n\n[I] Open/close inventory\n\n[P] Show/hide phone\n\n[M] Show/hide map\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
      align: "left",
      clickDestroy: false,
      depth: 100,
      visible: this.helpVisible,
      y: 90,
      x: 416
    });
  }

  /**
   * Only creates AIs if at least 3 seconds have passed since last creation
   */
  blockingCreateAIs(amt, blockingSeconds) {
    if (this.state.createAIs == 0) {
      if (Math.round((new Date()).getTime() / 1000) - this.state.lastCreate >= blockingSeconds) {
        this.createAIs(amt);
      }
    }
  }

  /**
   * AI?
   */
  createAIs(amt, dist = 600) {
    this.state.lastCreate = Math.round((new Date()).getTime() / 1000);
    this.state.createAIs = 0;
    let radius = this.state.radius || dist;

    /**
     * Zombie dead
     */
    this.game.anims.create({
      key: "zombie-Dead",
      frames: this.game.anims.generateFrameNames("zombie", {
        prefix: "zombie-Dead.",
        start: 0,
        end: 4,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });

    for (let i = 0; i < amt; ++i) {
      let sign_a = Math.random() < 0.5 ? 1 : -1;
      let sign_b = Math.random() < 0.5 ? 1 : -1;
      let SKIN = this.ITM.SAFE_SKINS[Math.floor(Math.random() * this.ITM.SAFE_SKINS.length)];
      const newAI = this.physicsGen.add_npc({
        spawn: {
          x: this.player.x + (Math.floor(Math.random() * radius) * sign_a), 
          y: this.player.y + (Math.floor(Math.random() * radius) * sign_b)
        },
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
            line: this.ITM.QOUTES[Math.floor(Math.random() * this.ITM.QOUTES.length)],
            timeout: 3000
          }
        }
      });

      this.physicsGen.add_player_layer_collisions({
        player: newAI,
        layers: [this.player],
        callback: (a, b) => {
          // a is the AI
          // b is the player
          this.JNotifier.toastPlayerInteraction(a, b);

          if (b.texture.key.includes("car")) {
            if (!a.dead) {
              this.state.kills.push(a.name);
              localStorage.setItem("kills", (parseInt(localStorage.getItem("kills")) || 0) + 1);
              let data = JSON.parse(localStorage.getItem("player"));
              data["cash"] += 1;
              localStorage.setItem("player", JSON.stringify(data));
              $("#player-cash").html("$" + data["cash"]);
            }
            a.dead = true;
          } else { // not in a car
            if (this.state.night) { // nighttime
              if (!a.dead) { // already dead zombies shouldnt hurt you
                let data = JSON.parse(localStorage.getItem("player"));
                data["health"] -= 1;
                if (data["health"] <= 0) {
                  localStorage.setItem("zombie_death", true);
                  $("body").fadeOut(5000, () => {
                    window.location.href = "dead.html";
                  });
                }
                localStorage.setItem("player", JSON.stringify(data));
              }
            }
          }
        }
      });
      this.physicsGen.add_player_layer_collisions({
        player: newAI,
        layers: [this.worldLayer],
        callback: a => {
          a.anims.stop();
          a.body.setVelocity(0);
        }
      });
      this.game.physics.add.collider(this.player, newAI);
      this.listAI.push(newAI);

      /**
       * Create the animations for each of the sprite/skin types
       */
      this.game.anims.create({
        key: SKIN + "-Walking-Left",
        frames: this.game.anims.generateFrameNames(SKIN, {
          prefix: SKIN + "-Walking-Left.",
          start: 0,
          end: 4,
          zeroPad: 3
        }),
        frameRate: 10,
        repeat: -1
      });
      this.game.anims.create({
        key: SKIN + "-Walking-Right",
        frames: this.game.anims.generateFrameNames(SKIN, {
          prefix: SKIN + "-Walking-Right.",
          start: 0,
          end: 4,
          zeroPad: 3
        }),
        frameRate: 10,
        repeat: -1
      });
      this.game.anims.create({
        key: SKIN + "-Walking-Up",
        frames: this.game.anims.generateFrameNames(SKIN, {
          prefix: SKIN + "-Walking-Up.",
          start: 0,
          end: 4,
          zeroPad: 3
        }),
        frameRate: 10,
        repeat: -1
      });
      this.game.anims.create({
        key: SKIN + "-Walking-Down",
        frames: this.game.anims.generateFrameNames(SKIN, {
          prefix: SKIN + "-Walking-Down.",
          start: 0,
          end: 4,
          zeroPad: 3
        }),
        frameRate: 10,
        repeat: -1
      });
    }
    /**
     * Zombie Frame
     */
    this.game.anims.create({
      key: "zombie-Walking-Left",
      frames: this.game.anims.generateFrameNames("zombie", {
        prefix: "zombie-Walking-Left.",
        start: 0,
        end: 4,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    this.game.anims.create({
      key: "zombie-Walking-Right",
      frames: this.game.anims.generateFrameNames("zombie", {
        prefix: "zombie-Walking-Right.",
        start: 0,
        end: 4,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    this.game.anims.create({
      key: "zombie-Walking-Up",
      frames: this.game.anims.generateFrameNames("zombie", {
        prefix: "zombie-Walking-Up.",
        start: 0,
        end: 4,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    this.game.anims.create({
      key: "zombie-Walking-Down",
      frames: this.game.anims.generateFrameNames("zombie", {
        prefix: "zombie-Walking-Down.",
        start: 0,
        end: 4,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
  }

  toggleAIMovement() {
    this.movingAI = true;
    var self = this;
    setTimeout(() => {
      self.toggleAIMovement();
    }, 1000);
  }

  updateAIs() {
    if (!this.movingAI) {
      return;
    }

    this.movingAI = false;
    this.listAI.forEach(ai => {
      if (ai.dead) {
        ai.body.setVelocity(0);
        ai.anims.stop();
        ai.setTexture("zombie", "zombie-Dead.004");
        ai.setOffset(0, 120);
        ai.setAngle(90);
        ai.story.next.line = "...<i>perished from car accident</i>...";
        return;
      }
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
          if (this.state.night) {
            ai.anims.play("zombie-Walking-Right", true);
          } else {
            ai.anims.play(ai.nameSprite + "-Walking-Right", true);
          }
        } else if (realSpeed < 0) {
          if (this.state.night) {
            ai.anims.play("zombie-Walking-Left", true);
          } else {
            ai.anims.play(ai.nameSprite + "-Walking-Left", true);
          }
        }
      } else {
        ai.body.setVelocityY(realSpeed);
        if (realSpeed < 0) {
          if (this.state.night) {
            ai.anims.play("zombie-Walking-Up", true);
          } else {
            ai.anims.play(ai.nameSprite + "-Walking-Up", true);
          }
        } else if (realSpeed > 0) {
          if (this.state.night) {
            ai.anims.play("zombie-Walking-Down", true);
          } else {
            ai.anims.play(ai.nameSprite + "-Walking-Down", true);
          }
        }
      }

      if (realSpeed == 0) {
        ai.anims.stop();
      }

      ai.body.velocity.normalize().scale(speed);
    });
  }
}