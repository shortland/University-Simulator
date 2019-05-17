import { InteractableTileMapping } from './ModuleLoader.js';

export class PlayerDataHandler {
  constructor() {
    this.ITM = new InteractableTileMapping;
    localStorage.setItem("refreshed_stats", Math.round((new Date()).getTime() / 1000));
    this.refreshCStats();
  }

  toggleInventory() {
    if ($("#player-inventory").is(":visible")) {
      $("#player-inventory").hide();
    } else {
      $("#player-inventory").show();
      $("#player-inv-table").html("")
      let inventory = this.getInventory();
      let counts = {};
      inventory.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
      const keys = Object.keys(counts);
      keys.sort((a, b) => {
          return counts[b] - counts[a];
      });
      keys.forEach(k => {
        // $("#player-inv-table").append("<tr class='inv_item' id='"+ k +"'><td>" + this.ITM.Id2Name(k) + "</td><td align='center'>x" + counts[k] + "</td></tr>");
        $("#player-inv-table").append(`
          <div class="app-icon" style="color:black !important;"><center><div class="inv_item" style="width: 70px;height: 70px;border-radius: 5px;background-position: center;background-repeat: no-repeat;background-size: auto 100%;background-image: url('assets\/items\/` + k + `.png');cursor: pointer;" title="` + this.ITM.Id2Name(k) + `" id="` + k + `"></div></center> x<span id="` + k + `_amount">` + counts[k] + `</span></div>
        `);
      });
      $(".app-icon").tooltip({show: true});
      $(".inv_item").on("click", event2 => {
        //$("#" + event2.currentTarget.id + "_amount").html("USE");
        //console.log("EAT", event2.currentTarget.id);
        this.useItem(event2.currentTarget.id);
        this.toggleInventory();
        /**
         * TODO: this is kinda buggy
         */
        this.toggleInventory();
      });
    }
  }

  useItem(id) {
    console.log(id);
    const data = this.getStats();
    if (this.ITM.FOODS[id] != null) {
      this.consumeItem({item: id});
    }  else if (this.ITM.SKINS[id] != null) {
      let index = data["inventory"].indexOf(id);
      if (index !== -1) data["inventory"].splice(index, 1);
      console.log("SETTING SKIN", id);
      localStorage.setItem("skin", id);
      // if (confirm("Reload page to view sprite update?")) {
      //   window.location.href = window.location.href;
      // }
    } else {
      let index = data["inventory"].indexOf(id);
      if (index !== -1) data["inventory"].splice(index, 1);
      console.log("UNKNOWN CONSUME ACTION");
    }
    //this.updateStats(data);
  }

  consumeItem({item, ignore_cash = true} = {}) {
    /**
     * Music
     */
    let src = Math.random() < 0.5 ? ["assets/audio/Eating.wav"] : ["assets/audio/Drinking.wav"];
    const sound = new Howl({
      src: src,
      autoplay: true,
      loop: false,
      volume: 0.01,
      onend: function() {
        console.log('Finished!');
      }
    });
    sound.play();

    const data = this.getStats();

    // remove the item from inventory
    let index = data["inventory"].indexOf(item);
    if (index !== -1) data["inventory"].splice(index, 1);

    Object.keys(this.ITM.FOODS[item]["stats"]).forEach(stat => {
      /**
       * Next if current is cash...
       * Assumes the cash transaction already took place
       */
      if (ignore_cash && stat == "cash") {
        return;
      }
      console.log("Increasing stats");
      console.log(stat, "by", parseFloat(this.ITM.FOODS[item]["stats"][stat]));
      data[stat] += parseFloat(this.ITM.FOODS[item]["stats"][stat]);
    });
    this.updateStats(data);
  }

  addInventory({itemList} = {}) {
    const data = this.getStats();
    itemList.forEach(item => {
      data["inventory"].push(item);
    });
    this.updateStats(data);
  }

  getInventory() {
    return this.getStats()["inventory"];
  }

  addStats({stats} = {}) {
    let data = this.getStats();
    Object.keys(stats).forEach(stat => {
      //console.log(stats[stat]);
      if (stat == "cash") {
        if (parseInt(stats[stat]) + parseInt(data["cash"]) < 0) {
          return -1;
        }
      }
      data[stat] += parseFloat(stats[stat]);
      if (data[stat] < 0) {
        data[stat] = 0;
      }
      if (data["sleep"] > 100) {
        data["sleep"] = 100;
      }
    });
    this.updateStats(data);
  }

