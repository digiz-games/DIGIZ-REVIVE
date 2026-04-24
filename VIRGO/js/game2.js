const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, player, camera, ui;

let enemies1 = [], enemies2 = [], enemies3 = [];
let bulletsPlayer = [], bulletsEnemy = [];
let ast1 = [], ast2 = [], ast3 = [];

let vida = 200, maxVida = 200;
let score = 0;
let lastFire = 0;

// ================= SCENE =================
const createScene = () => {

scene = new BABYLON.Scene(engine);

// ===== CÁMARA 2D =====
camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0,0,-10), scene);
camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

let ratio = engine.getRenderWidth()/engine.getRenderHeight();
let size = 50;

camera.orthoLeft = -size * ratio;
camera.orthoRight = size * ratio;
camera.orthoTop = size;
camera.orthoBottom = -size;

// ===== LUZ =====
new BABYLON.HemisphericLight("l", new BABYLON.Vector3(0,1,0), scene);

// ===== FONDO =====
let bg = BABYLON.MeshBuilder.CreatePlane("bg",{size:200},scene);
let bgMat = new BABYLON.StandardMaterial("bgMat",scene);

bgMat.diffuseTexture = new BABYLON.Texture("assets/space_bg.jpg",scene);
bgMat.emissiveTexture = bgMat.diffuseTexture;
bgMat.disableLighting = true;

bg.material = bgMat;
bg.position.z = 5;
bg.isPickable = false;
bg.renderingGroupId = 0;

// ===== PLAYER =====
player = createSprite("assets/sprites/nave.png",4);
player.position = new BABYLON.Vector3(0,0,0);

camera.lockedTarget = player;

// ===== INPUT =====
let pointerDown = false;

scene.onPointerDown = ()=> pointerDown = true;
scene.onPointerUp = ()=> pointerDown = false;

// ===== UI =====
createUI();

// ===== LOOP =====
scene.onBeforeRenderObservable.add(()=>{

let dt = engine.getDeltaTime()/1000;

// MOVIMIENTO
if(pointerDown){
let target = getMouseWorld();
let dir = target.subtract(player.position).normalize();
player.position.addInPlace(dir.scale(25*dt));
}

// DISPARO
if(Date.now() - lastFire > 120){
shootPlayer();
lastFire = Date.now();
}

// UPDATE
updateBullets(dt);
updateEnemies(dt);
updateAsteroids(dt);
updateUI();

});

// SPAWN
setInterval(spawnEnemy,1500);
setInterval(spawnAsteroids,700);

return scene;
};

// ================= SPRITE =================
function createSprite(texture,size){

let m = BABYLON.MeshBuilder.CreatePlane("s",{size},scene);

let mat = new BABYLON.StandardMaterial("mat",scene);
mat.diffuseTexture = new BABYLON.Texture(texture,scene);
mat.diffuseTexture.hasAlpha = true;

mat.emissiveColor = new BABYLON.Color3(1,1,1);
mat.backFaceCulling = false;
mat.disableDepthWrite = true;

m.material = mat;
m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
m.renderingGroupId = 1;

return m;
}

// ================= INPUT =================
function getMouseWorld(){
let x = (scene.pointerX / engine.getRenderWidth()) * 100 - 50;
let y = -(scene.pointerY / engine.getRenderHeight()) * 100 + 50;
return new BABYLON.Vector3(x,y,0);
}

// ================= PLAYER =================
function shootPlayer(){
let b = createSprite("assets/sprites/laser.png",1);
b.position = player.position.clone();
b.position.z = -1;

b.dir = getMouseWorld().subtract(player.position).normalize();

bulletsPlayer.push(b);
}

// ================= ENEMIES =================
function spawnEnemy(){
let p = spawnOutside();
createEnemy(1,p.x,p.y);
}

function createEnemy(type,x,y){

let tex = type==1?"enemy":type==2?"enemy2":"enemy3";

let e = createSprite(`assets/sprites/${tex}.png`, type==3?8:4);
e.position = new BABYLON.Vector3(x,y,0);

e.hp = type==1?1:type==2?3:5;
e.type = type;
e.lastFire = 0;

if(type==1) enemies1.push(e);
if(type==2) enemies2.push(e);
if(type==3) enemies3.push(e);
}

