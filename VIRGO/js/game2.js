const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, player, camera, ui;

let enemies = [];
let bulletsPlayer = [], bulletsEnemy = [];

let vida = 200, maxVida = 200;
let score = 0;

let lastFire = 0;
let moving = false;

// ================= SCENE =================
const createScene = () => {

scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0,0,0,1);

// ===== CÁMARA 2D =====
camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0,0,-10), scene);
camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

let ratio = engine.getRenderWidth()/engine.getRenderHeight();
let size = 50;

camera.orthoLeft = -size * ratio;
camera.orthoRight = size * ratio;
camera.orthoTop = size;
camera.orthoBottom = -size;

camera.inputs.clear();

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

// ===== PLAYER =====
player = createSprite("assets/sprites/nave.png",4);
player.position = new BABYLON.Vector3(0,0,0);

// ===== INPUT =====
scene.onPointerObservable.add((pointerInfo)=>{

switch(pointerInfo.type){

case BABYLON.PointerEventTypes.POINTERDOWN:
    moving = true;
    shootPlayer(); // dispara solo al hacer click
break;

case BABYLON.PointerEventTypes.POINTERUP:
    moving = false;
break;

}

});

// ===== UI =====
createUI();

// ===== LOOP =====
scene.onBeforeRenderObservable.add(()=>{

let dt = engine.getDeltaTime()/1000;

// cámara sigue al player
camera.position.x = player.position.x;
camera.position.y = player.position.y;

// MOVIMIENTO
if(moving){
let target = getMouseWorld();
let dir = target.subtract(player.position).normalize();
player.position.addInPlace(dir.scale(25*dt));
}

// ROTACIÓN
let mouse = getMouseWorld();
let dirRot = mouse.subtract(player.position);

if(dirRot.length() > 0.1){
player.rotation.z = Math.atan2(dirRot.y, dirRot.x);
}

// UPDATE
updateBullets(dt);
updateEnemies(dt);
updateUI();

});

setInterval(spawnEnemy,1500);

return scene;
};

// ================= SPRITE =================
function createSprite(texture,size){

let m = BABYLON.MeshBuilder.CreatePlane("s",{size},scene);

let mat = new BABYLON.StandardMaterial("mat",scene);

let tex = new BABYLON.Texture(
texture,
scene,
false,
false,
BABYLON.Texture.NEAREST_SAMPLINGMODE,
()=>{

let frameSize = 64;
let texW = tex.getSize().width;
let texH = tex.getSize().height;

tex.uScale = frameSize / texW;
tex.vScale = frameSize / texH;

}
);

tex.hasAlpha = true;

mat.diffuseTexture = tex;
mat.emissiveColor = new BABYLON.Color3(1,1,1);

mat.backFaceCulling = false;
mat.disableDepthWrite = true;

m.material = mat;
m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

return m;
}

// ================= MOUSE REAL =================
function getMouseWorld(){

let pick = scene.pick(scene.pointerX, scene.pointerY);

if(pick.hit){
return pick.pickedPoint;
}

return player.position.clone();
}

// ================= PLAYER =================
function shootPlayer(){

if(Date.now() - lastFire < 120) return;
lastFire = Date.now();

let b = createSprite("assets/sprites/laser.png",1);
b.position = player.position.clone();
b.position.z = -1;

b.dir = getMouseWorld().subtract(player.position).normalize();

bulletsPlayer.push(b);
}

// ================= ENEMIES =================
function spawnEnemy(){
let p = spawnOutside();
createEnemy(p.x,p.y);
}

function createEnemy(x,y){

let e = createSprite("assets/sprites/enemy.png",4);
e.position = new BABYLON.Vector3(x,y,0);

e.hp = 1;
e.lastFire = 0;

enemies.push(e);
}

function updateEnemies(dt){

enemies.forEach((e,i)=>{

let dir = player.position.subtract(e.position).normalize();
e.position.addInPlace(dir.scale(12*dt));

// disparo enemigo
if(Date.now()-e.lastFire > 1000){

let b = createSprite("assets/sprites/laser1.png",1);
b.position = e.position.clone();
b.position.z = -1;

b.dir = player.position.subtract(e.position).normalize();

bulletsEnemy.push(b);

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
enemies.splice(i,1);
score++;
}

}
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

// ================= UI =================
function createUI(){

ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui");

let text = new BABYLON.GUI.TextBlock();
text.color = "white";
text.fontSize = 24;
text.top = "-45%";
text.left = "-45%";

ui.addControl(text);
ui.score = text;
}

function updateUI(){
ui.score.text = "Score: " + score;
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

let px = player.position.x;
let py = player.position.y;

if(side==0) return {x:px+80,y:py+(Math.random()*d-d/2)};
if(side==1) return {x:px-80,y:py+(Math.random()*d-d/2)};
if(side==2) return {x:px+(Math.random()*d-d/2),y:py+80};
return {x:px+(Math.random()*d-d/2),y:py-80};

}

// ================= INIT =================
scene = createScene();

engine.runRenderLoop(()=> scene.render());
window.addEventListener("resize",()=>engine.resize());
