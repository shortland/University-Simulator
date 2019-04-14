var TopDownGame = TopDownGame || {};

TopDownGame.game = new Phaser.Game(window.outerWidth, window.outerWidth, Phaser.AUTO, 'game-canvas');

TopDownGame.game.state.add('Boot', TopDownGame.Boot);
TopDownGame.game.state.add('Preload', TopDownGame.Preload);
TopDownGame.game.state.add('Game', TopDownGame.Game);

TopDownGame.game.state.start('Boot');