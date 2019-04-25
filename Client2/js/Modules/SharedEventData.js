import { ToolTip, PlayerDataHandler } from './ModuleLoader.js';

export class SharedEventData {
  constructor({game, keyboard, state} = {}) {
    this.game = game;
    this.state = state;
    this.keyboard = keyboard;
    this.helpMenuTitle;
    this.helpMenuLeft;
    this.helpMenuRight;
    this.PDH = new PlayerDataHandler();
    this.initHiddenMenus();
    this.initKeyboardEvents();
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
      if (this.state["speed"] == 200) {
        this.state["speed"] = 1000;
      } else {
        this.state["speed"] = 200;
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
     * Show/Hide the Minigames menu
     */
    this.keyboard.on("keydown-" + "M", () => {
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
        $("#play_coin").click(() => {
          localStorage.setItem("coin_win", 0);
          $(".minigames").html("<iframe id='minigame_frame' src='coin.html' frameBorder='0px'></iframe>");
          $("#minigame_frame").focus();
          setTimeout(() => {
            $(".minigames").html("");
            $(".minigames").hide();
            let amt = localStorage.getItem("coin_win");
            alert("Time's up! You won " + amt);
            this.PDH.addStats({stats: {cash: amt}});

            // let playerData = JSON.parse(localStorage.getItem("player"));
            // playerData.cash = parseInt(playerData.cash) + parseInt(localStorage.getItem("coin_win"));
            // PDHandler.updateStats(playerData);
          }, 10000);
        });
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
    this.keyboard.on("keydown-" + "P", () => {
      if ($("#player-phone").is(":visible")) {
        $("#player-phone").hide();
      } else {
        $("#player-phone").show();
      }
    });

    /**
     * Show/Hide player inventory
     */
    this.keyboard.on("keydown-" + "I", () => {
      alert("Not yet implemented");
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
      visible: false,
      x: 330,
      y: 16,
    });

    this.helpMenuLeft = new ToolTip({
      game: this.game,
      text: "⬅️: Move left\n➡️: Move right\n⬆️: Move up\n⬇️: Move down\n\n[H] Show/hide this help menu\n\n[S] Show all player stats\n\n[Z] Toggle running (devmode)\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
      align: "left",
      clickDestroy: false,
      depth: 100,
      visible: false,
      y: 90,
      x: 16,
    });
    
    this.helpMenuRight = new ToolTip({
      game: this.game,//[P] Turn on/off phone //[I] Open/close inventory
      text: "[M] Show Minigames\n\n[Y] Accept transaction\n[N] Reject transaction\n\n[T] Toggle chat\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n_______________________________",
      align: "left",
      clickDestroy: false,
      depth: 100,
      visible: false,
      y: 90,
      x: 416
    });
  }
}