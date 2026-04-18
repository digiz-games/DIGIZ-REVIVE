var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

var player;
var enemies = [], enemies2 = [], enemies3 = [];
var weapons1 = [], weapons2 = [], weapons3 = [];

var ast1Group, ast2Group, ast3Group;

var vida = 200;
var maxVida = 200;

var weapon;
var counter = 0;

var lastTap = 0;
var startTime = 0;

var scoreText, vidaBar;

var music;
var sndLaser, sndLaser1, sndLaser2, sndLaser3, sndExplosion;

var Game = {

preload: function(){

game.load.image('space', 'assets/space_bg.jpg');
game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64);

game.load.spritesheet('enemy', 'assets/sprites/enemy.png',64,64);
game.load.spritesheet('enemy2', 'assets/sprites/enemy2.png',64,64);
game.load.spritesheet('enemy3', 'assets/sprites/enemy3.png',64,64);

game.load.image('bullet', 'assets/sprites/laser.png');
game.load.image('laser1', 'assets/sprites/laser1.png');
game.load.image('laser2', 'assets/sprites/laser2.png');
game.load.image('laser3', 'assets/sprites/laser3.png');

game.load.image('asteroide', 'assets/sprites/asteroide.png');
game.load.image('asteroide2', 'assets/sprites/asteroide2.png');
game.load.image('asteroide3', 'assets/sprites/asteroide3.png');

game.load.audio('laser', 'assets/audio/laser.mp3');
game.load.audio('laser1', 'assets/audio/laser1.mp3');
game.load.audio('laser2', 'assets/audio/laser2.mp3');
game.load.audio('laser3', 'assets/audio/laser3.mp3');
game.load.audio('explosion', 'assets/audio/explosion.wav');
game.load.audio('music', 'assets/audio/virgo_song.mp3');

},

create: function(){

game.physics.startSystem(Phaser.Physics.ARCADE);
game.world.setBounds(0,0,5000,5000);

game.add.tileSprite(0,0,5000,5000,'space');

// AUDIO
sndLaser = game.add.audio('laser');
sndExplosion = game.add.audio('explosion');

// PLAYER
player = game.add.sprite(2500,2500,'ship');
game.physics.arcade.enable(player);
player.anchor.set(0.5);
player.body.drag.set(80);
player.body.maxVelocity.set(500);

game.camera.follow(player);

// UI
scoreText = game.add.text(20,20,'Score: 0',{fill:'#fff'});
scoreText.fixedToCamera = true;

vidaBar = game.add.graphics(20,50);
vidaBar.fixedToCamera = true;

// WEAPON
weapon = game.add.weapon(40,'bullet');
weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
weapon.bulletLifespan = 800;
weapon.bulletSpeed = 800;
weapon.fireRate = 120;
weapon.trackSprite(player);

// ===== GRUPOS OPTIMIZADOS =====
ast1Group = game.add.group();
ast2Group = game.add.group();
ast3Group = game.add.group();

ast1Group.enableBody = true;
ast2Group.enableBody = true;
ast3Group.enableBody = true;

// 🔥 LIMITES (CLAVE)
ast1Group.maxSize = 40;
ast2Group.maxSize = 40;
ast3Group.maxSize = 20;

// SPAWN CONTROLADO
game.time.events.loop(800,this.spawnAsteroids,this);

game.input.onDown.add(this.handleInput,this);

},

update: function(){

if(vida <= 0) return;

if(game.input.activePointer.isDown){
game.physics.arcade.accelerateToPointer(player, game.input.activePointer, 600);
player.rotation = game.physics.arcade.angleToPointer(player);
}else{
player.body.acceleration.set(0);
}

// COLISIONES EFICIENTES
game.physics.arcade.collide(player, ast1Group);
game.physics.arcade.collide(player, ast3Group);

game.physics.arcade.overlap(ast1Group, weapon.bullets, this.hitAsteroid, null, this);
game.physics.arcade.overlap(ast2Group, weapon.bullets, this.hitAsteroid, null, this);
game.physics.arcade.overlap(ast3Group, weapon.bullets, this.hitAsteroid, null, this);

game.physics.arcade.overlap(player, ast2Group, this.hitPlayerAst2, null, this);

// UI
scoreText.text = "Score: " + counter;

vidaBar.clear();
vidaBar.beginFill(0xff0000);
vidaBar.drawRect(0,0,200*(vida/maxVida),10);

},

// ================= ASTEROIDES =================

spawnAsteroids: function(){

if(ast1Group.countLiving() < 40){
this.createAst1();
}

if(ast2Group.countLiving() < 40){
this.createAst2();
}

if(ast3Group.countLiving() < 20){
this.createAst3();
}

},

createAst1: function(){

let pos = this.spawn();
let a = ast1Group.create(pos.x,pos.y,'asteroide');

a.scale.set(game.rnd.realInRange(0.5,1.5));
a.hp = 2;

a.body.velocity.set(
game.rnd.integerInRange(-50,50),
game.rnd.integerInRange(-50,50)
);

},

createAst2: function(){

let pos = this.spawn();
let a = ast2Group.create(pos.x,pos.y,'asteroide2');

a.scale.set(0.5);
a.hp = 1;

game.physics.arcade.velocityFromAngle(game.rnd.angle(),300,a.body.velocity);

},

createAst3: function(){

let pos = this.spawn();
let a = ast3Group.create(pos.x,pos.y,'asteroide3');

a.scale.set(3);
a.hp = 10;

a.body.velocity.set(
game.rnd.integerInRange(-20,20),
game.rnd.integerInRange(-20,20)
);

},

hitAsteroid: function(a,b){

b.kill();
a.hp--;

if(a.hp <= 0){
a.kill();
sndExplosion.play();
counter++;
}

},

hitPlayerAst2: function(player,a){

vida -= 5;
a.kill();
sndExplosion.play();

},

// ================= INPUT =================

handleInput: function(pointer){

let now = Date.now();

if(now - lastTap < 250){
this.fire();
}

lastTap = now;

},

fire: function(){

let b = weapon.fire();
if(b) sndLaser.play();

},

spawn: function(){

return {
x: player.x + game.rnd.integerInRange(-800,800),
y: player.y + game.rnd.integerInRange(-800,800)
};

}

};

game.state.add('Game', Game);
game.state.start('Game');
