// VIRGO - Phaser 2 / browser and Cordova compatible. No AdMob dependency.
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'game');
game.state.add('Menu', Menu);
game.state.add('Game', Game);
game.state.add('Dead', Dead);
game.state.start('Menu');
