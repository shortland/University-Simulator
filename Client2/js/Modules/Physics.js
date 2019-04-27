export class Physics {
  constructor({physics} = {}) {
    this.physics = physics;
    this.player;
  }

  add_npc({
    prefix = "Brown",
    atlas = prefix,
    width = 20,
    height = 20,
    offsetX = 54,
    offsetY = 44,
    scale = 0.8,
    spawn,
    motion = "Standing",
    frame = "000",
    maxVX = 1,
    maxVY = 1,
    name = "",
    story = null,
    immovable = true,
    price = null
  } = {}) {
    const npc = this.physics.add
      .sprite(spawn.x, spawn.y, atlas, prefix + "-" + motion + "." + frame)
      .setSize(width, height)
      .setOffset(offsetX, offsetY);

    npc.setScale(scale);
    npc.setMaxVelocity(maxVX, maxVY);
    npc.setName(name);
    npc.setImmovable(immovable);
    npc.story = story;
    if (price != null) {
      npc.price = parseInt(price);
    }
    return npc;
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

  add_player_layer_collisions({layers, player = this.player, callback = null} = {}) {
    layers.forEach(layer => {
      this.physics.add.collider(player, layer, callback);
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