var player;
var asteroides;

var enemies = [];
var enemyWeapons = [];

var vida;
var vidabar;
var counter = 0;

var laser;
var laserEnemy;
var virgo_song;

var weapon;

var lastTap = 0;

var Game = {

  preload: function(){

    game.stage.backgroundColor = '#000000';

    game.load.image('space', 'assets/space_bg.jpg');
    game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64, 5);
    game.load.image('bullet', 'assets/sprites/laser2.png');
    game.load.spritesheet('lasers', 'assets/sprites/lasers.png', 32, 14, 12);

    game.load.image('asteroide', 'assets/sprites/asteroide.png');
    game.load.image('vida', 'assets/sprites/vida.jpg');
    game.load.spritesheet('enemy', 'assets/sprites/enemy.png', 64, 64, 5);

    game.load.audio('laser', ['assets/audio/laser.wav']);
    game.load.audio('laser1', ['assets/audio/laser1.wav']);
    game.load.audio('explosion', ['assets/audio/explosion.wav']);
    game.load.audio('virgo_song', ['assets/audio/virgo_song.mp3']);

    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
  },

  create: function(){

    // 🔥 LIMPIEZA TOTAL (FIX PANTALLA NEGRA)
    game.world.removeAll();

    enemies = [];
    enemyWeapons = [];

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 2000, 2000);

    game.add.tileSprite(0, 0, 2000, 2000, 'space');

    laser = game.add.audio('laser');
    laserEnemy = game.add.audio('laser1');

    virgo_song = game.add.audio('virgo_song');
    virgo_song.loop = true;
    virgo_song.play();

    // PLAYER
    player = game.add.sprite(500, 500, 'ship');
    game.physics.arcade.enable(player);
    player.anchor.set(0.5);

    // 🔥 INERCIA
    player.body.drag.set(120);
    player.body.maxVelocity.set(400);

    game.camera.follow(player);

    // WEAPON PLAYER
    weapon = game.add.weapon(30, 'bullet');
    weapon.bulletSpeed = 700;
    weapon.fireRate = 120;
    weapon.trackSprite(player, 0, 0, true);

    // VIDA
    vida = 200;
    vidabar = game.add.sprite(50, 10, 'vida');
    vidabar.fixedToCamera = true;

    // SCORE
    text = game.add.text(game.width/2, 20, 'Score: 0', { font: "30px Arial", fill: "#fff" });
    text.anchor.set(0.5);
    text.fixedToCamera = true;

    // SPAWN
    game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.crearEnemy, this);

    game.input.onDown.add(this.handleInput, this);
  },

  update: function(){

    vidabar.width = vida;

    if(vida <= 0){
      this.dead();
      return;
    }

    var pointer = game.input.activePointer;

    // 🔥 MOVIMIENTO CON INERCIA
    if(pointer.isDown){

      game.physics.arcade.accelerateToPointer(player, pointer, 600);

      player.rotation = game.physics.arcade.angleToPointer(player);

    }

    // ENEMIGOS
    for (var i = enemies.length - 1; i >= 0; i--){

        var e = enemies[i];
        var w = enemyWeapons[i];

        if(!e || !e.exists){
            enemies.splice(i,1);
            enemyWeapons.splice(i,1);
            continue;
        }

        game.physics.arcade.moveToObject(e, player, 120);
        e.rotation = game.physics.arcade.angleBetween(e, player);

        // DISPARO ENEMIGO
        if(w && game.time.now > w.nextFire){
            w.fireAtSprite(player);
            w.nextFire = game.time.now + 1000;
            laserEnemy.play();
        }

        // COLISIONES
        game.physics.arcade.overlap(e, weapon.bullets, this.colisionenemy, null, this);
        game.physics.arcade.overlap(player, w.bullets, this.hitPlayer, null, this);
    }

    game.world.wrap(player, 16);
  },

  handleInput: function(pointer){

    var now = new Date().getTime();

    // DOBLE TAP
    if(now - lastTap < 300){
        this.fire();
    }

    lastTap = now;

    // CLICK PC
    if(pointer.leftButton && pointer.leftButton.isDown){
        this.fire();
    }
  },

  fire: function(){
    weapon.fire();
    if(!laser.isPlaying){
      laser.play();
    }
  },

  crearEnemy: function(){

    if(enemies.length > 25) return; // 🔥 límite seguro

    var enemy = game.add.sprite(
      game.rnd.integerInRange(0, 2000),
      game.rnd.integerInRange(0, 2000),
      'enemy'
    );

    game.physics.arcade.enable(enemy);
    enemy.anchor.set(0.5);

    // 🔥 ARMA ENEMIGO
    var w = game.add.weapon(10, 'bullet');
    w.bulletSpeed = 400;
    w.fireRate = 1000;
    w.trackSprite(enemy, 0, 0, true);
    w.nextFire = 0;

    enemies.push(enemy);
    enemyWeapons.push(w);
  },

  colisionenemy: function(enemy, bullet){

    bullet.kill();
    enemy.kill();

    counter++;
    text.setText('Score: ' + counter);

    game.sound.play('explosion');
  },

  hitPlayer: function(player, bullet){
    bullet.kill();
    vida -= 10;
  },

  dead: function(){

    virgo_song.stop();
    game.sound.play('explosion');

    // 🔥 RESET LIMPIO
    game.state.restart(true, false);
  }

};
