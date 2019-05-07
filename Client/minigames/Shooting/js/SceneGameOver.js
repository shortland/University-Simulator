class SceneGameOver extends Phaser.Scene {
    constructor() {
      super({ key: "SceneGameOver" });
    }
    create() {
      if(gameOverTimer >= 5000){
        this.title = this.add.text(this.game.config.width * 0.5, 128, "Congratulations You Survived", {
          fontFamily: 'Arial',
          fontSize: 48,
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
        });
        this.title.setOrigin(0.5);
  
      }
      else{
        //game over title
        this.title = this.add.text(this.game.config.width * 0.5, 128, "GAME OVER", {
          fontFamily: 'monospace',
          fontSize: 48,
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center'
        });
        this.title.setOrigin(0.5);
      }
      

      //show score
      this.scoreText = this.add.text(this.game.config.width * 0.5, 220, 'Final Score\t' + score, { fontSize: '32px', fill: '#ffffff' , allign: 'center'});
      this.scoreText.setOrigin(0.5);

      //restart button
      // this.btnRestart = this.add.sprite(
      //   this.game.config.width * 0.5,
      //   300,
      //   "sprBtnRestart"
      // );
      // this.btnRestart.setInteractive();
      // this.btnRestart.on("pointerover", function() {
      //   this.btnRestart.setTexture("sprBtnRestartHover"); // set the button texture to sprBtnPlayHover
      // }, this);
      // this.btnRestart.on("pointerout", function() {
      //   this.setTexture("sprBtnRestart");
      // });
      // this.btnRestart.on("pointerdown", function() {
      //   this.btnRestart.setTexture("sprBtnRestartDown");
      // }, this);
      // this.btnRestart.on("pointerup", function() {
      //   this.btnRestart.setTexture("sprBtnRestart");
      //   //reset score
      //   score =0;
      //   gameOverTimer = 0;
      //   this.scene.start("SceneMain");
      // }, this);
  
    }
  }