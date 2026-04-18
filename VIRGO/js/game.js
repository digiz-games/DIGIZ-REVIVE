var player;
var joystick;
var button;
var asteroides;
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


var Game = {
  preload: function(){
    game.stage.backgroundColor = '#000000';
    game.load.image('fondo', 'assets/map/fondo.png');


    game.load.spritesheet('gamepad',
        'assets/gamepad/gamepad_spritesheet.png', 100, 100);

    game.load.image('space', 'assets/space_bg.jpg');
    game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64, 5);
    //game.load.image('laser', 'assets/sprites/laser.png');
    game.load.spritesheet('laser', 'assets/sprites/laser.png', 32, 14, 3);
    game.load.spritesheet('lasers', 'assets/sprites/lasers.png', 32, 14, 12);
    game.load.image('bullet', 'assets/sprites/laser2.png');
    game.load.image('asteroide', 'assets/sprites/asteroide.png');
    //game.load.spritesheet('asteroide', 'assets/sprites/asteroide.png', 192, 192, 5);
    game.load.spritesheet('estrellas', 'assets/sprites/estrellas.png', 64, 64, 5);
    game.load.image('vida', 'assets/sprites/vida.jpg');
    game.load.spritesheet('enemy', 'assets/sprites/enemy.png', 64, 64, 5);
    game.load.spritesheet('enemy2', 'assets/sprites/enemy2.png', 64, 64, 5);
    game.load.spritesheet('enemy3', 'assets/sprites/enemy3.png', 64, 64, 5);
    game.load.audio('laser', ['assets/audio/laser.wav']);
    game.load.audio('explosion', ['assets/audio/explosion.wav']);



    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    firstRunLandscape = game.scale.isGameLandscape;
    game.scale.forceOrientation(false, true);
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setShowAll();
    window.addEventListener('resize', function () {  this.game.scale.refresh();});

    this.game.scale.refresh();

  },

  create: function(){

    game.time.advancedTiming = true;
///1920, 1200
  game.world.setBounds(0, 0, 2000, 2000);

  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.tileSprite(0, 0, 2000, 2000, 'space');


  asteroides = game.add.group();

    //  And add 10 sprites to it
    for (var i = 0; i < 20; i++)
    {
        //  Create a new sprite at a random world location
        asteroides.create(game.rnd.integerInRange(0, 2000), game.rnd.integerInRange(0, 2000), 'asteroide');
        game.physics.arcade.enable(asteroides);
      //  asteroides.callAll('animations.add', 'animations', 'asteroides', [0,1,2,3,4], 2, true);
      //  asteroides.callAll('play', null, 'asteroides');
      //  asteroides.scale.setTo(0.4, 0.4);

    }
/*
    estrellas = game.add.group();

      //  And add 10 sprites to it
      for (var i = 0; i < 50; i++)
      {
          //  Create a new sprite at a random world location
          asteroides.create(game.rnd.integerInRange(0, 3000), game.rnd.integerInRange(0, 3000), 'estrellas');
          game.physics.arcade.enable(estrellas);
          asteroides.callAll('animations.add', 'animations', 'estrellas', [0,1,2,3,4], 20, true);
          asteroides.callAll('play', null, 'estrellas');
        //  asteroides.scale.setTo(0.4, 0.4);

      }
*/
    weapon = game.add.weapon(1, 'bullet');
    weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    weapon.bulletLifespan = 600;
    weapon.bulletSpeed = 600;
    weapon.fireRate = 1;

    player = this.add.sprite(250, 250, 'ship');
    game.physics.arcade.enable(player);
    player.scale.setTo(0.8, 0.8);
    player.anchor.set(0.5);
    player.body.drag.set(100);
    player.body.maxVelocity.set(300);
    player.lastAngle = -90;
    player.body.immovable = true;
    player.animations.add('explosion', [1,2,3,4, 5], 30, false);
    player.frame = 0;


    game.camera.follow(player);


    weapon.trackSprite(player, 0, 0, true);

    weaponx = game.add.weapon(1, 'bullet');
    weaponx.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    weaponx.bulletLifespan = 600;
    weaponx.bulletSpeed = 600;
    weaponx.fireRate = 1;


    enemigos = game.add.group();

      //  And add 10 sprites to it
      for (var i = 0; i < 20; i++)
      {
          //  Create a new sprite at a random world location
          enemigos.create(game.rnd.integerInRange(0, 2000), game.rnd.integerInRange(0, 2000), 'enemy');
          game.physics.arcade.enable(enemigos);
        //  asteroides.callAll('animations.add', 'animations', 'asteroides', [0,1,2,3,4], 2, true);
        //  asteroides.callAll('play', null, 'asteroides');
        //  asteroides.scale.setTo(0.4, 0.4);
        weaponx.trackSprite(enemigos.getRandom(), 0, 0, true);

      }


    vidabar = this.add.sprite(50, 10, 'vida');
    vidabar.fixedToCamera = true;
    vidabar.width = vida;
    vida = 200;

    text = game.add.text(game.width/2, 20, 'Score: 0', { font: "30px Arial", fill: "#ffffff", align: "center" });
    text.anchor.setTo(0.5, 0.5);
    text.fixedToCamera = true;


    game.time.events.loop(Phaser.Timer.SECOND*game.rnd.integerInRange(0, 2), this.fireenemy1, this);
    game.time.events.loop(Phaser.Timer.SECOND*game.rnd.integerInRange(0, 2), this.fireenemy2, this);
    game.time.events.loop(Phaser.Timer.SECOND, this.fireenemy3, this);
    game.time.events.loop(Phaser.Timer.SECOND, this.firex, this);


  //game.time.events.loop(Phaser.Timer.SECOND*5, this.crearEnemy, this);

    //game.time.events.loop(Phaser.Timer.SECOND*enemy2s, this.crearEnemy2, this);
    //game.time.events.loop(Phaser.Timer.SECOND*enemy3s, this.crearEnemy3, this);


    // Add the VirtualGamepad plugin to the game
    var gamepad = game.plugins.add(Phaser.Plugin.VirtualGamepad);
    joystick = gamepad.addJoystick(100,300, 1, 'gamepad');
    joystick.fixedToCamera = true;
    // Add a button to the game (only one is allowed right now)
    button = gamepad.addButton(500,300, 0.7, 'gamepad');
    button.fixedToCamera = true;



    document.addEventListener("backbutton", this.volvermenu, false);

  },
  update: function(){

    vidabar.width = vida;
    if(vida < 0){
      this.dead();
      };
    if(counter >= 15){
      enemy2s = 10;
    }else if (counter >= 30) {
      enemy2s = 5;
      enemy3s = 20;
    };


    // Read joystick data to set ship's angle and acceleration
    if (joystick.properties.inUse) {
        player.angle = joystick.properties.angle;
        player.lastAngle = player.angle;
    } else {
        player.angle = player.lastAngle;
    }
    player.body.acceleration.x = 4 * joystick.properties.x;
    player.body.acceleration.y = 4 * joystick.properties.y;

    if (button.isDown) {
        this.fire();
    }



      try{
        game.physics.arcade.moveToObject(enemigos, player, 100);
        enemigos.rotation = game.physics.arcade.angleBetween(enemigos, player);

      }catch(err){
        console.log(err);
      }


  for (var i in enemies) {

    try{
      game.physics.arcade.moveToObject(enemies[i], player, 100);
      enemies[i].rotation = game.physics.arcade.angleBetween(enemies[i], player);

    }catch(err){
      console.log(err);
    }

          }

  for (var i in enemies2) {

    try{
      game.physics.arcade.moveToObject(enemies2[i], player, 200);
      enemies2[i].rotation = game.physics.arcade.angleBetween(enemies2[i], player);

    }catch(err){
      console.log(err);
    }

          }
  for (var i in enemies3) {

    try{
      game.physics.arcade.moveToObject(enemies3[i], player, 300);
      enemies3[i].rotation = game.physics.arcade.angleBetween(enemies3[i], player);

    }catch(err){
      console.log(err);
    }

          }

  for (var i in enemies){
      game.physics.arcade.collide(enemies[i], weapon.bullets,this.colisionenemy1, null, this);
      game.physics.arcade.collide(enemies[i], asteroides);

  }

  for (var i in enemies){
      game.physics.arcade.collide( player, enemiesweapon[i].bullets,this.disparoenemy1, null, this);
      game.physics.arcade.collide(player, asteroides,function(){vida -= 0.5});
      game.physics.arcade.collide(player, enemies[i]);

  }

  for (var i in enemies2){
      game.physics.arcade.collide(enemies2[i], weapon.bullets,this.colisionenemy2, null, this);
      game.physics.arcade.collide(enemies2[i], asteroides);

  }

  for (var i in enemies2){
      game.physics.arcade.collide( player, enemiesweapon2[i].bullets,this.disparoenemy2, null, this);
      game.physics.arcade.collide( player, enemies2[i]);

  }

  for (var i in enemies3){
      game.physics.arcade.collide(enemies3[i], weapon.bullets,this.colisionenemy3, null, this);
      game.physics.arcade.collide(enemies3[i], asteroides);

  }

  for (var i in enemies3){
      game.physics.arcade.collide( player, enemiesweapon3[i].bullets,this.disparoenemy3, null, this);
      game.physics.arcade.collide( player, enemies3[i]);

  }


    game.world.wrap(player, 16);
  },
