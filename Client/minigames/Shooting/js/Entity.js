class gameSprites extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, id, type) {
        super(scene, x, y, id);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);
        this.setData("type", type);
        this.setData("isDead", false);
    }
    explode(){
        if (!this.getData("isDead")) {
            if(this.isPlayer){
                this.play("playerDead");
            }
            else{
                this.setTexture("enemyDead"); 
                this.play("enemyDead"); // play the animation
            }    
            this.setAngle(0);
            this.body.setVelocity(0, 0);
            if(!this.isPlayer){
                score+=1;
                random = Phaser.Math.Between(0,100);
            }
            this.setData("isDead", true);
            this.on('animationcomplete', function() {
              if (!this.isPlayer) {
                this.destroy();
              }
              else {
                this.setVisible(false);
              }
            }, this);  
        }
    }
    onDestroy(){
        
    }

}

class PowerUp extends gameSprites {
    constructor(scene,x,y){
        super(scene,x,y,"powerUp");
        this.body.velocity.x = -200;
    }
}

class playerAttack extends gameSprites {
    constructor(scene, x, y) {
      super(scene, x, y, "playerAttack");
      this.body.velocity.x = 200;
    }
}

class Player extends gameSprites{
    constructor(scene, x, y, id) {
        super(scene, x, y, id, "Player");
        this.play("player");
        this.setData("isShooting", false);
        this.setData("timerShoot", 9);
        this.setData("timerPowerUp",0);
        this.isPlayer = true;
        this.powerUp = false;
    }
    moveUp() {
        this.body.velocity.y = -200;
    }
    moveDown() {
        this.body.velocity.y = 200;
    }
    moveLeft() {
        this.body.velocity.x = -200;
    }
    moveRight() {
        this.body.velocity.x = 200;
    }
    onDestroy(){
        setTimeout(function(scene){
            scene.scene.start("SceneGameOver");
        },1000,this.scene);
    }
    powerUp(isPowerUpTrue){
        this.powerUp = isPowerUpTrue;
    }
    update(){
        this.body.setVelocity(0, 0);
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);   
        // start the timer when this.powerUp is true
        if(this.getData("timerPowerUp")<50 && this.powerUp){
            this.setData("timerPowerUp",this.getData("timerPowerUp")+1);
        }
        else{
            this.powerUp = false;
            this.setData("timerPowerUp",0);
        }
        //shooting timer
        if (this.getData("isShooting") && !this.powerUp) {
            if (this.getData("timerShoot") < 20) {
              this.setData("timerShoot", this.getData("timerShoot") + 1); 
            }
            else {
              var atk = new playerAttack(this.scene, this.x+40, this.y);
              this.scene.playerAttack.add(atk);
              this.setData("timerShoot", 0);
            }
        }
        else if (this.getData("isShooting")&&this.powerUp){
            var atk = new playerAttack(this.scene, this.x, this.y);
            this.scene.playerAttack.add(atk);
        } 
    }
}

class EnemyAttack extends gameSprites {
    constructor(scene, x, y) {
      super(scene, x, y, "enemyAttack");
      this.body.velocity.x = -200;
      this.isPlayer =false;
    }
    
}

class chasingEnemy extends gameSprites {
    constructor(scene, x, y) {
      super(scene, x, y, "chasingEnemy", "chasingEnemy");
      this.play("chasingEnemy");
      this.body.velocity.x = -Math.floor(Math.random() * 50 + 50);
      this.mode = 0; // 0 move down 1 chase
      this.isPlayer =false;
    }
    update(){
        if (!this.getData("isDead") && this.scene.player) {
            if (Phaser.Math.Distance.Between(this.x,this.y,this.scene.player.x,this.scene.player.y) < 320) {
              this.mode = 1;
            }
            //chase mode
            if (this.mode == 1) {
              var dx = this.scene.player.x - this.x;
              var dy = this.scene.player.y - this.y;
              var a = Math.atan2(dy, dx);
              this.body.setVelocity(Math.cos(a) * 100,Math.sin(a) * 100);
            }
        }
    }
  }
  class shootingEnemy extends gameSprites {
    constructor(scene, x, y) {
      super(scene, x, y, "shootingEnemy", "ShootingEnemy");
      this.body.velocity.x = -Math.floor(Math.random() * 50 + 50);
      // shooting event from enemy
      this.shootEvent = this.scene.time.addEvent({delay: 1500,
        callback: function() {
          var atk = new EnemyAttack(this.scene,this.x,this.y);
          this.scene.enemyAttack.add(atk);
        },
        callbackScope: this,
        loop: true
      });
      this.play("shootingEnemy");
      this.isPlayer =false;
    }

    onDestroy(){
        this.shootEvent.remove();
    }

  }
  class flyingEnemy extends gameSprites {
    constructor(scene, x, y) {
      super(scene, x, y, "flyingEnemy", "flyingEnemy");
      this.body.velocity.x = -Math.floor(Math.random() * 50 + 50);
      this.play("flyingEnemy");
      this.isPlayer =false;
    }
  }
