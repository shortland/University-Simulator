/**
 * Control the Day/Night cycles of the main map
 */
export class DayNight {
  constructor() {
    this.timeStay = 0;
    this.cyclesToStay = 4;
    this.tickerCycle = 5000; // 5sec
    this.init();
  }

  init() {
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
    console.log("Changing day night animation!");
    $("#game-container canvas").finish();
    let opacity_now = $("#game-container canvas").css("opacity");
    if (this.timeStay != this.cyclesToStay && (parseFloat(opacity_now) == 0.40 || parseFloat(opacity_now) == 1.0)) { // 6 cycles of daytime
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
      console.log("Should become day...");
      // it's becoming day
      if (opacity_now > 0.90) {
        opacity_now = 1.0;
      } else {
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
    console.log("new opacity", opacity_now);
    $("#game-container canvas").animate({"opacity": opacity_now}, this.tickerCycle);
  }
}