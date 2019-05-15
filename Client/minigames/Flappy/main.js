var gameAssets = {
    preload: function() { 
        game.load.spritesheet('player', 'assets/Character2.png', 28, 64);
        game.load.image('block', 'assets/block.png');
    },

    create: function() { 
    game.stage.backgroundColor = '#add8e6';

    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.player = game.add.sprite(100, 245, 'player');

   
    game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 1000; 

    this.blocks = game.add.group();  //Group of the blocks

    var spaceBarKey = game.input.keyboard.addKey(
                    Phaser.Keyboard.SPACEBAR);
    spaceBarKey.onDown.add(this.jump, this);     
    //player.animations.add('right', [20, 21, 22, 23, 24], 10, true);

    this.timer = game.time.events.loop(1500, this.addblockRow, this);

    this.score = 0;
    this.scoreBoard = game.add.text(25, 10, "0", {
        font: "40px Comic Sans MS", fill: "#ffffff"
    });
    },

    update: function() {
        if (this.player.y < 0 || this.player.y > window.innerHeight)
        this.restartGame();
        
        game.physics.arcade.overlap(this.player, this.blocks, this.restartGame, null, this);
    },
    jump: function() {
        this.player.body.velocity.y = -350;

    },
    addblock: function(x, y){
        var block = game.add.sprite(x,y, 'block');
        this.blocks.add(block);

        game.physics.arcade.enable(block);
        block.body.velocity.x = -200;

        block.checkWorldBounds = true;
        block.putOfBoundsKill = true;

    },
    addblockRow: function(){
        var hole = Math.floor(Math.random() * 3 ) + 1;
        console.log(hole);

        for(var i =0; i < 20; i++)
            if(i != hole && i != hole +1)
                this.addblock(400, i*60 +10);
        this.score += 1;
        this.scoreBoard.text = this.score;
    },
    restartGame: function() {
        game.state.start('main');
    },
    
    
};
var config = {
    type: Phaser.AUTO,
    width:  window.innerWidth,
    height: window.innerHeight,
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        debug: true,
        gravity: { 
          y: 0 
        }
      }
    }
};
var game = new Phaser.Game(config);
game.state.add('main', gameAssets);
game.state.start('main');