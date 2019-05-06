var config = {
    type: Phaser.WEBGL,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "blue",
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: { 
                x: 0, 
                y: 0 
            }
        },
    },
    scene: [
        SceneMainMenu,
        SceneMain,
        SceneGameOver
    ],
    pixelArt: true,
    roundPixels: true
};

var score = 0;
var random = 0;
var gameOverTimer = 0;
var game = new Phaser.Game(config);