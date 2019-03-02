/*
 *** CAMP FIRE SCENE CAPTURE ***
 */

//console.clear();
console.log('CAMP SCENE -> INIT');

var clock = new THREE.Clock();
var scene, camera, renderer, orbit, light;

scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x242426, 20, 400);

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 400);
//camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000); //if no scale.set(50, 60, 50);

//camera.position.x = 30; //default
//camera.position.y = 50; //default
//camera.position.z = 100; //default

camera.position.x = 45;
camera.position.y = 15;
camera.position.z = 80; //side to side, up / down, depth (more = closer)

camera.updateProjectionMatrix();

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x242426);
renderer.toneMapping = THREE.LinearToneMapping;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

document.body.appendChild(renderer.domElement);

// *** CONTROLS *** //

orbit = new THREE.OrbitControls(camera, renderer.domElement);
orbit.enableZoom = true;
orbit.enablePan = false;

orbit.rotateSpeed = 0.3;
orbit.zoomSpeed = 0.3;

//orbit.autoRotate = true;
orbit.autoRotate = false;
orbit.autoRotateSpeed = 0.6;

//orbit.minPolarAngle = Math.PI * 0.3; //looking down
//orbit.maxPolarAngle = Math.PI * 0.45; //can't look up?
//orbit.maxPolarAngle = Math.PI * 0.65; //looking up
orbit.maxPolarAngle = Math.PI * 0.50; //looking up

//orbit.minAzimuthAngle = -Math.PI * 0.2; // radians
//orbit.maxAzimuthAngle = Math.PI * 0.2; // radians

orbit.minDistance = 40;
orbit.maxDistance = 300;

orbit.target.set(0, 5, 0);
orbit.update();


function makeSprite() {

    let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    let spriteSize = 4;
    canvas.width = canvas.height = spriteSize * 2;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(spriteSize, spriteSize, spriteSize, 0, TWOPI, true);
    ctx.fill();

    let sprite = new THREE.Texture(canvas);
    sprite.needsUpdate = true;

    return sprite;
}

// *** LIGHTING *** //
var ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

let hemiLight = new THREE.HemisphereLight(0xEBF7FD, 0xEBF7FD, 0.2);
//hemiLight.color.setRGB(0.75,0.8,0.95);
hemiLight.position.set(0, 100, 0);
scene.add(hemiLight);