volvermenu: function(){

    game.state.start('Menu');

},
crearEnemy: function(){

  if( enemies.length < 10){


  enemycount++;
  var weaponname = "weapon"+enemycount;
  weaponname = game.add.weapon(1, 'lasers');
  weaponname.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
  weaponname.bulletLifespan = 1000;
  weaponname.bulletSpeed = 600;
  weaponname.fireRate = 1;
  //weaponname.addBulletAnimation('fire',[1,3], 10, false );
  weaponname.bullets.callAll('animations.add', 'animations', 'firelaser', [0,1], 16, true);
  weaponname.bullets.callAll('animations.add', 'animations', 'fireexp', [2], 16, false);
  weaponname.bullets.callAll('play', null, 'firelaser');

  //weaponname.bulletFrame = 0;
  enemiesweapon.push(weaponname);

  var enemyname = "enemy"+enemycount;
  enemyname = this.add.sprite(game.rnd.integerInRange(0, 2000), 0, 'enemy');
  game.physics.arcade.enable(enemyname);
  enemyname.scale.setTo(0.8, 0.8);
  enemyname.anchor.set(0.5);
  weaponname.trackSprite(enemyname, 0, 0, true);
  enemyname.id = enemycount;
  enemyname.animations.add('explosion', [1,2,3,4, 5], 30, false);
  enemyname.frame = 0;

   enemies.push(enemyname);
}
},
crearEnemy2: function(){

if(enemies2.length < 10){
  enemycount2++;
  var weaponname = "weapon"+enemycount2;
  weaponname = game.add.weapon(1, 'lasers');
  weaponname.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
  weaponname.bulletLifespan = 1000;
  weaponname.bulletSpeed = 600;
  weaponname.fireRate = 1;
  //weaponname.addBulletAnimation('fire',[1,3], 10, false );
  weaponname.bullets.callAll('animations.add', 'animations', 'firelaser', [3,4], 16, true);
  weaponname.bullets.callAll('animations.add', 'animations', 'fireexp', [5], 16, false);
  weaponname.bullets.callAll('play', null, 'firelaser');


  //weaponname.bulletFrame = 0;
  enemiesweapon2.push(weaponname);

  var enemyname = "enemy"+enemycount2;
  enemyname = this.add.sprite(game.rnd.integerInRange(0, 2000), game.rnd.integerInRange(0, 2000), 'enemy2');
  game.physics.arcade.enable(enemyname);
  enemyname.scale.setTo(0.8, 0.8);
  enemyname.anchor.set(0.5);
  weaponname.trackSprite(enemyname, 0, 0, true);
  enemyname.id = enemycount2;
  enemyname.vida = 20;
  enemyname.animations.add('explosion', [1,2,3,4, 5], 30, false);
  enemyname.frame = 0;

   enemies2.push(enemyname);
}
},
crearEnemy3: function(){

  if (enemies3.length < 5){


  enemycount3++;
  var weaponname = "weapon"+enemycount3;
  weaponname = game.add.weapon(5, 'lasers');
  weaponname.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
  weaponname.bulletLifespan = 8000;
  weaponname.bulletSpeed = 800;
  weaponname.fireRate = 5;
  //weaponname.addBulletAnimation('fire',[1,3], 10, false );
  weaponname.bullets.callAll('animations.add', 'animations', 'firelaser', [9,10], 16, true);
  weaponname.bullets.callAll('animations.add', 'animations', 'fireexp', [11], 16, false);
  weaponname.bullets.callAll('play', null, 'firelaser');

  //weaponname.bulletFrame = 0;
  enemiesweapon3.push(weaponname);

  var enemyname = "enemy"+enemycount3;
  enemyname = this.add.sprite(game.rnd.integerInRange(0, 2000), 2000, 'enemy3');
  game.physics.arcade.enable(enemyname);
  enemyname.scale.setTo(1, 1);
  enemyname.anchor.set(0.5);
  weaponname.trackSprite(enemyname, 0, 0, true);
  enemyname.id = enemycount3;
  enemyname.vida = 20;
  enemyname.animations.add('explosion', [1,2,3,4, 5], 30, false);
  enemyname.frame = 0;

   enemies3.push(enemyname);
}
},
firex: function(){

  weaponx.fire();
  weaponx.onFire.add(function(){
    game.sound.play('laser');

});

  },
