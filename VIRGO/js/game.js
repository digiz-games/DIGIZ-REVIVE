var player;

var enemies = [];
var enemies2 = [];
var enemies3 = [];

var enemyWeapons = [];
var enemyWeapons2 = [];
var enemyWeapons3 = [];

var vida;
var vidabar;
var counter = 0;

var kills1 = 0;
var kills2 = 0;

var spawnMultiplier = 1;

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

    game.load.spritesheet('enemy', 'assets/sprites/enemy.png', 64, 64, 5);
    game.load.spritesheet('enemy2', 'assets/sprites/enemy2.png', 64, 64, 5);
    game.load.spritesheet('enemy3', 'assets/sprites/enemy3.png', 64, 64, 5);

    game.load.image('vida', 'assets/sprites/vida.jpg');

    game.load.audio('laser', ['assets/audio/laser.wav']);
    game.load.audio('laser1', ['assets/audio/laser1.wav']);
    game.load.audio('explosion', ['assets/audio/explosion.wav']);
    game.load.audio('virgo_song', ['assets/audio/virgo_song.mp3']);

    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
  },

  create: function(){

    game.world.removeAll();

    enemies = [];
    enemies2 = [];
    enemies3 = [];

    enemyWeapons = [];
    enemyWeapons2 = [];
    enemyWeapons3 = [];

    kills1 = 0;
    kills2 = 0;
    spawnMultiplier = 1;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 2000, 2000);

    game.add.tileSprite(0, 0, 2000, 2000, 'space');

    laser = game.add.audio('laser');
    laserEnemy = game.add.audio('laser1');

    virgo_song = game.add.audio('virgo_song');
    virgo_song.loop = true;
    virgo_song.play();

    player = game.add.sprite(500, 500, 'ship');
    game.physics.arcade.enable(player);
    player.anchor.set(0.5);
    player.body.drag.set(120);
    player.body.maxVelocity.set(400);

    game.camera.follow(player);

    weapon = game.add.weapon(30, 'bullet');
    weapon.bulletSpeed = 700;
    weapon.fireRate = 120;
    weapon.trackSprite(player, 0, 0, true);

    vida = 200;
    vidabar = game.add.sprite(50, 10, 'vida');
    vidabar.fixedToCamera = true;

    text = game.add.text(game.width/2, 20, 'Score: 0', { font: "30px Arial", fill: "#fff" });
    text.anchor.set(0.5);
    text.fixedToCamera = true;

    game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.spawnEnemies, this);

    game.input.onDown.add(this.handleInput, this);
  },

  update: function(){

    vidabar.width = vida;

    if(vida <= 0){
      this.dead();
      return;
    }

    var pointer = game.input.activePointer;

    if(pointer.isDown){
      game.physics.arcade.accelerateToPointer(player, pointer, 600);
      player.rotation = game.physics.arcade.angleToPointer(player);
    }

    this.updateEnemies(enemies, enemyWeapons, 120);
    this.updateEnemies(enemies2, enemyWeapons2, 180);
    this.updateEnemies(enemies3, enemyWeapons3, 400);

    game.world.wrap(player, 16);
  },

  updateEnemies: function(list, weapons, speed){

    for (var i = list.length - 1; i >= 0; i--){

        var e = list[i];
        var w = weapons[i];

        if(!e || !e.exists){
            list.splice(i,1);
            weapons.splice(i,1);
            continue;
        }

        game.physics.arcade.moveToObject(e, player, speed);
        e.rotation = game.physics.arcade.angleBetween(e, player);

        if(w && game.time.now > w.nextFire){
            w.fireAtSprite(player);
            w.nextFire = game.time.now + w.fireRate;
        }

        game.physics.arcade.overlap(e, weapon.bullets, this.hitEnemy, null, this);
        game.physics.arcade.overlap(player, w.bullets, this.hitPlayer, null, this);
    }
  },

  spawnEnemies: function(){

    // ENEMIES (BÁSICOS)
    for(let i=0;i<spawnMultiplier;i++){
      this.createEnemyType(1);
    }
  },

  createEnemyType: function(type){

    var spriteKey = type === 1 ? 'enemy' : type === 2 ? 'enemy2' : 'enemy3';

    var e = game.add.sprite(
      game.rnd.integerInRange(0, 2000),
      game.rnd.integerInRange(0, 2000),
      spriteKey
    );

    game.physics.arcade.enable(e);
    e.anchor.set(0.5);

    var w = game.add.weapon(10, 'bullet');

    if(type === 1){
      w.bulletSpeed = 400;
      w.fireRate = 1200;
      enemies.push(e);
      enemyWeapons.push(w);
    }

    if(type === 2){
      w.bulletSpeed = 500;
      w.fireRate = 700; // 🔥 más disparos
      enemies2.push(e);
      enemyWeapons2.push(w);
    }

    if(type === 3){
      w.bulletSpeed = 600;
      w.fireRate = 700;
      enemies3.push(e);
      enemyWeapons3.push(w);
    }

    w.trackSprite(e, 0, 0, true);
    w.nextFire = 0;
  },

  hitEnemy: function(enemy, bullet){

    bullet.kill();
    enemy.kill();

    counter++;
    text.setText('Score: ' + counter);

    game.sound.play('explosion');

    // 🔥 IDENTIFICAR TIPO
    if(enemies.includes(enemy)){
        kills1++;

        if(kills1 % 5 === 0){
            this.createEnemyType(2);
        }

        if(kills1 % 10 === 0){
            spawnMultiplier++;
        }
    }

    if(enemies2.includes(enemy)){
        kills2++;

        if(kills2 % 5 === 0){
            this.createEnemyType(3);
        }
    }
  },

  hitPlayer: function(player, bullet){
    bullet.kill();
    vida -= 10;
  },

  handleInput: function(pointer){

    var now = new Date().getTime();

    if(now - lastTap < 300){
        this.fire();
    }

    lastTap = now;

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

  dead: function(){
    virgo_song.stop();
    game.sound.play('explosion');
    game.state.restart(true, false);
  }

};