function updateEnemies(dt){

[enemies1,enemies2,enemies3].forEach(list=>{
list.forEach((e,i)=>{

let dir = player.position.subtract(e.position).normalize();
let speed = e.type==1?12:e.type==2?20:6;

e.position.addInPlace(dir.scale(speed*dt));

// DISPARO
if(Date.now()-e.lastFire > (e.type==3?2000:1000)){

if(e.type==3){
for(let a=0;a<360;a+=30){
let b = createSprite("assets/sprites/laser3.png",1);
b.position = e.position.clone();
b.position.z = -1;

b.dir = new BABYLON.Vector3(
Math.cos(a*Math.PI/180),
Math.sin(a*Math.PI/180),
0
);

bulletsEnemy.push(b);
}
}else{
let b = createSprite(`assets/sprites/laser${e.type}.png`,1);
b.position = e.position.clone();
b.position.z = -1;

b.dir = player.position.subtract(e.position).normalize();
bulletsEnemy.push(b);
}

e.lastFire = Date.now();
}

// HIT
bulletsPlayer.forEach((b,bi)=>{
if(dist(e,b)<2){
b.dispose();
bulletsPlayer.splice(bi,1);

e.hp--;
if(e.hp<=0){
e.dispose();
list.splice(i,1);
score++;

if(e.type==1 && score%3==0){
let p = spawnOutside();
createEnemy(2,p.x,p.y);
}
if(e.type==2 && score%6==0){
let p = spawnOutside();
createEnemy(3,p.x,p.y);
}
if(e.type==3){
vida = Math.min(maxVida, vida*2);
}
}
}
});

});
});

// HIT PLAYER
bulletsEnemy.forEach((b,bi)=>{
if(dist(player,b)<2){
vida -= 10;
b.dispose();
bulletsEnemy.splice(bi,1);
}
});
}

// ================= ASTEROIDES =================
function spawnAsteroids(){
let r = Math.random();

if(r<0.6) createAst1();
else if(r<0.85) createAst2();
else createAst3();
}

function createAst1(){
let p = spawnOutside();
let a = createSprite("assets/sprites/asteroide.png",3);
a.position = new BABYLON.Vector3(p.x,p.y,0);
a.hp = 3;
ast1.push(a);
}

function createAst2(){
let p = spawnOutside();
let a = createSprite("assets/sprites/asteroide2.png",2);
a.position = new BABYLON.Vector3(p.x,p.y,0);
a.vel = new BABYLON.Vector3(Math.random()*2-1,Math.random()*2-1,0).scale(20);
ast2.push(a);
}

function createAst3(){
let p = spawnOutside();
let a = createSprite("assets/sprites/asteroide3.png",6);
a.position = new BABYLON.Vector3(p.x,p.y,0);
a.hp = 20;
ast3.push(a);
}

function updateAsteroids(dt){

ast2.forEach((a,i)=>{
a.position.addInPlace(a.vel.scale(dt));
if(dist(player,a)<3){
vida -= 5;
a.dispose();
ast2.splice(i,1);
}
});

ast1.forEach((a,i)=>{
bulletsPlayer.forEach((b,bi)=>{
if(dist(a,b)<2){
a.hp--;
b.dispose();
bulletsPlayer.splice(bi,1);
if(a.hp<=0){
a.dispose();
ast1.splice(i,1);
}
}
});
});

ast3.forEach((a,i)=>{
bulletsPlayer.forEach((b,bi)=>{
if(dist(a,b)<2){
a.hp--;
b.dispose();
bulletsPlayer.splice(bi,1);
if(a.hp<=0){
a.dispose();
ast3.splice(i,1);
}
}
});
});

}

// ================= UI =================
function createUI(){
ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui");

let text = new BABYLON.GUI.TextBlock();
text.name = "score";
text.color = "white";
text.fontSize = 24;
text.top = "-45%";
text.left = "-45%";
text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

ui.addControl(text);

let vidaBar = new BABYLON.GUI.Rectangle();
vidaBar.height = "10px";
vidaBar.width = "200px";
vidaBar.background = "red";
vidaBar.top = "-40%";
vidaBar.left = "-45%";
vidaBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

ui.addControl(vidaBar);

ui.score = text;
ui.vidaBar = vidaBar;
}

function updateUI(){
ui.score.text = "Score: " + score;
ui.vidaBar.width = (200 * (vida/maxVida)) + "px";
}

// ================= UTILS =================
function dist(a,b){
return BABYLON.Vector3.Distance(a.position,b.position);
}

function updateBullets(dt){

[bulletsPlayer,bulletsEnemy].forEach(list=>{
list.forEach((b,i)=>{
b.position.addInPlace(b.dir.scale(60*dt));

if(BABYLON.Vector3.Distance(player.position,b.position)>120){
b.dispose();
list.splice(i,1);
}
});
});
}

function spawnOutside(){

let side = Math.floor(Math.random()*4);
let d = 80;

if(side==0) return {x:player.position.x+80,y:player.position.y+(Math.random()*d-d/2)};
if(side==1) return {x:player.position.x-80,y:player.position.y+(Math.random()*d-d/2)};
if(side==2) return {x:player.position.x+(Math.random()*d-d/2),y:player.position.y+80};
return {x:player.position.x+(Math.random()*d-d/2),y:player.position.y-80};
}

// ================= INIT =================
scene = createScene();

engine.runRenderLoop(()=> scene.render());
window.addEventListener("resize",()=>engine.resize());