  refresh() {
    let email = this.getStats()["email"];
    $.getJSON("https://universitysimulator.com/UniversitySimulator/Server/index.php?method=get_user&email=" + email, data => {
      this.updateStats(data);
    }).fail(() => {
      // alert("Unable to fetch data");
      console.log("ERROR FETCHING DATA");
    });
  }

  /**
   * Should be renamed to "getPlayerData()"
   */
  getStats() {
    return JSON.parse(localStorage.getItem("player"));
  }

  restartGame() {
    let playerData = JSON.parse(localStorage.getItem("player"));
    $.ajax({
      url: "https://universitysimulator.com/UniversitySimulator/Server/index.php?method=restart&email=" + encodeURI(playerData.email),
      type: 'get',
      dataType: 'json',
      success: function (data) {
        console.log("game restarted");
        localStorage.clear();
        localStorage.setItem("needs_login", true);
      }
    });
  }

  refreshCStats() {
    let last_refresh = localStorage.getItem("refreshed_stats");
    if (Math.round((new Date()).getTime() / 1000) - last_refresh >= 2) {
      let playerData = JSON.parse(localStorage.getItem("player"));
      if (playerData === null) {
        return;
      }
      $("#player-stats-all").html(
        "" + playerData.username + "\n<br>Week [" + playerData.week + "]<br><hr style='border:1px solid white'>" +
        "GPA: " + playerData.gpa + "<br>" +
        "" + playerData.credits + " Credits <br><hr style='border:1px solid white'>" +
        "Cash: <b>$" + playerData.cash + "</b><br>"+
        "Energy: " + playerData.sleep + "%<br>"+
        "Hunger: " + playerData.hunger + "%<br>"+
        "Thirst: " + playerData.thirst + "%<br>"+
        "Health: " + playerData.health + "%<br><hr style='border:1px solid white'>" + 
        "Kills: " + (localStorage.getItem("kills") || 0) + "<br><hr style='border:1px solid white'>"
      );
      this.serverSaveStats(playerData);
      localStorage.setItem("refreshed_stats", Math.round((new Date()).getTime() / 1000));
    }    
    let self = this;
    setTimeout(() => {
      self.refreshCStats();
    }, 2000);
  }

  serverSaveStats(playerData) {
    $.ajax({
      url: "https://universitysimulator.com/UniversitySimulator/Server/index.php?method=save_user&email=" + encodeURI(playerData.email),
      type: 'post',
      dataType: 'json',
      success: function (data) {
        //console.log("success");
      },
      data: JSON.stringify(playerData)
    });
  }

  updateStats(playerData) {
    let playerString = JSON.stringify(playerData);
    localStorage.setItem("player", playerString);
  
    // $.ajax({
    //   url: "https://universitysimulator.com/UniversitySimulator/Server/index.php?method=save_user&email=" + encodeURI(playerData.email),
    //   type: 'post',
    //   dataType: 'json',
    //   success: function (data) {
    //     //console.log("success");
    //   },
    //   data: playerString
    // });
  
    $("#player-name").html(playerData.username);
    $("#player-idn").html("ID: " + playerData.idn);
    $("#player-year").html("Followers: " + playerData.followers);
    $("#player-credits").html("Credits: " + playerData.credits + "");
    $("#player-cash").html("$" + playerData.cash);

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
      "" + playerData.username + "\n<br>Week [" + playerData.week + "]<br><hr style='border:1px solid white'>" +
      "GPA: " + playerData.gpa + "<br>" +
      "" + playerData.credits + " Credits <br><hr style='border:1px solid white'>" +
      "Cash: <b>$" + playerData.cash + "</b><br>"+
      "Energy: " + playerData.sleep + "%<br>"+
      "Hunger: " + playerData.hunger + "%<br>"+
      "Thirst: " + playerData.thirst + "%<br>"+
      "Health: " + playerData.health + "%<br><hr style='border:1px solid white'>" + 
      "Kills: " + (localStorage.getItem("kills") || 0) + "<br><hr style='border:1px solid white'>"
      // "Happiness: " + playerData.happiness + "%<br><hr style='border:1px solid white'>"+
      // "Classes: " + classes + "<br><hr style='border:1px solid white'>"
    );
  }
}