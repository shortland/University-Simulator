/**
 * Control the Day/Night cycles of the main map
 */
export class DayNight {
  constructor(state) {
    if (JSON.parse(localStorage.getItem("time_cycle_loaded")) == true) {
      return;
    } else {
      this.state = state;
      this.timeStay = 0;
      this.cyclesToStay = 6;
      this.tickerCycle = 5000; // 5sec
      this.init();
    }
  }

  init() {
    localStorage.setItem("time_cycle_loaded", true);
    this.ticker();
  }

  ticker() {
    let self = this;
    self.animationChange();
    setTimeout(() => {
      self.ticker();
    }, this.tickerCycle);
  }

  animationChange() {
    if (JSON.parse(localStorage.getItem("setDay"))) {
      $("#game-container canvas").finish();
      $("#game-container canvas").animate({"opacity": 1.0}, 100);
      this.state.night = false;
      this.timeStay = 0;
      localStorage.setItm("setDay", false);
      localStorage.setItem("isNight", false);
    }
    if (JSON.parse(localStorage.getItem("setNight"))) {
      $("#game-container canvas").finish();
      $("#game-container canvas").animate({"opacity": 0.40}, 1000);
      this.state.night = true;
      this.timeStay = 0;
      localStorage.setItem("setNight", false);
      localStorage.setItem("isNight", true);
    }
    $("#game-container canvas").finish();
    let opacity_now = $("#game-container canvas").css("opacity");
    if (this.timeStay != this.cyclesToStay && (parseFloat(opacity_now) == 0.40 || parseFloat(opacity_now) == 1.0)) {
      if (parseFloat(opacity_now).toFixed(2) == 0.40) {
        // nighttime
        this.state.night = true;
        localStorage.setItem("isNight", true);
      } else {
        this.state.night = false;
        localStorage.setItem("isNight", false);
      }
      console.log("stay time...");
      this.timeStay += 1;
      return;
    } else {
      this.timeStay = 0;
    }
    console.log("old opacity", opacity_now);
    /**
     * When it's becoming night-time/opacity decreasing;
     *  It decreases by a full 0.1
     * 
     * When it's becoming day-time/opacity increasing;
     *  It increases by a full 0.1 (but started at 0.X5, so it'll always have a value of 5 in the hundreths place when becoming day-time)
     * 
     * ... therefore; we can gather whether it's becoming day or night from just the value of the opacity
     */
    opacity_now = parseFloat(opacity_now).toFixed(2);
    if (opacity_now.toString().split('').pop() == '5') {
      // it's becoming day
      if (opacity_now > 0.90) {
        this.state.night = false;
        localStorage.setItem("isNight", false);
        opacity_now = 1.0;
      } else {
        this.state.night = false;
        localStorage.setItem("isNight", false);
        opacity_now = parseFloat(parseFloat(opacity_now) + 0.10);
      }
    } else {
      // it's becoming night
      if (opacity_now > 0.40) {
        opacity_now -= 0.10;
      } else {
        opacity_now = 0.45;
      }
    }
    opacity_now = parseFloat(opacity_now).toFixed(2);
    if (opacity_now == 0.40) {
      this.state.night = true;
      localStorage.setItem("isNight", true);
    }
    console.log("new opacity", opacity_now);
    $("#game-container canvas").animate({"opacity": opacity_now}, this.tickerCycle);
  }
}