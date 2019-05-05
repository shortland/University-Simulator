var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 400,
    backgroundColor: "blue",
    physics: {
        default: "arcade",
        arcade: {
        gravity: { x: 0, y: 0 }
        },
    },
    scene: [SceneMainMenu,SceneMain,SceneGameOver],
    pixelArt: true,
    roundPixels: true
};
var score =0;
var random = 0;
var gameOverTimer = 0;
var game = new Phaser.Game(config);