var player;
var asteroides;
var asteroides2;
var asteroides3;

var enemies = [];
var enemiesweapon = [];

var vida;
var vidabar;
var counter = 0;

var laser;
var laser1;
var virgo_song;

var weapon;

var lastTap = 0; // 🔥 doble tap móvil

var Game = {

  preload: function(){

    game.stage.backgroundColor = '#000000';

    game.load.image('space', 'assets/space_bg.jpg');
    game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64, 5);
    game.load.spritesheet('lasers', 'assets/sprites/lasers.png', 32, 14, 12);
    game.load.image('bullet', 'assets/sprites/laser2.png');

    game.load.image('asteroide', 'assets/sprites/asteroide.png');
    game.load.image('asteroide2', 'assets/sprites/asteroide2.png');
    game.load.image('asteroide3', 'assets/sprites/asteroide3.png');

    game.load.image('vida', 'assets/sprites/vida.jpg');

    game.load.spritesheet('enemy', 'assets/sprites/enemy.png', 64, 64, 5);

    game.load.audio('laser', ['assets/audio/laser.wav']);
    game.load.audio('explosion', ['assets/audio/explosion.wav']);
    game.load.audio('laser1', ['assets/audio/laser1.wav']);
    game.load.audio('virgo_song', ['assets/audio/virgo_song.mp3']);

    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

    window.addEventListener('resize', function () {
        game.scale.refresh();
    });

  },

  create: function(){

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 2000, 2000);

    game.add.tileSprite(0, 0, 2000, 2000, 'space');

    // AUDIO
    laser = game.add.audio('laser');
    laser1 = game.add.audio('laser1');

    virgo_song = game.add.audio('virgo_song');
    virgo_song.loop = true;
    virgo_song.play();

    // ASTEROIDES
    asteroides = game.add.group();
    for (var i = 0; i < 20; i++){
        var a = asteroides.create(game.rnd.integerInRange(0, 2000), game.rnd.integerInRange(0, 2000), 'asteroide');
        game.physics.arcade.enable(a);
    }

    // PLAYER
    player = this.add.sprite(500, 500, 'ship');
    game.physics.arcade.enable(player);
    player.anchor.set(0.5);
    player.body.drag.set(200);
    player.body.maxVelocity.set(300);

    game.camera.follow(player);

    // WEAPON
    weapon = game.add.weapon(20, 'bullet');
    weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    weapon.bulletLifespan = 600;
    weapon.bulletSpeed = 600;
    weapon.fireRate = 100;
    weapon.trackSprite(player, 0, 0, true);

    // VIDA
    vida = 200;
    vidabar = this.add.sprite(50, 10, 'vida');
    vidabar.fixedToCamera = true;

    // SCORE
    text = game.add.text(game.width/2, 20, 'Score: 0', { font: "30px Arial", fill: "#ffffff" });
    text.anchor.setTo(0.5);
    text.fixedToCamera = true;

    // SPAWN ENEMIGOS
    game.time.events.loop(Phaser.Timer.SECOND * 2, this.crearEnemy, this);

    // INPUT
    game.input.onDown.add(this.handleInput, this);
  },

  update: function(){

    vidabar.width = vida;

    if(vida <= 0){
      this.dead();
    }

    var pointer = game.input.activePointer;

    // 🔥 MOVIMIENTO (mouse o touch)
    if(pointer.isDown){
        game.physics.arcade.moveToPointer(player, 200);

        player.rotation = game.physics.arcade.angleToPointer(player);
    } else {
        player.body.velocity.set(0); // 🔥 evita aceleración infinita
    }

    // ENEMIGOS SIGUEN AL PLAYER
    for (var i in enemies){
        if(enemies[i]){
            game.physics.arcade.moveToObject(enemies[i], player, 100);
            enemies[i].rotation = game.physics.arcade.angleBetween(enemies[i], player);

            // COLISION
            game.physics.arcade.collide(enemies[i], weapon.bullets, this.colisionenemy, null, this);
            game.physics.arcade.collide(player, enemies[i], this.hitPlayer, null, this);
        }
    }

    game.world.wrap(player, 16);
  },

  // 🔥 INPUT INTELIGENTE
  handleInput: function(pointer){

    var now = new Date().getTime();

    // DOBLE TAP (MÓVIL)
    if(now - lastTap < 300){
        this.fire();
    }

    lastTap = now;

    // CLICK IZQUIERDO (PC)
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

    if(enemies.length < 10){

      var enemy = this.add.sprite(
        game.rnd.integerInRange(0, 2000),
        game.rnd.integerInRange(0, 2000),
        'enemy'
      );

      game.physics.arcade.enable(enemy);
      enemy.anchor.set(0.5);

      enemies.push(enemy);
    }
  },

  colisionenemy: function(enemy, bullet){

    bullet.kill();
    enemy.kill();

    counter++;
    text.setText('Score: ' + counter);

    game.sound.play('explosion');
  },

  hitPlayer: function(player, enemy){
    vida -= 10;
  },

  dead: function(){
    virgo_song.stop();
    game.sound.play('explosion');

    game.state.start('Dead');
  }

};
