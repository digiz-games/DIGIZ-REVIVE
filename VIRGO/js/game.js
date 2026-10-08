// ================= VARIABLES =================
var player;

var enemies = [], enemies2 = [], enemies3 = [];
var weapons1 = [], weapons2 = [], weapons3 = [];

var ast1 = [], ast2 = [], ast3 = [];

var vida = 200;
var maxVida = 200;

var weapon;
var counter = 0;

var kills1 = 0;
var kills2 = 0;

var lastTap = 0;
var startTime = 0;

var scoreText;
var vidaBar;

var music;
var gameEnded = false;
var healthOrbs = [];
var healthOrbTimer = null;
var asteroidConfig = {world:20000, safe:950, giantCount:32, fastLimit:48};
var sndLaser, sndLaser1, sndLaser2, sndLaser3, sndExplosion;

// ================= GAME =================
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
game.load.audio('music', 'Virgo_Song.mp3');

},

create: function(){

// LIMPIEZA
game.time.events.removeAll();
game.input.onDown.removeAll();

enemies = []; enemies2 = []; enemies3 = [];
weapons1 = []; weapons2 = []; weapons3 = [];
ast1 = []; ast2 = []; ast3 = [];
healthOrbs = [];
gameEnded = false;
lastTap = 0;

vida = maxVida;
counter = 0;
kills1 = 0;
kills2 = 0;

game.world.setBounds(0,0,20000,20000);
game.physics.startSystem(Phaser.Physics.ARCADE);
game.add.tileSprite(0,0,20000,20000,'space');

// AUDIO
sndLaser = game.add.audio('laser'); sndLaser.volume = 0.4;
sndLaser1 = game.add.audio('laser1'); sndLaser1.volume = 0.1;
sndLaser2 = game.add.audio('laser2'); sndLaser2.volume = 0.1;
sndLaser3 = game.add.audio('laser3'); sndLaser3.volume = 0.1;
sndExplosion = game.add.audio('explosion');

music = game.add.audio('music');
music.volume = 0.9;
music.loopFull();

// PLAYER
player = game.add.sprite(10000,10000,'ship',0);
game.physics.arcade.enable(player);
player.anchor.set(0.5);
player.body.drag.set(80);
player.body.maxVelocity.set(500);

game.camera.follow(player);

// UI
scoreText = game.add.text(20,20,'Score: 0',{font:'20px Arial',fill:'#fff'});
scoreText.fixedToCamera = true;

vidaBar = game.add.graphics(20,50);
vidaBar.fixedToCamera = true;

// WEAPON PLAYER
weapon = game.add.weapon(40,'bullet');
weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
weapon.bulletLifespan = 400;
weapon.bulletSpeed = 1800;
weapon.fireRate = 120;
weapon.trackSprite(player,0,0,true);

// Permanent large rigid asteroids distributed at the beginning of the game.
for (var g=0; g<asteroidConfig.giantCount; g++) this.createAst3();

// SPAWN
game.time.events.loop(1500,this.spawnEnemy,this);
game.time.events.loop(700,this.spawnAsteroids,this);
// Occasional health orb: one every 18–30 seconds, maximum two active.
healthOrbTimer = game.time.events.loop(24000, this.spawnHealthOrb, this);

game.input.onDown.add(this.handleInput,this);

startTime = game.time.now;

},

update: function(){

if(gameEnded) return;
if(vida <= 0){ this.dead(); return; }

// MOVIMIENTO
if(game.input.activePointer.isDown){
game.physics.arcade.accelerateToPointer(player, game.input.activePointer, 600);
player.rotation = game.physics.arcade.angleToPointer(player);
}else{
player.body.acceleration.set(0);
}

// ENEMIES
this.updateEnemies();

// ASTEROIDES
this.updateAsteroids();
this.updateHealthOrbs();
if(vida <= 0){ this.dead(); return; }

// UI
scoreText.text = "Score: " + counter;

vidaBar.clear();
vidaBar.beginFill(0xff0000);
vidaBar.drawRect(0,0,200*(vida/maxVida),10);

game.world.wrap(player,16);

},

// ================= ENEMIES =================

updateEnemies: function(){

this.updateEnemyGroup(enemies,weapons1,120,1200,0.2,1);
this.updateEnemyGroup(enemies2,weapons2,300,500,0.3,2);
this.updateEnemy3();

},