// *** CANVAS MAPPING *** //
function noiseMap(size, intensity) {
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        width = canvas.width = size || 512,
        height = canvas.height = size || 512;

    intensity = intensity || 120;

    var imageData = ctx.getImageData(0, 0, width, height),
        pixels = imageData.data,
        n = pixels.length,
        i = 0;

    while (i < n) {
        pixels[i++] = pixels[i++] = pixels[i++] = Math.sin(i * i * i + (i / n) * Math.PI) * intensity;
        pixels[i++] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    let sprite = new THREE.Texture(canvas);
    sprite.needsUpdate = true;

    return sprite;
}

let noise = noiseMap(512, 60);

// *** INIT LIGHT *** //

//var gui = new dat.GUI();
//let l = 0;
function makeLight(color) {
    var light = new THREE.PointLight(color || 0xFFFFFF, 1, 0);

    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 120;
    light.shadow.bias = 0.9;
    light.shadow.radius = 5;

    light.power = 9;

    // var sphereSize = 20;
    // var pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
    //light.add( pointLightHelper ); //err: not defined

    return light;
}

function Flame(color) {

    THREE.Group.apply(this, arguments);

    this.light = makeLight(color);

    this.light.position.y += 7;
    this.add(this.light);

    let geometry = new THREE.CylinderGeometry(0, 8, 8, 3); //new THREE.BoxGeometry(10,10,10);
    let material = new THREE.MeshPhongMaterial({
        color: color,
        //specular: 0x009900,
        shininess: 550,
        emissive: color,
        transparent: true,
        opacity: 0.4,
        shading: THREE.FlatShading
    });

    let flame = new THREE.Mesh(geometry, material);

    this.flame = flame;

    this.add(flame);

    this.scale.y = 2;

    this.flicker(this.flicker);

}

Flame.prototype = Object.assign(THREE.Group.prototype, {
    constructor: Flame,

    flicker(onComplete) {

        let speed = 0.1 + Math.random() * 0.1;
        let ease = RoughEase.ease.config({
            template: Power2.easeInOut,
            strength: 0.3,
            points: 10,
            taper: "none",
            randomize: true,
            clamp: true
        });

        var tl = new TimelineMax({
            onComplete: function () { this.reverse() },
            onReverseComplete: onComplete,
            onReverseCompleteScope: this,
            onReverseCompleteParams: [onComplete]
        });


        let scale = 2 + Math.random() * 2
        tl.to(this.scale, speed, {
            y: scale,
            ease: ease,
        });
        tl.to(this.position, speed, {
            y: '+=' + (scale * 1.5),
            ease: ease,
        });

        // tl.to(this.rotation, speed, {
        //   x: (Math.PI / 4) * (Math.random() - 0.5),
        //   //y: (Math.PI / 6) * (Math.random() - 0.5),
        //   //z: (Math.PI / 5) * (Math.random() - 0.5),
        //   ease: ease,
        // });

        tl.to(this.light, speed, {
            power: 8 + 9 * Math.random(),
            ease: ease,
        });
    }
});

// fire = new Fire();
// fire.position.y = 10;

let colors = [0xdb2902, 0xfb4402];
const TWOPI = Math.PI * 2;
const HALFPI = Math.PI / 2;
let flames = Array(5).fill(null);
flames.forEach((flame, i) => {

    flame = new Flame(colors[Math.floor(colors.length * Math.random())]);

    flame.position.z = 9 * Math.cos((i / flames.length) * TWOPI) + Math.sin(Math.random());
    flame.position.x = 9 * Math.sin((i / flames.length) * TWOPI) + Math.sin(Math.random());
    flame.position.y = 14;
    scene.add(flame);
});

// *** FIRE PARTICLES *** //

let fire;
let fireParticles;

function makeFireParticles() {

    let pointGeometry = new THREE.Geometry();

    for (i = 0; i < 20; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 16 - 8;
        vertex.y = Math.random() * 60;
        vertex.z = Math.random() * 16 - 8;
        vertex._maxHeight = 50 + Math.random() * 10;
        vertex._speed = 0.1 + Math.random() * 0.1;
        pointGeometry.vertices.push(vertex);
    }

    pointGeometry.verticesNeedUpdate = true;
    pointGeometry.normalsNeedUpdate = true;
    pointGeometry.computeFaceNormals();

    let pointMaterial = new THREE.PointsMaterial({
        //size: 16, 
        color: 0xFF0000,
        map: makeSprite(),
        blending: THREE.AdditiveBlending,
        depthTest: true,
        transparent: true,
        opacity: 0.4,
    });

    let particles = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(particles);

    let count = 0;
    return function () {
        count += 0.01;
        particles.geometry.vertices.forEach((vertex, i) => {
            vertex.x += Math.sin(count * 1.5 + i) * 0.1;
            vertex.z += Math.cos(count * 1.5 + i) * 0.1;
            vertex.y += vertex._speed;
            if (vertex.y > vertex._maxHeight) { vertex.y = 0; }
        });
        particles.geometry.verticesNeedUpdate = true;
    }
}
fireParticles = makeFireParticles();


// *** CAMP FIRE LOGS *** //

let logMaterial = new THREE.MeshPhongMaterial({
    color: 0x5C2626,
    shininess: 10,
    shading: THREE.FlatShading
});

let logEndMaterial = new THREE.MeshPhongMaterial({
    color: 0xF9F5CE,
    shininess: 10,
    shading: THREE.FlatShading
});

function Log() {

    let geometry = new THREE.BoxGeometry(10, 10, 40);

    THREE.Mesh.call(this, geometry, logMaterial);


    let endGeometry = new THREE.BoxGeometry(7, 7, 0.5);
    let end = new THREE.Mesh(endGeometry, logEndMaterial);
    end.position.z = 20;
    this.add(end);

    let otherEnd = new THREE.Mesh(endGeometry, logEndMaterial);
    otherEnd.position.z = -20;
    this.add(otherEnd);
    //let otherEnd = end.clone();

    //   otherEnd.position.z = -20;

    //   this.add(end, otherEnd);

    this.castShadow = true;
    this.receiveShadow = true;
}

Log.prototype = Object.assign(THREE.Mesh.prototype, {
    constructor: Log
});

let logs = Array(3).fill(null);
logs.forEach((log, i) => {
    log = new Log();
    //log.position.z = 15 * Math.cos((i / logs.length) * TWOPI);
    log.position.x = 15 * Math.sin((i / logs.length) * TWOPI) + Math.sin(Math.random());
    log.position.y = 5;
    log.position.z = 1;

    log.rotation.z = HALFPI / 2;// * Math.sin(i+1);
    //log.rotation.y = HALFPI / 2 * Math.cos((i / logs.length) * TWOPI);

    //console.log({log});
    scene.add(log);
});
//console.log('logs -> position', logs);

// *** GROUND *** //
function snowyGround() {

    let geometry = new THREE.PlaneGeometry(500, 500, 22, 12);
    for (let i = 0; i < geometry.vertices.length; i++) {
        //geometry.vertices[i].x += (Math.cos( i * i )+1/2); 
        //geometry.vertices[i].y += (Math.cos(i )+1/2); 
        geometry.vertices[i].z = (Math.sin(i * i * i) + 1 / 2) * 3;
    }
    geometry.verticesNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.computeFaceNormals();

    let material = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        shininess: 60,
        //metalness: 1,
        //specularMap: noiseMap(512,255),
        bumpMap: noise,
        bumpScale: 0.025,
        //emissive: 0xEBF7FD,
        //emissiveIntensity: 0.05,
        shading: THREE.SmoothShading
    });

    let plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / -2;
    plane.receiveShadow = true;
    plane.position.y = -5;

    return plane;

}
scene.add(snowyGround());

