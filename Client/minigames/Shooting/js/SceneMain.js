class SceneMain extends Phaser.Scene {
    constructor() {
      super({ key: "SceneMain" });
    }
    preload(){
      //sprites
      // this.load.image("sprBg0", "content/sprBg0.png");
      // this.load.image("sprBg1", "content/sprBg1.png");
      this.load.spritesheet("enemyDead", "content/enemyDead.png", {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.spritesheet("shootingEnemy", "content/shooting_enemy.png", {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.spritesheet("chasingEnemy","content/chasing_enemy.png",{
        frameWidth: 32,
        frameHeight:32
      });
      this.load.spritesheet("flyingEnemy", "content/flying_enemy.png", {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.image("enemyAttack", "content/enemyAttack.png");
      this.load.image("playerAttack", "content/playerAttack.png");
      this.load.spritesheet("player", "content/shootPlayer.png", {
        frameWidth: 42,
        frameHeight: 44
      });
      this.load.spritesheet("playerDead","content/playerDead.png",{
        frameWidth:42,
        frameHeight:50
      });
      this.load.image("powerUp","content/powerUp.png");
    }


    
    create() {
      //animation
      this.anims.create({
        key: "shootingEnemy",
        frames: this.anims.generateFrameNumbers("shootingEnemy"),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: "chasingEnemy",
        frames: this.anims.generateFrameNumbers("chasingEnemy"),
        frameRate: 10,
        repeat:-1
      })
      this.anims.create({
        key: "flyingEnemy",
        frames: this.anims.generateFrameNumbers("flyingEnemy"),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: "enemyDead",
        frames: this.anims.generateFrameNumbers("enemyDead"),
        frameRate: 10,
        repeat: 0
      });
      this.anims.create({
        key: "player",
        frames: this.anims.generateFrameNumbers("player",{start:0,end:1}),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: "playerDead",
        frames: this.anims.generateFrameNumbers("playerDead"),
        frameRate:7,
        repeat: 0
      })

      this.anims.create({
        key: "playerPowerUp",
        frames: this.anims.generateFrameNumbers("player",{start:2,end:3}),
        frameRate: 7,
        repeat: -1
      })

      // //scroll the back ground 
      // this.backgrounds = [];
      // for (var i = 0; i < 5; i++) { // create five scrolling backgrounds
      //   var bg = new ScrollingBackground(this, "sprBg0", i * 10);
      //   this.backgrounds.push(bg);
      // }
      var gameWidth = this.game.config.width;
      var gameHeight = this.game.config.height;
      //construct player
      this.player = new Player(this,gameWidth * 0.5,gameHeight * 0.5,"player");
      this.player.displayHeight = 64;
      this.player.displayWidth = 64;
      // control key
      this.cursors = this.input.keyboard.createCursorKeys();


      //groups for different object
      this.enemies = this.add.group();
      this.enemyAttack = this.add.group();
      this.playerAttack = this.add.group();
      this.powerUp = this.add.group();

      //spawn enemy event 
      this.time.addEvent({
        delay: 1000,
        callback: function() {
          var enemy = null;
          if (this.getRandomInt(10) >= 3 && this.getEnemiesNumberByType("shootingEnemy")< 7) {
            enemy = new shootingEnemy(this,gameWidth,this.getRandomInt(gameHeight));
          }
          else if (this.getRandomInt(10) >= 5) {
            enemy = new flyingEnemy(this,gameWidth,this.getRandomInt(gameHeight));
          }
          else {
            enemy = new chasingEnemy(this,gameWidth,this.getRandomInt(gameHeight));
          }
          if (enemy !== null) {
            enemy.setScale(1.6);
            this.enemies.add(enemy);
          }
        },
        callbackScope: this,
        loop: true
      });

      this.time.addEvent({
        delay:0,
        callback: function() {
          var powerUp = null;
          if(random>=90 || (random <=10 && random!=0)){
            powerUp = new PowerUp(this,gameWidth,this.getRandomInt(gameHeight));
            powerUp.setScale(0.2)
            console.log("hi");
          }
          if(powerUp != null){
            this.powerUp.add(powerUp);
            random =0;
          }
        },
        callbackScope:this,
        loop:true
      });


      //collision playerlaser and enemy
      this.physics.add.collider(this.enemies, this.playerAttack, function(enemy,playerAttack) {
        if (enemy != undefined) {
          enemy.onDestroy();
          enemy.explode(true);
          playerAttack.destroy();
        }
      });

      //collision player and enemyLasers
      this.physics.add.overlap(this.player, this.enemyAttack, function(player, laser) {
        if (!player.getData("isDead") && !laser.getData("isDead")) {
          player.explode();
          player.onDestroy();
          laser.destroy();
        }
      });

      //collision player and enemy
      this.physics.add.collider(this.player, this.enemies, function(player, enemy) {
        if (!player.getData("isDead") && !enemy.getData("isDead")) {
          player.explode();
          player.onDestroy();
          enemy.destroy();
        }
      });

      //collision player powerup
      this.physics.add.collider(this.player, this.powerUp, function(player, powerUp) {
        player.powerUp = true;
        console.log(player.powerUp);
        powerUp.destroy();
      });
      
      //scores 
      this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#aaa'});
    }

    getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    getRandomArbitrary(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    }
    
    getEnemiesNumberByType(type) {
      var num = 0;
      var length = this.enemies.getChildren().length;
      var enemies = this.enemies.getChildren();
      for (var i = 0; i < length; i++) {
        var enemy = enemies[i];
        if (enemy.getData("type") == type) {
          num +=1;
        }
      }
      console.log(num);
      return num;
    }

    update(){
      //timer that change to game over scene
      if(gameOverTimer<5000){
        gameOverTimer+=1;
      }
      else{
        this.scene.start("SceneGameOver");
      }
      //score update
      this.scoreText.setText('Score: ' + score);

      if (!this.player.getData("isDead")) {
        // player moving
        this.player.update();
        if(this.player.powerUp){
          this.player.anims.play("playerPowerUp");
        }
        else{
          this.player.anims.play("player");
        }
        if (this.cursors.left.isDown) {
          this.player.moveLeft();
        }
        else if (this.cursors.right.isDown) {
          this.player.moveRight();
        }

        if (this.cursors.up.isDown) {
          this.player.moveUp();
        }
        else if (this.cursors.down.isDown) {
          this.player.moveDown();
        }
        
        //player shooting
        if (this.cursors.space.isDown) {
          this.player.setData("isShooting", true);
        }
        else {
          this.player.setData("timerShoot", 9);
          this.player.setData("isShooting", false);
        }
      }

      //enemies update
      var enemies = this.enemies.getChildren();
      for (var i = 0; i < this.enemies.getChildren().length; i++) {
        var enemy = enemies[i];
        enemy.update();
        //remove the enemy outside of the window
        if (enemy.y < -enemy.displayHeight * 4 || enemy.y > this.game.config.height + enemy.displayHeight) {
          if (enemy != undefined) {
            enemy.onDestroy();
            enemy.destroy();
          }
        }
      }

      

      //remove the enemy lasers
      var ea = this.enemyAttack.getChildren()
      for (var i = 0; i < this.enemyAttack.getChildren().length; i++) {
        var atk= ea[i];
        atk.update();
        if (atk.x < -atk.displayWidth || atk.x > this.game.config.width + atk.displayWidth || atk.y < -atk.displayHeight * 4 || atk.y > this.game.config.height + atk.displayHeight) {
          if (atk != undefined) {
            atk.destroy();
          }
        }
      }

      // remove player lasers
      var pa = this.playerAttack.getChildren();
      for (var i = 0; i < this.playerAttack.getChildren().length; i++) {
        var atk = pa[i];
        atk.update();
        if (atk.x < -atk.displayWidth || atk.x > this.game.config.width + atk.displayWidth || atk.y < -atk.displayHeight * 4 || atk.y > this.game.config.height + atk.displayHeight) {
          if (atk!=undefined) {
            atk.destroy();
          }
        }
      }


    }
  }