updateEnemyGroup: function(list,weapons,speed,rate,prob,type){

for(let i=list.length-1;i>=0;i--){

let e = list[i];
let w = weapons[i];

if(!e.exists){
list.splice(i,1);
weapons.splice(i,1);
continue;
}

game.physics.arcade.moveToObject(e,player,speed);
e.rotation = game.physics.arcade.angleBetween(e,player);

if(game.time.now > w.nextFire){
w.fireAtSprite(player);
if(Math.random()<prob){
if(type==1) sndLaser1.play();
if(type==2) sndLaser2.play();
}
w.nextFire = game.time.now + rate;
}

this.checkHits(e,w,type);

}

},

updateEnemy3: function(){

for(let i=enemies3.length-1;i>=0;i--){

let e = enemies3[i];
let w = weapons3[i];

if(!e.exists){
enemies3.splice(i,1);
weapons3.splice(i,1);
continue;
}

game.physics.arcade.moveToObject(e,player,80);
e.rotation = game.physics.arcade.angleBetween(e,player);

if(game.time.now > w.nextFire){

for(let a=0;a<360;a+=30){
let b = w.fire();
if(b){
game.physics.arcade.velocityFromAngle(a,500,b.body.velocity);
}
}

sndLaser3.play();
w.nextFire = game.time.now + 2000;
}

this.checkHits(e,w,3);

}

},

checkHits: function(e,w,type){

game.physics.arcade.overlap(e,weapon.bullets,(enemy,bullet)=>{

bullet.kill();
enemy.hp--;

if(enemy.hp <= 0){

enemy.kill();
sndExplosion.play();
if(!gameEnded) counter++;

//Cantidad De ENEMIGOS
  
if(type==1){
kills1++;
if(kills1 % 3 === 0){
let p = this.spawnFueraPantalla();
this.createEnemy(2,p.x,p.y);
}
}

if(type==2){
kills2++;
if(kills2 % 3 === 0){
let p = this.spawnFueraPantalla();
this.createEnemy(3,p.x,p.y);
}
}

if(type==3){
vida = Math.min(maxVida, vida*2);
}

}

},null,this);

game.physics.arcade.overlap(player,w.bullets,this.hitPlayer,null,this);

},

spawnEnemy: function(){

let pos = this.spawnFueraPantalla();
this.createEnemy(1,pos.x,pos.y);

},

createEnemy: function(type,x,y){

let key = type==1?'enemy':type==2?'enemy2':'enemy3';

let e = game.add.sprite(x,y,key,0);
game.physics.arcade.enable(e);
e.anchor.set(0.5);

if(type==3) e.scale.set(2.5);

e.hp = type==1?1:type==2?3:5;

let bulletKey = type==1?'laser1':type==2?'laser2':'laser3';

let w = game.add.weapon(20,bulletKey);
w.trackSprite(e,0,0,true);

if(type==1){ w.bulletSpeed=450; w.bulletLifespan=1; }
if(type==2){ w.bulletSpeed=1800; w.bulletLifespan=150; }
if(type==3){ w.bulletSpeed=3000; w.bulletLifespan=600; }

w.nextFire = 0;

if(type==1){ enemies.push(e); weapons1.push(w); }
if(type==2){ enemies2.push(e); weapons2.push(w); }
if(type==3){ enemies3.push(e); weapons3.push(w); }

},

hitPlayer: function(player,bullet){
bullet.kill();
if (gameEnded) return;
vida = Math.max(0, vida - 10);
sndExplosion.play();
},