// *** TREES *** //
let treeMaterial = new THREE.MeshPhongMaterial({
    color: 0x2C9E4B,
    shininess: 20,
    //bumpMap: noiseMap(256, 5),
    //bumpScale: 0.5,
    side: THREE.FrontSide,
    shading: THREE.SmoothShading
});

function Cone(size, translate) {
    size = size || 10;

    this.geometry = new THREE.CylinderGeometry(size / 2, size, size, 6);
    if (translate) {
        this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, size, 0));
    }
    THREE.Mesh.call(this, this.geometry, treeMaterial);
}

Cone.prototype = Object.assign(THREE.Mesh.prototype, {
    constructor: Cone,
});

function Tree(size) {

    size = size || 6 + Math.random();

    THREE.Object3D.call(this);

    let lastCone;
    let cone;

    for (let i = 0; i < size; i++) {
        cone = new Cone((size - i) + 1, i);
        cone.position.y = 0;
        if (lastCone) {
            let box = new THREE.Box3().setFromObject(lastCone);
            cone.position.y = (box.max.y + box.min.y) / 2;
        } else {
            cone.position.y += 2;
        }
        lastCone = cone;
        cone.castShadow = true;
        cone.receiveShadow = true;
        this.add(cone);
    }

};

Tree.prototype = Object.assign(THREE.Object3D.prototype, {
    constructor: Tree,
});

let trees = [];

for (let i = 0; i < 24;) {

    let tree = new Tree;
    tree.scale.set(3.25, 3.25, 3.25);

    tree.position.x = Math.sin(i + Math.random() * 0.2) * 200;//(treeCount/2 - i) * 30;
    tree.position.z = Math.cos(i + Math.random() * 0.1) * 260;
    trees.push(tree);
    scene.add(tree);

    i++; //= Math.random() * 1.2;
}

// *** FALLING SNOW *** //

function pointsParticles() {

    let pointGeometry = new THREE.Geometry();

    for (i = 0; i < 120; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 200 - 100;
        vertex.y = Math.random() * 100;
        vertex.z = Math.random() * 200 - 100;
        pointGeometry.vertices.push(vertex);
    }

    pointGeometry.verticesNeedUpdate = true;
    pointGeometry.normalsNeedUpdate = true;
    pointGeometry.computeFaceNormals();

    let pointMaterial = new THREE.PointsMaterial({
        //size: 16, 
        map: makeSprite(),
        blending: THREE.AdditiveBlending,
        depthTest: true,
        transparent: true,
        opacity: 0.2,
    });

    let particles = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(particles);
    //console.log(particles.geometry);

    let count = 0;
    return function () {
        count += 0.01;
        particles.geometry.vertices.forEach((vertex, i) => {
            vertex.x += Math.sin(count + i) * 0.05;
            vertex.z += Math.cos(count + i) * 0.05;
            vertex.y -= 0.2;
            if (vertex.y < 0) { vertex.y = 100; }
        });
        particles.geometry.verticesNeedUpdate = true;
    }
}
let updateParticles;
updateParticles = pointsParticles();

