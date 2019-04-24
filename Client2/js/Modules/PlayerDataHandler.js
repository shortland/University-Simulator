import { InteractableTileMapping } from './ModuleLoader.js';

export class PlayerDataHandler {
  constructor() {
    this.ITM = new InteractableTileMapping;
  }

  consumeItem({item, ignore_cash = true} = {}) {
    const data = this.getStats();
    Object.keys(this.ITM.FOODS[itemType]["stats"]).forEach(stat => {
      /**
       * Next if current is cash...
       * Assumes the cash transaction already took place
       */
      if (ignore_cash && stat == "cash") {
        continue;
      }
      data[stat] += parseFloat(this.ITM.FOODS[itemType]["stats"][stat]);
    });
  }

  addInventory({itemList} = {}) {
    const data = this.getStats();
    itemList.forEach(item => {
      data["inventory"].push(item);
    });
    this.updateStats(data);
  }

  addStats({stats} = {}) {
    let data = this.getStats();
    Object.keys(stats).forEach(stat => {
      data[stat] += parseFloat(stats[stat]);
    });
    this.updateStats(data);
  }

  refresh() {
    let username = this.getStats()["name"];
    $.getJSON("http://ilankleiman.com/StonyBrookSimu/CServer/index.php?method=get_user&username=" + username, data => {
      this.updateStats(data);
    }).fail(() => {
      alert("Unable to fetch data");
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
      url: "http://ilankleiman.com/StonyBrookSimu/CServer/index.php?method=save_user&username=" + encodeURI(playerData.name),
      type: 'post',
      dataType: 'json',
      success: function (data) {
        console.log("success");
      },
      data: playerString
    });
  
    $("#player-name").html(playerData.name);
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
}