// ================= ASTEROIDES =================
// All sizes are measured using the rendered sprite dimensions, not arbitrary categories.
// Arcade Physics is AABB-based; collision boxes are deliberately conservative.
asteroidRadius: function(a){ return Math.max(a.width,a.height)*0.43; },
farFromPlayer: function(x,y,r){
  return Math.hypot(x-player.x,y-player.y) > asteroidConfig.safe+r &&
         Math.abs(x-player.x)>game.camera.width*0.55+r ||
         Math.hypot(x-player.x,y-player.y) > asteroidConfig.safe+r &&
         Math.abs(y-player.y)>game.camera.height*0.55+r;
},
canPlaceAsteroid: function(x,y,r){
  if(x<r+60 || y<r+60 || x>20000-r-60 || y>20000-r-60) return false;
  if(!this.farFromPlayer(x,y,r)) return false;
  var all=ast1.concat(ast2,ast3);
  for(var i=0;i<all.length;i++){
    var a=all[i];
    if(a.alive && Math.hypot(x-a.x,y-a.y)<r+this.asteroidRadius(a)+80) return false;
  }
  return true;
},
peripheralPosition: function(r){
  // At least 950 world pixels away, AND beyond the visible camera rectangle.
  for(var i=0;i<45;i++){
    var angle=Math.random()*Math.PI*2;
    var dist=Math.max(asteroidConfig.safe+r+100,Math.hypot(game.camera.width,game.camera.height)*0.7+r+150);
    dist+=Math.random()*500;
    var x=Phaser.Math.clamp(player.x+Math.cos(angle)*dist,r+70,20000-r-70);
    var y=Phaser.Math.clamp(player.y+Math.sin(angle)*dist,r+70,20000-r-70);
    if(this.canPlaceAsteroid(x,y,r)) return {x:x,y:y};
  }
  return null;
},
worldPosition: function(r){
  for(var i=0;i<90;i++){
    var x=game.rnd.realInRange(r+70,20000-r-70);
    var y=game.rnd.realInRange(r+70,20000-r-70);
    if(this.canPlaceAsteroid(x,y,r)) return {x:x,y:y};
  }
  return null;
},
setupAsteroid: function(a,kind,scale){
  a.anchor.set(0.5); a.scale.set(scale);
  game.physics.arcade.enable(a);
  a.body.setSize(a.texture.frame.width*0.80,a.texture.frame.height*0.80,
                 a.texture.frame.width*0.10,a.texture.frame.height*0.10);
  a.kind=kind;
  a.radius=this.asteroidRadius(a);
  a.body.collideWorldBounds=true;
  a.body.bounce.set(kind===3?0:0.35);
  a.body.immovable=(kind===3);
  a.body.moves=(kind!==3);
  return a;
},
spawnAsteroids: function(){
  if(gameEnded) return;
  // The heavy giants are generated only at game start, never dynamically.
  if(Math.random()<0.72) this.createAst2();
  else this.createAst1();
},
createAst1: function(){
  var scale=game.rnd.realInRange(0.55,1.25);
  var base=game.cache.getImage('asteroide');
  var r=Math.max(base.width,base.height)*scale*0.43;
  var pos=this.peripheralPosition(r); if(!pos) return;
  var a=this.setupAsteroid(game.add.sprite(pos.x,pos.y,'asteroide'),1,scale);
  a.hp=3;
  a.body.mass=Math.max(2,scale*5);
  a.body.velocity.set(game.rnd.integerInRange(-32,32),game.rnd.integerInRange(-32,32));
  ast1.push(a);
},
createAst2: function(){
  if(ast2.filter(function(a){return a.alive;}).length>=asteroidConfig.fastLimit) return;
  // Small and fast = common. Big and slower = rare.
  var chance=Math.random();
  var scale=chance<0.68?game.rnd.realInRange(0.22,0.60):
            chance<0.92?game.rnd.realInRange(0.65,1.7):
                         game.rnd.realInRange(2.2,5.5);
  var base=game.cache.getImage('asteroide2');
  var r=Math.max(base.width,base.height)*scale*0.43;
  var pos=this.peripheralPosition(r); if(!pos) return;
  var a=this.setupAsteroid(game.add.sprite(pos.x,pos.y,'asteroide2'),2,scale);
  a.body.mass=Math.max(1,Math.pow(scale,2)*8);
  var speed=Phaser.Math.clamp(850/(0.7+scale*0.72),85,850);
  // Travel across the playfield, not spawn on top of the player.
  var targetX=player.x+game.rnd.integerInRange(-450,450);
  var targetY=player.y+game.rnd.integerInRange(-450,450);
  var theta=Math.atan2(targetY-pos.y,targetX-pos.x);
  a.body.velocity.set(Math.cos(theta)*speed,Math.sin(theta)*speed);
  ast2.push(a);
},
createAst3: function(){
  var scale=game.rnd.realInRange(3,6);
  var base=game.cache.getImage('asteroide3');
  var r=Math.max(base.width,base.height)*scale*0.43;
  var pos=this.worldPosition(r); if(!pos) return;
  var a=this.setupAsteroid(game.add.sprite(pos.x,pos.y,'asteroide3'),3,scale);
  a.hp=Infinity; a.body.mass=1000000;
  a.body.velocity.set(0);
  ast3.push(a);
},
explodeAsteroid: function(a){
  if(!a || !a.alive) return;
  a.kill();
  if(sndExplosion) sndExplosion.play();
},
// Collision response rules. Large impacts destroy both comparable objects;
// small projectiles cannot erase permanent giants.
fastAgainstAsteroid: function(fixed,moving){
  if(!fixed.alive || !moving.alive) return;
  var ratio=moving.radius/fixed.radius;
  if(ratio>=0.90){
    this.explodeAsteroid(moving);
    this.explodeAsteroid(fixed);
  }else{
    this.explodeAsteroid(moving);
  }
},
fastAgainstFast: function(a,b){
  if(!a.alive || !b.alive) return;
  var ratio=Math.min(a.radius,b.radius)/Math.max(a.radius,b.radius);
  if(ratio>=0.85){this.explodeAsteroid(a);this.explodeAsteroid(b);}
  else this.explodeAsteroid(a.radius<b.radius?a:b);
},
fastAgainstPlayer: function(p,a){
  if(gameEnded || !a.alive) return;
  var relative=Math.hypot(a.body.velocity.x-p.body.velocity.x,a.body.velocity.y-p.body.velocity.y);
  var sizeRatio=a.radius/Math.max(p.width,p.height)*2;
  // A giant impact kills instantly. Small impacts cause scaled damage.
  var damage=(sizeRatio>=2 && relative>=90)?maxVida:
             Math.max(3,Math.round(5*Math.pow(Math.max(0.3,sizeRatio),1.6)*Math.max(0.6,relative/350)));
  vida=Math.max(0,vida-damage);
  this.explodeAsteroid(a);
},
updateAsteroids: function(){
  var self=this;
  ast1=ast1.filter(function(a){return a.alive;});
  ast2=ast2.filter(function(a){return a.alive;});
  ast3=ast3.filter(function(a){return a.alive;});
  // The player cannot phase through normal or giant asteroids.
  ast1.forEach(function(a){
    game.physics.arcade.collide(player,a);
    game.physics.arcade.overlap(a,weapon.bullets,function(rock,bullet){
      if(!rock.alive || !bullet.alive)return;
      bullet.kill(); rock.hp--;
      if(rock.hp<=0)self.explodeAsteroid(rock);
    });
  });
  ast3.forEach(function(a){
    game.physics.arcade.collide(player,a);
    // Bullets are absorbed; the rigid giants cannot be shot apart.
    game.physics.arcade.overlap(a,weapon.bullets,function(rock,bullet){bullet.kill();});
  });
  // Moving asteroids collide with every class of asteroid and the ship.
  ast2.forEach(function(a){
    game.physics.arcade.overlap(player,a,function(p,rock){self.fastAgainstPlayer(p,rock);});
    ast1.forEach(function(b){
      game.physics.arcade.overlap(a,b,function(fast,normal){self.fastAgainstAsteroid(normal,fast);});
    });
    ast3.forEach(function(b){
      game.physics.arcade.overlap(a,b,function(fast,giant){self.fastAgainstAsteroid(giant,fast);});
    });
    game.physics.arcade.overlap(a,weapon.bullets,function(rock,bullet){
      if(bullet.alive)bullet.kill();
      // Player shots do not change the meteor's trajectory or size.
    });
  });
  for(var i=0;i<ast2.length;i++)for(var j=i+1;j<ast2.length;j++){
    game.physics.arcade.overlap(ast2[i],ast2[j],function(a,b){self.fastAgainstFast(a,b);});
  }
  // All solid sprites: ship versus enemies, and enemies versus all asteroids.
  var ships=enemies.concat(enemies2,enemies3);
  ships.forEach(function(e){
    if(!e.alive)return;
    game.physics.arcade.collide(player,e);
    ast1.forEach(function(a){game.physics.arcade.collide(e,a);});
    ast3.forEach(function(a){game.physics.arcade.collide(e,a);});
    ast2.forEach(function(a){game.physics.arcade.overlap(e,a,function(ship,rock){
      if(!rock.alive)return;
      if(rock.radius>=Math.max(ship.width,ship.height)*0.45)ship.kill();
      self.explodeAsteroid(rock);
    });});
  });
  for(var x=0;x<ships.length;x++)for(var y=x+1;y<ships.length;y++){
    if(ships[x].alive&&ships[y].alive)game.physics.arcade.collide(ships[x],ships[y]);
  }
  // Nonmoving asteroid collisions and barriers.
  for(var k=0;k<ast1.length;k++){
    ast3.forEach(function(g){game.physics.arcade.collide(ast1[k],g);});
    for(var z=k+1;z<ast1.length;z++)game.physics.arcade.collide(ast1[k],ast1[z]);
  }
  // Remove meteors that have crossed well beyond the local play area.
  ast2.forEach(function(a){
    if(a.alive && Math.hypot(a.x-player.x,a.y-player.y)>4200) a.kill();
  });
},

