import { InteractableTileMapping } from './ModuleLoader.js';

export class PlayerDataHandler {
  constructor() {
    this.ITM = new InteractableTileMapping;
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
        $("#player-inv-table").append("<tr class='inv_item' id='"+ k +"'><td>" + this.ITM.Id2Name(k) + "</td><td align='center'>x" + counts[k] + "</td></tr>");
      });
      $(".inv_item").on("click", event2 => {
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
      let index = data["inventory"].indexOf(id);
      if (index !== -1) data["inventory"].splice(index, 1);
    }  else if (this.ITM.SKINS[id] != null) {
      let index = data["inventory"].indexOf(id);
      if (index !== -1) data["inventory"].splice(index, 1);
      console.log("SETTING SKIN", id);
      localStorage.setItem("skin", id);
      if (confirm("Reload page to view sprite update?")) {
        window.location.href = window.location.href;
      }
    } else {
      let index = data["inventory"].indexOf(id);
      if (index !== -1) data["inventory"].splice(index, 1);
      console.log("UNKNOWN CONSUME ACTION");
    }
    this.updateStats(data);
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
    Object.keys(this.ITM.FOODS[item]["stats"]).forEach(stat => {
      /**
       * Next if current is cash...
       * Assumes the cash transaction already took place
       */
      if (ignore_cash && stat == "cash") {
        return;
      }
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
    this.refresh();
    return this.getStats()["inventory"];
  }

  addStats({stats} = {}) {
    let data = this.getStats();
    Object.keys(stats).forEach(stat => {
      console.log(stats[stat]);
      data[stat] += parseFloat(stats[stat]);
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

  updateStats(playerData) {
    let playerString = JSON.stringify(playerData);
    localStorage.setItem("player", playerString);
  
    $.ajax({
      url: "https://universitysimulator.com/UniversitySimulator/Server/index.php?method=save_user&email=" + encodeURI(playerData.email),
      type: 'post',
      dataType: 'json',
      success: function (data) {
        console.log("success");
      },
      data: playerString
    });
  
    $("#player-name").html(playerData.username);
    $("#player-idn").html("ID: " + playerData.idn);
    $("#player-year").html("Year: " + playerData.year);
    $("#player-credits").html("Credits: " + playerData.credits + "/120");
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
      "GPA: " + playerData.gpa + ", " + playerData.year + "<br>" +
      "" + playerData.credits + "/120 Credits <br><hr style='border:1px solid white'>" +
      "Cash: <b>$" + playerData.cash + "</b><br>"+
      "Energy: " + playerData.energy + "%<br>"+
      "Hunger: " + playerData.hunger + "%<br>"+
      "Thirst: " + playerData.thirst + "%<br>"+
      "Happiness: " + playerData.happiness + "%<br><hr style='border:1px solid white'>"+
      "Classes: " + classes + "<br><hr style='border:1px solid white'>"
    );
  }
}