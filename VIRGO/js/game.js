var player;
var joystick;
var button;
var gamepad; // 🔥 FIX: guardar referencia al plugin
var asteroides;
var asteroides2;
var asteroides3;
var estrellas;
var enemycount = 0;
var enemycount2 = 0;
var enemycount3 = 0;
var enemies = [];
var enemies2 = [];
var enemies3 = [];
var enemiesweapon = [];
var enemiesweapon2 = [];
var enemiesweapon3 = [];
var vida;
var vidabar;
var counter = 0;
var enemy2s = 20;
var enemy3s = 40;
var laser;
var laser1;
var laser2;
var laser3;
var virgo_song;

var Game = {
  preload: function(){

    game.stage.backgroundColor = '#000000';

    game.load.spritesheet('gamepad','assets/gamepad/gamepad_spritesheet.png', 100, 100);

    game.load.image('space', 'assets/space_bg.jpg');
    game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64, 5);
    game.load.spritesheet('laser', 'assets/sprites/laser.png', 32, 14, 3);
    game.load.spritesheet('lasers', 'assets/sprites/lasers.png', 32, 14, 12);
    game.load.image('bullet', 'assets/sprites/laser2.png');
    game.load.image('asteroide', 'assets/sprites/asteroide.png');
    game.load.image('asteroide2', 'assets/sprites/asteroide2.png');
    game.load.image('asteroide3', 'assets/sprites/asteroide3.png');
    game.load.spritesheet('estrellas', 'assets/sprites/estrellas.png', 64, 64, 5);
    game.load.image('vida', 'assets/sprites/vida.jpg');
    game.load.spritesheet('enemy', 'assets/sprites/enemy.png', 64, 64, 5);
    game.load.spritesheet('enemy2', 'assets/sprites/enemy2.png', 64, 64, 5);
    game.load.spritesheet('enemy3', 'assets/sprites/enemy3.png', 64, 64, 5);

    game.load.audio('laser', ['assets/audio/laser.wav']);
    game.load.audio('explosion', ['assets/audio/explosion.wav']);
    game.load.audio('laser1', ['assets/audio/laser1.wav']);
    game.load.audio('laser2', ['assets/audio/laser2.wav']);
    game.load.audio('laser3', ['assets/audio/laser3.wav']);
    game.load.audio('virgo_song', ['assets/audio/virgo_song.mp3']);

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.forceOrientation(false, true);

    // 🔥 FIX IMPORTANTE
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    window.addEventListener('resize', function () {
        game.scale.refresh();
        if (Game.instance) Game.instance.reposicionarControles(); // 🔥 FIX
    });

    this.game.scale.refresh();
  },

  create: function(){

    Game.instance = this; // 🔥 FIX (para acceder desde resize)

    game.time.advancedTiming = true;
    game.world.setBounds(0, 0, 2000, 2000);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.tileSprite(0, 0, 2000, 2000, 'space');

    laser = game.add.audio('laser');
    laser1 = game.add.audio('laser1');
    laser2 = game.add.audio('laser2');
    laser3 = game.add.audio('laser3');
    virgo_song = game.add.audio('virgo_song');
    virgo_song.loop = true;

    if(!virgo_song.isPlaying){
      virgo_song.play();
    }

    asteroides = game.add.group();
    for (var i = 0; i < 20; i++){
        asteroides.create(game.rnd.integerInRange(0, 2000), game.rnd.integerInRange(0, 2000), 'asteroide');
        game.physics.arcade.enable(asteroides);
    }

    asteroides2 = game.add.group();
    for (var i = 0; i < 20; i++){
        asteroides2.create(game.rnd.integerInRange(0, 3000), game.rnd.integerInRange(0, 3000), 'asteroide2');
        game.physics.arcade.enable(asteroides2);
        asteroides2.scale.setTo(0.7, 0.7);
    }

    asteroides3 = game.add.group();
    for (var i = 0; i < 10; i++){
        asteroides3.create(game.rnd.integerInRange(0, 3000), game.rnd.integerInRange(0, 3000), 'asteroide3');
        game.physics.arcade.enable(asteroides3);
    }

    weapon = game.add.weapon(1, 'bullet');
    weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    weapon.bulletLifespan = 600;
    weapon.bulletSpeed = 600;

    player = this.add.sprite(250, 250, 'ship');
    game.physics.arcade.enable(player);
    player.anchor.set(0.5);

    game.camera.follow(player);
    weapon.trackSprite(player, 0, 0, true);

    vidabar = this.add.sprite(50, 10, 'vida');
    vidabar.fixedToCamera = true;
    vida = 200;

    text = game.add.text(game.width/2, 20, 'Score: 0', { font: "30px Arial", fill: "#ffffff" });
    text.anchor.setTo(0.5);
    text.fixedToCamera = true;

    // 🔥 GAMEPAD
    gamepad = game.plugins.add(Phaser.Plugin.VirtualGamepad);

    joystick = gamepad.addJoystick(0,0, 1, 'gamepad');
    joystick.fixedToCamera = true;

    button = gamepad.addButton(0,0, 0.7, 'gamepad');
    button.fixedToCamera = true;

    this.reposicionarControles(); // 🔥 FIX

    document.addEventListener("backbutton", this.volvermenu, false);
  },

  // 🔥 FUNCIÓN CLAVE
  reposicionarControles: function(){

    var margen = 120;

    joystick.cameraOffset.x = margen;
    joystick.cameraOffset.y = game.height - margen;

    button.cameraOffset.x = game.width - margen;
    button.cameraOffset.y = game.height - margen;

    // 🔥 FIX DEL INPUT
    gamepad.joystickPoint.set(joystick.cameraOffset.x, joystick.cameraOffset.y);
    gamepad.buttonPoint.set(button.cameraOffset.x, button.cameraOffset.y);
  },

  update: function(){

    vidabar.width = vida;

    if(vida < 0){
      this.dead();
    }

    if (joystick.properties.inUse) {
        player.angle = joystick.properties.angle;
        player.lastAngle = player.angle;
    }

    player.body.acceleration.x = 4 * joystick.properties.x;
    player.body.acceleration.y = 4 * joystick.properties.y;

    if (button.isDown) {
        this.fire();
    }

    game.world.wrap(player, 16);
  },

  volvermenu: function(){
    game.state.start('Menu');
  },

  fire: function(){
    weapon.fire();
    if(!laser.isPlaying){
      laser.play();
    }
  },

  dead: function(){
    player.animations.play('explosion');
    game.sound.play('explosion');
    virgo_song.stop();
    player.animations.currentAnim.onComplete.add(function () {
        this.state.start('Dead',true,false);
    }, this);
  }

};