// ================= INPUT =================

handleInput: function(pointer){
if (gameEnded) return;

let now = Date.now();

if(now - lastTap < 300){
this.fire();
}

lastTap = now;

if(pointer.leftButton && pointer.leftButton.isDown){
this.fire();
}

},

fire: function(){
if (gameEnded) return;
let b = weapon.fire();
if(b) sndLaser.play();
},

// ================= UTIL =================

spawnFueraPantalla: function(){

let side = Math.floor(Math.random()*4);
let margin = 800;

if(side==0) return {x:player.x+2000,y:player.y+game.rnd.integerInRange(-margin,margin)};
if(side==1) return {x:player.x-2000,y:player.y+game.rnd.integerInRange(-margin,margin)};
if(side==2) return {x:player.x+game.rnd.integerInRange(-margin,margin),y:player.y+2000};
return {x:player.x+game.rnd.integerInRange(-margin,margin),y:player.y-2000};

},

// ================= HEALTH PICKUPS =================
spawnHealthOrb: function(){
  if(gameEnded || !player || !player.alive || healthOrbs.filter(function(o){return o.alive;}).length>=2) return;
  var pos=this.peripheralPosition(12);
  if(!pos)return;
  // Tiny, translucent glimmer rather than a solid green ball.
  var orb=game.add.graphics(pos.x,pos.y);
  orb.beginFill(0x44ff88,0.10);orb.drawCircle(0,0,26);orb.endFill();
  orb.beginFill(0x55ffaa,0.30);orb.drawCircle(0,0,12);orb.endFill();
  orb.beginFill(0xdffff0,0.90);orb.drawCircle(0,0,4);orb.endFill();
  orb.lineStyle(1.5,0xaaffcc,0.65);orb.moveTo(-11,0);orb.lineTo(11,0);
  orb.moveTo(0,-11);orb.lineTo(0,11);
  game.physics.arcade.enable(orb);
  orb.body.setSize(16,16,-8,-8);
  orb.expireAt=game.time.now+20000;
  healthOrbs.push(orb);
},
updateHealthOrbs: function(){
  for (var i = healthOrbs.length - 1; i >= 0; i--) {
    var orb = healthOrbs[i];
    if (!orb.alive || game.time.now >= orb.expireAt) {
      orb.destroy(); healthOrbs.splice(i,1); continue;
    }
    game.physics.arcade.overlap(player, orb, function(p, pickup){
      vida = Math.min(maxVida, vida + maxVida * 0.10);
      pickup.destroy();
    }, null, this);
  }
},
// ================= DEAD =================
dead: function(){
  if (gameEnded) return;
  gameEnded = true;
  var seconds = Math.max(0, Math.floor((game.time.now - startTime) / 1000));
  var finalScore = counter;
  var best = VirgoStorage.save(finalScore);
  VirgoResults = {score:finalScore, seconds:seconds, record:best};
  if (music) music.stop();
  game.time.events.removeAll();
  game.input.onDown.removeAll();
  game.state.start('Dead', true, false);
},
shutdown: function(){
  if (music) music.stop();
  if (healthOrbTimer) {game.time.events.remove(healthOrbTimer); healthOrbTimer=null;}
  healthOrbs.forEach(function(orb){if(orb && orb.exists) orb.destroy();});
  healthOrbs=[];
}
};
