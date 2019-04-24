export class Physics {
  constructor({physics} = {}) {
    this.physics = physics;
    this.player;
  }

  add_player({
    prefix = "Brown",
    width = 20,
    height = 20,
    offsetX = 54,
    offsetY = 44,
    scale = 0.8,
    spawn,
  } = {}) {
    this.player = this.physics.add
      .sprite(spawn.x, spawn.y, prefix, prefix + "-Standing.000")
      .setSize(width, height)
      .setOffset(offsetX, offsetY);
    if (scale !== null) {
      this.player.setScale(scale)
    }
    return this.player;
  }

  add_player_layer_collisions({layers} = {}) {
    layers.forEach(layer => {
      this.physics.add.collider(this.player, layer);
    });
  }

  add_camera_follow({
    camera,
    a = 0,
    b = 0,
    widthBounds = 3200,
    heightBounds = 3200,
    object,
  } = {}) {
    camera.startFollow(object);
    camera.setBounds(a, b, widthBounds, heightBounds);
  }
  
}