fire: function(){

  weapon.fire();
  weapon.onFire.add(function(){
    game.sound.play('laser');

});

  },
fireenemy1: function(){

  for (var i = 0; i < game.rnd.integerInRange(1, enemiesweapon.length); i++ ) {
    try{
      var randomx = game.rnd.integerInRange(1, enemiesweapon.length);
      enemiesweapon[randomx].fire();
      enemiesweapon[randomx].onFire.add(function(){
        game.sound.play('laser');
    });
    }catch(err){
      console.log(err)
    }

  }

  },
  fireenemy2: function(){

    for (var i = 0; i < game.rnd.integerInRange(1, enemiesweapon2.length); i++ ) {
      try{
        var randomx = game.rnd.integerInRange(1, enemiesweapon2.length);
        enemiesweapon2[randomx].fire();
        enemiesweapon2[randomx].onFire.add(function(){
          game.sound.play('laser');
      });
      }catch(err){
        console.log(err)
      }

    }

    },
  fireenemy3: function(){

    for (var i = 0; i < game.rnd.integerInRange(1, enemiesweapon3.length); i++ ) {
      try{
        var randomx = game.rnd.integerInRange(1, enemiesweapon3.length);
        enemiesweapon3[randomx].fire();
        enemiesweapon3[randomx].onFire.add(function(){
          game.sound.play('laser');
      });
      }catch(err){
        console.log(err)
      }

    }

    },
