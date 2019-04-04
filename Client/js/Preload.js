var TopDownGame = TopDownGame || {};
 
//loading the game assets
TopDownGame.Preload = function(){};
 
TopDownGame.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
 
    this.load.setPreloadSprite(this.preloadBar);
 
    //load game assets
    this.load.tilemap('mymap', 'assets/tilemaps/mymap.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/tiles.png');
    this.load.image('greencup', 'assets/images/greencup.png');
    this.load.image('bluecup', 'assets/images/bluecup.png');
    this.load.spritesheet('player', 'assets/images/all.png', 128, 128, 10);
    this.load.spritesheet('playerRight', 'assets/images/lookingright.png', 128, 128, 2);
    this.load.spritesheet('playerLeft', 'assets/images/lookingleft.png', 128, 128, 2);
    this.load.spritesheet('playerDown', 'assets/images/lookingdown.png', 128, 128, 2);
    this.load.image('browndoor', 'assets/images/browndoor.png');
    
  },
  create: function() {
    this.state.start('Game');
  }
};