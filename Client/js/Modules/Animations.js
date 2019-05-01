export class Animations {
  constructor({animations} = {}) {
    this.animations = animations;
  }

  create_player({
    prefix = "Brown",
    start = 0,
    end = 4,
    frameRate = 10
  } = {}) {
    this.create_animation_walking({direction: "Left", prefix: prefix, start: start, end: end, frameRate: frameRate});
    this.create_animation_walking({direction: "Right", prefix: prefix, start: start, end: end, frameRate: frameRate});
    this.create_animation_walking({direction: "Up", prefix: prefix, start: start, end: end, frameRate: frameRate});
    this.create_animation_walking({direction: "Down", prefix: prefix, start: start, end: end, frameRate: frameRate});
  }

  create_animation_walking({
    prefix = "Brown",
    direction = "Up",
    start = 0,
    end = 3,
    frameRate = 10
  } = {}) {
    this.animations.create({
      key: prefix + "-Walking-" + direction,
      frames: this.animations.generateFrameNames(prefix, {
        prefix: prefix + "-Walking-" + direction + ".",
        start: start,
        end: end,
        zeroPad: 3
      }),
      frameRate: frameRate,
      repeat: -1
    });
  }
}