/*
 *** CUSTOM JS ***
*/

// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

var clock = new THREE.Clock();
var scene = new THREE.Scene();

// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

var controls = new THREE.VRControls(camera);
controls.standing = true; //raise user above ground

/*** VR Controls ***/
// Create VRControls in addition to FirstPersonVRControls.
var vrControls = new THREE.VRControls(camera);
//vrControls.standing = true;
var fpVrControls = new THREE.FirstPersonVRControls(camera, scene);
fpVrControls.verticalMovement = true;
fpVrControls.movementSpeed = 10;

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);


// Add a repeating grid as a skybox.
var boxSize = 40;
var loader = new THREE.TextureLoader();
loader.load('img/box.png', onTextureLoaded);
var dirt_texture = new THREE.TextureLoader().load( "assets/textures/dirt.png" );

function onTextureLoaded(texture) {

  var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  var material = new THREE.MeshBasicMaterial({
    map: dirt_texture,
    //map: texture,
    color: 0x01BE00,
    //side: THREE.BackSide //inside 
    //side: THREE.FrontSide //outside
    side: THREE.DoubleSide //both
  });

  // Align the skybox to the floor (which is at y=0).
  skybox = new THREE.Mesh(geometry, material);
  //skybox.position.y = boxSize/2;
  skybox.position.y = 2.5; //grid box way above
  //scene.add(skybox);

  setupStage(); // For high end VR devices like Vive and Oculus, take into account the stage parameters provided.
}

///////////
// FLOOR //
///////////
//var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/ground.png' );
var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/cracks.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 1, 1 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(60, 100, 1, 1); // e/w, n/s
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
//floor.position.y = -4.8; //lower = floor lowers
floor.position.y = -6;
floor.rotation.x = Math.PI / 2; // 1.57
scene.add(floor);

///////////
// WALL //
///////////
var wall_y_pos = -2.3;
var wallTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/wall.png' );
wallTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
wallTexture.repeat.set( 1, 1 );
var wallMaterial = new THREE.MeshBasicMaterial( { map: wallTexture, side: THREE.DoubleSide } );
var wallGeometry = new THREE.PlaneGeometry(100, 40, 1, 1); // e/w, n/s

var brickTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/brick-wall.jpg' );
brickTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
brickTexture.repeat.set( 1, 1 );
var brickMaterial = new THREE.MeshBasicMaterial( { map: brickTexture, side: THREE.DoubleSide } );
var brickGeometry = new THREE.PlaneGeometry(80, 50, 1, 1);

var wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
var wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
var wall3 = new THREE.Mesh(brickGeometry, brickMaterial);
var wall4 = new THREE.Mesh(brickGeometry, brickMaterial);
var wall5 = new THREE.Mesh(brickGeometry, brickMaterial);
//floor.position.y = -0.5;

/* Front Wall */
wall1.position.x = 0;
wall1.position.y = wall_y_pos; //up down
wall1.position.z = -15; //further away
var wall_rotation = 0.01;
//wall1.rotation.x = wall_rotation;
//scene.add(wall1);

/* Back Wall */
wall2.position.x = 0;
wall2.position.y = wall_y_pos;
wall2.position.z = 15;
scene.add(wall2);

/* Left Side Wall */
wall3.position.set(-30, 5, 0);
wall3.rotation.y = Math.PI / 2;
scene.add(wall3);

/* Right Side Wall */
wall4.position.set(30, 5, 0);
wall4.rotation.y = Math.PI / 2;
scene.add(wall4);
//console.log(wall4);

// Create a VR manager helper to enter and exit VR mode.
var params = {
  hideButton: false, // Default: false.
  isUndistorted: false // Default: false.
};
var manager = new WebVRManager(renderer, effect, params);

/////////////
// OBJECTS //
/////////////
// Create 3D objects.
var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(geometry, material);
var sign = new THREE.Mesh(geometry, material);
//cube.position.set(0, controls.userHeight, -1);
cube.position.set(0, 3.5, -1); //move cube higher
sign.position.set(-4.75, 0.25, -4.75); //left-right, top-down, forward-back

/*** FLAME ***/
VolumetricFire.texturePath = '/fire-temple/assets/textures/flame/';
var fireWidth  = 15;
var fireHeight = 30;
var fireDepth  = 15;
//var sliceSpacing = 0.5;
var sliceSpacing = 1.0;

var fire = new VolumetricFire( fireWidth, fireHeight, fireDepth, sliceSpacing, camera );
//var fire2 = new VolumetricFire( 130, 50, 10, 2.0, camera );
var fire2 = new VolumetricFire( 130, 20, 10, 2.0, camera );

//fire.mesh.position.set( 0, fireHeight / 2, 0 );
fire.mesh.position.set(0, 10, -20); //left-right, top-down, forward-back
fire2.mesh.position.set(0, 5, -35);
scene.add( fire.mesh );
scene.add( fire2.mesh );

///////////////////
// LIGHT  //
///////////////////
var ambient = new THREE.AmbientLight( 0x444444 );
//var ambient = new THREE.AmbientLight( 0x101030 );
scene.add( ambient );

var directionalLight = new THREE.DirectionalLight( 0xffeedd );
directionalLight.position.set( 0, 0, 1 ).normalize();
scene.add( directionalLight );

///////////
// SOUND //
///////////
var listener = new THREE.AudioListener();
camera.add( listener );

// sound spheres
var sphere = new THREE.SphereGeometry( 2.5, 4, 2 );
material_sphere1 = new THREE.MeshPhongMaterial( { color: 0xB22222, shading: THREE.FlatShading, shininess: 0 } );

var audioLoader = new THREE.AudioLoader();

var mesh1 = new THREE.Mesh( sphere, material_sphere1 );
mesh1.position.set(0, 2.5, -20);
scene.add( mesh1 );
var sound1 = new THREE.PositionalAudio( listener );
//audioLoader.load( 'assets/sounds/bolero-of-fire.mp3', function( buffer ) {
audioLoader.load( 'assets/sounds/fire-temple.mp3', function( buffer ) {
  sound1.setBuffer( buffer );
  sound1.setRefDistance( 0.03 );
  sound1.setVolume(100);
  sound1.setLoop(true);
  sound1.play();
});
mesh1.add( sound1 );

window.addEventListener('resize', onResize, true);
window.addEventListener('vrdisplaypresentchange', onResize, true);

// Request animation frame loop function
var lastRender = 0;
function animate(timestamp) {
  var delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;

  var elapsed = clock.getElapsedTime();
  
  controls.update();
  vrControls.update();
  fpVrControls.update(timestamp);

  manager.render(scene, camera, timestamp);
  effect.render(scene, camera);

  vrDisplay.requestAnimationFrame(animate);

  fire.update( elapsed );
  fire.mesh.rotation.y += delta * 0.0006;
  fire2.update( elapsed );
  //fire2.mesh.rotation.x += delta * 0.0006;
  mesh1.rotation.y += delta * 0.0006;
}

function onResize(e) {
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

var vrDisplay;

// Get the HMD, and if we're dealing with something that specifies stageParameters, rearrange the scene.
function setupStage() {
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      vrDisplay = displays[0];
      if (vrDisplay.stageParameters) {
        setStageDimensions(vrDisplay.stageParameters);
      }
      vrDisplay.requestAnimationFrame(animate);
    }
  });
}

function setStageDimensions(stage) {
  // Make the skybox fit the stage.
  var material = skybox.material;
  scene.remove(skybox);

  // Size the skybox according to the size of the actual stage.
  var geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
  skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  skybox.position.y = boxSize/2;
  scene.add(skybox);

  //scene.add( fire.mesh );
}