// *** VOLUMETRIC FIRE *** //

//VolumetricFire.texturePath = '/fire-temple/assets/textures/flame/';
//VolumetricFire.texturePath = '../../assets/textures/flame/'; //err: 404
//var volumetricFire = new VolumetricFire( fireWidth, fireHeight, fireDepth, sliceSpacing, camera );
//volumetricFire.mesh.position.set(0.2, 8, 1); //{x: 0.21396826794326645, y: 5, z: 1}

var loader = new THREE.TextureLoader();
loader.crossOrigin = '';

//var fireTex = loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/212131/Fire.png");
//var fireTex = loader.load("/fire-temple/assets/textures/flame/FireTexture-640.png");
var fireTex = loader.load("/fire-temple/assets/textures/flame/FireOrig.png");

var wireframeMat = new THREE.MeshBasicMaterial({
    color : new THREE.Color(0xffffff),
    wireframe : true
});
//https://stackoverflow.com/questions/24723471/three-js-scale-model-with-scale-set-or-increase-model-size

//http://mattatz.github.io/THREE.Fire/
volumetricFire = new THREE.Fire(fireTex);

var fireUniforms = volumetricFire.material.uniforms;
console.log({fireUniforms});
//DEFAULTS:
// gain: {type: "f", value: 0.5}
// invModelMatrix: {type: "m4", value: K}
// lacunarity: {type: "f", value: 2}
// magnitude: {type: "f", value: 1.3}
// noiseScale: {type: "v4", value: fa}

//volumetricFire.material.uniforms.magnitude.value = 0.7;
volumetricFire.material.uniforms.magnitude.value = 0.5; //higher = spaciness
//volumetricFire.material.uniforms.lacunarity.value = 1.0; //higher = more grainy
volumetricFire.material.uniforms.lacunarity.value = 0.1;   //lower = more cartoony
//volumetricFire.material.uniforms.lacunarity.value = 3.0;   //lower = more cartoony
volumetricFire.material.uniforms.lacunarity.gain = 0.1;     //more = less height
//volumetricFire.material.uniforms.noiseScale.value.x = 2.5; //num of fires horiz

//volumetricFire.scale.set(50, 50, 50); //too short
volumetricFire.scale.set(50, 65, 50); //width, height, z

var wireframe = new THREE.Mesh(volumetricFire.geometry, wireframeMat.clone());
volumetricFire.add(wireframe);
wireframe.visible = false;
//wireframe.visible = true;

//volumetricFire.position.set(0.2, 5, 1); //{x: 0.21396826794326645, y: 5, z: 1}
//volumetricFire.position.set(0, 35, -1); //side to side, up / down, depth (more = closer)
volumetricFire.position.set(0, 40, -1); //side to side, up / down, depth (more = closer)
//volumetricFire.position.set(0, 0, 0);

scene.add(volumetricFire);
console.log({volumetricFire});
console.log({camera});

///////////////////////////////////
// *** RENDERER - ANIMATION  *** //
///////////////////////////////////

renderer.gammaInput = true;
renderer.gammaOutput = true;

var lastRender = 0;
let count = 3;
function render(timestamp) {
    //var delta = clock.getDelta();
    var delta = Math.min(timestamp - lastRender, 500);
    lastRender = timestamp;

    //var flameRate = clock.getElapsedTime(); //too slow
    //var flameRate = timestamp; //too fast
    //var flameRate = delta * 0.006; //too jittery
    var flameRate = clock.getElapsedTime() * 2.0;
    //console.log({flameRate});

    volumetricFire.update(flameRate);
    //volumetricFire.mesh.rotation.y += delta * 0.0006;

    //console.log({delta});

    requestAnimationFrame(render);
    count += 0.03;

    orbit.update();

    if (updateParticles) { updateParticles(count); }
    if (fireParticles) { fireParticles(count); }
    if (fire && fire.flicker) { fire.flicker(count); }

    // scene.traverse( (child) => {
    //   if ( child.material ) { child.material.needsUpdate = true; }
    // });

    renderer.toneMappingExposure = Math.pow(0.91, 5.0);

    renderer.render(scene, camera);


};

render();
