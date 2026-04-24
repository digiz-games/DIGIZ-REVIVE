const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, player, camera;

let enemies = [];
let bulletsPlayer = [];

let shooting = false;

// ================= SCENE =================
const createScene = () => {

scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0,0,0,1);

// ===== CÁMARA =====
camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0,0,-10), scene);
camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

let size = 50;
let ratio = engine.getRenderWidth()/engine.getRenderHeight();

camera.orthoLeft = -size * ratio;
camera.orthoRight = size * ratio;
camera.orthoTop = size;
camera.orthoBottom = -size;

camera.inputs.clear();

// ===== LUZ =====
new BABYLON.HemisphericLight("l", new BABYLON.Vector3(0,1,0), scene);

// ===== 🔥 FONDO MOSAICO GRANDE REAL =====
let bg = BABYLON.MeshBuilder.CreatePlane("bg",{size:5000},scene);

let bgMat = new BABYLON.StandardMaterial("bgMat",scene);
let bgTex = new BABYLON.Texture("assets/space_bg.jpg",scene);

// 🔥 CLAVE: textura casi sin repetir → mosaicos gigantes
bgTex.uScale = 0.2;
bgTex.vScale = 0.2;

bgMat.diffuseTexture = bgTex;
bgMat.emissiveTexture = bgTex;
bgMat.disableLighting = true;

bg.material = bgMat;
bg.position.z = 10;

// ===== PLAYER =====
player = createSprite("assets/sprites/nave.png",4);
player.position = BABYLON.Vector3.Zero();

// ===== INPUT =====
scene.onPointerObservable.add((pointerInfo)=>{

if(pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN){
    if(pointerInfo.event.button === 0) shooting = true;
}

if(pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP){
    if(pointerInfo.event.button === 0) shooting = false;
}

});

// ===== LOOP =====
scene.onBeforeRenderObservable.add(()=>{

let dt = engine.getDeltaTime()/1000;

// cámara sigue player
camera.position.x = player.position.x;
camera.position.y = player.position.y;

// fondo sigue player (mosaico infinito)
bg.position.x = player.position.x;
bg.position.y = player.position.y;

// ===== MOVIMIENTO =====
let pick = scene.pick(scene.pointerX, scene.pointerY);

if(pick.hit){

let dir = pick.pickedPoint.subtract(player.position);

if(dir.length() > 0.1){
dir.normalize();
player.position.addInPlace(dir.scale(30 * dt));
player.rotation.z = Math.atan2(dir.y, dir.x);
}

}

// ===== DISPARO =====
if(shooting) shootPlayer();

// UPDATE
updateBullets(dt);
updateEnemies(dt);

});

setInterval(spawnEnemy,1500);

return scene;
};

// ================= SPRITE =================
function createSprite(texture,size){

let m = BABYLON.MeshBuilder.CreatePlane("s",{size},scene);

let mat = new BABYLON.StandardMaterial("mat",scene);
let tex = new BABYLON.Texture(texture,scene);

tex.hasAlpha = true;

// frame 64x64
tex.onLoadObservable.add(()=>{
let frame = 64;
tex.uScale = frame / tex.getSize().width;
tex.vScale = frame / tex.getSize().height;
});

mat.diffuseTexture = tex;
mat.emissiveColor = new BABYLON.Color3(1,1,1);

mat.backFaceCulling = false;
mat.disableDepthWrite = true;

m.material = mat;
m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

return m;
}

// ================= PLAYER =================
function shootPlayer(){

if(!shootPlayer.last) shootPlayer.last = 0;
if(Date.now() - shootPlayer.last < 120) return;

let pick = scene.pick(scene.pointerX, scene.pointerY);
if(!pick.hit) return;

shootPlayer.last = Date.now();

let b = createSprite("assets/sprites/laser.png",1);
b.position = player.position.clone();

// 🔥 dirección REAL
b.dir = pick.pickedPoint.subtract(player.position).normalize();

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

enemies.push(e);
}

function updateEnemies(dt){

for(let i = enemies.length-1; i>=0; i--){

let e = enemies[i];

// movimiento
let dir = player.position.subtract(e.position).normalize();
e.position.addInPlace(dir.scale(10*dt));

// 🔥 COLISIÓN REAL (radio correcto)
for(let j = bulletsPlayer.length-1; j>=0; j--){

let b = bulletsPlayer[j];

// radio basado en tamaño real
let hitDist = 2.5;

if(BABYLON.Vector3.Distance(e.position, b.position) < hitDist){

b.dispose();
bulletsPlayer.splice(j,1);

e.dispose();
enemies.splice(i,1);

break;
}

}

}

}

// ================= BULLETS =================
function updateBullets(dt){

for(let i = bulletsPlayer.length-1; i>=0; i--){

let b = bulletsPlayer[i];

b.position.addInPlace(b.dir.scale(60*dt));

if(BABYLON.Vector3.Distance(player.position,b.position)>150){
b.dispose();
bulletsPlayer.splice(i,1);
}

}

}

// ================= UTILS =================
function spawnOutside(){

let d = 80;

return {
x: player.position.x + (Math.random()*d - d/2),
y: player.position.y + 80
};

}

// ================= INIT =================
scene = createScene();

engine.runRenderLoop(()=> scene.render());
window.addEventListener("resize",()=>engine.resize());
