/*
 *** CAMP FIRE SCENE CAPTURE ***
 */

//console.clear();
console.log('CAMP SCENE -> INIT');

var scene, camera, renderer, orbit, light;

scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x242426, 20, 400);

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 400);
camera.position.z = 100;
camera.position.y = 50;
camera.position.x = 30;
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

//orbit.minPolarAngle = Math.PI * 0.3;
orbit.maxPolarAngle = Math.PI * 0.45;

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
    // light.add( pointLightHelper );

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
    scene.add(log);
});

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
    console.log(particles.geometry);

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

// *** RENDERER - ANIMATION  *** //

renderer.gammaInput = true;
renderer.gammaOutput = true;

let count = 3;
function render() {

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