colisionenemy1:function(enemy,bullet){


  counter++;
  text.setText('Score: ' + counter);
  if(counter > record){
      localStorage.setItem("record",counter);
      record = localStorage.getItem("record");
    }
  bullet.kill();
  enemy.animations.play('explosion');
  game.sound.play('explosion');
  enemy.animations.currentAnim.onComplete.add(function () {	enemy.destroy();}, this);

  delete enemies[enemy.id-1];
  delete enemiesweapon[enemy.id-1];


},
colisionenemy2:function(enemy,bullet){

  enemy.vida -= 10;

  bullet.kill();


  if(enemy.vida < 0){

    counter++;
    text.setText('Score: ' + counter);
    if(counter > record){
        localStorage.setItem("record",counter);
        record = localStorage.getItem("record");
      }

    enemy.animations.play('explosion');
    game.sound.play('explosion');
    }


  enemy.animations.currentAnim.onComplete.add(function () {

      enemy.destroy();
      delete enemies2[enemy.id-1];
      delete enemiesweapon2[enemy.id-1];

  }, this);

},
colisionenemy3:function(enemy,bullet){

  enemy.vida -= 10;

  bullet.kill();


  if(enemy.vida < 0){

    counter++;
    text.setText('Score: ' + counter);
    if(counter > record){
        localStorage.setItem("record",counter);
        record = localStorage.getItem("record");
      }

    enemy.animations.play('explosion');
    game.sound.play('explosion');
    }


  enemy.animations.currentAnim.onComplete.add(function () {

      enemy.destroy();
      delete enemies3[enemy.id-1];
      delete enemiesweapon3[enemy.id-1];

  }, this);

},
disparoenemy1:function(player,bullet){

  bullet.animations.play('fireexp');
  vida -= 5;
  bullet.animations.currentAnim.onComplete.add(function () {bullet.kill();bullet.animations.play('firelaser');}, this);

},
disparoenemy2:function(player,bullet){

  bullet.animations.play('fireexp');
  vida -= 10;
  bullet.animations.currentAnim.onComplete.add(function () {bullet.kill();bullet.animations.play('firelaser');}, this);

},
disparoenemy3:function(player,bullet){

  bullet.animations.play('fireexp');
  vida -= 10;
  bullet.animations.currentAnim.onComplete.add(function () {bullet.kill();bullet.animations.play('firelaser');}, this);

},
dead: function(){
  player.animations.play('explosion');
  game.sound.play('explosion');
  player.animations.currentAnim.onComplete.add(function () {	this.state.start('Dead');}, this);
},

  render: function(){
      //game.debug.pointer( game.input.activePointer );
      //game.debug.body(player);
      //game.debug.physicsGroup(asteroides);
      game.debug.text(game.time.fps, 2, 14, "#00ff00");

      //game.debug.geom(rect1,'#0fffff');
      //game.debug.cameraInfo(game.camera, 32, 32);

  }


};
