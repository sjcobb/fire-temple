/*
 *** SCENE JS ***
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
//fpVrControls.verticalMovement = true;
fpVrControls.movementSpeed = 20;
//fpVrControls.movementSpeed = 50; //for testing

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Create a VR manager helper to enter and exit VR mode.
var params = {
  hideButton: false, // Default: false.
  isUndistorted: false // Default: false.
};
var manager = new WebVRManager(renderer, effect, params);

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

/////////////////////
// FLOOR / CEILING //
/////////////////////
var floorTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/cracks.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );
var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(650, 500, 50, 50); // e/w, n/s
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -6, -200);
//floor.position.y = -6; //lower = floor lowers
floor.rotation.x = Math.PI / 2; // 1.57
scene.add(floor);

var ceilingTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/brick-wall.jpg' );
ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping; 
ceilingTexture.repeat.set( 10, 10 );
var ceilingMaterial = new THREE.MeshBasicMaterial( { map: ceilingTexture, side: THREE.DoubleSide } );
var ceilingGeometry = new THREE.PlaneGeometry(60, 100, 1, 1); // e/w, n/s
var ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
ceiling.position.y = 18; //lower = floor lowers
ceiling.rotation.x = Math.PI / 2; // 1.57
scene.add(ceiling);

////////////
// WALLS //
///////////
var wall_y_pos = -2.3;
var woodsTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/woods-wall.png' );
woodsTexture.wrapS = woodsTexture.wrapT = THREE.RepeatWrapping; 
woodsTexture.repeat.set( 1, 1 );
var woodsMaterial = new THREE.MeshBasicMaterial( { map: woodsTexture, side: THREE.DoubleSide } );
var woodsGeometry = new THREE.PlaneGeometry(100, 50, 1, 1); // e/w, n/s

var brick_length = 300;
var brickTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/brick-wall.jpg' );
brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping; 
brickTexture.repeat.set( 5, 1 );
var brickMaterial = new THREE.MeshBasicMaterial( { map: brickTexture, side: THREE.DoubleSide } );
var brickGeometry = new THREE.PlaneGeometry(brick_length, 50, 15, 15);

var brickLongTexture = new THREE.ImageUtils.loadTexture( 'assets/textures/brick-wall.jpg' );
brickLongTexture.wrapS = brickLongTexture.wrapT = THREE.RepeatWrapping; 
brickLongTexture.repeat.set( 10, 1 );
var brickLongMaterial = new THREE.MeshBasicMaterial( { map: brickLongTexture, side: THREE.DoubleSide } );
var brickLongGeometry = new THREE.PlaneGeometry(brick_length*2+60, 50, 15, 15);

var wall1 = new THREE.Mesh(brickLongGeometry, brickLongMaterial);
var wall2 = new THREE.Mesh(woodsGeometry, woodsMaterial);
var wall3 = new THREE.Mesh(brickGeometry, brickMaterial);
var wall4 = new THREE.Mesh(brickGeometry, brickMaterial);
var wall5 = new THREE.Mesh(brickGeometry, brickMaterial);
var wall6 = new THREE.Mesh(brickGeometry, brickMaterial);

/* back wall */
wall1.position.set(0, wall_y_pos, -200);
scene.add(wall1);

/* front wall */
wall2.position.set(0, wall_y_pos, 15);
scene.add(wall2);

/* left side wall */
wall3.position.set(-30, 5, 0);
wall3.rotation.y = Math.PI / 2;
scene.add(wall3);

/* right side wall */
wall4.position.set(30, 5, 0);
wall4.rotation.y = Math.PI / 2;
scene.add(wall4);

/* front right extension wall */
wall5.position.set(180, wall_y_pos, -150);
scene.add(wall5);

/* front left extension wall */
wall6.position.set(-180, wall_y_pos, -150);
scene.add(wall6);

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
material_sphere2 = new THREE.MeshPhongMaterial( { color: 0xff2200, shading: THREE.FlatShading, shininess: 0 } );

var audioLoader = new THREE.AudioLoader();

//first sphere
var mesh1 = new THREE.Mesh( sphere, material_sphere1 );
mesh1.position.set(0, 2.5, -20);
scene.add( mesh1 );
var sound1 = new THREE.PositionalAudio( listener );
audioLoader.load( 'assets/sounds/fire-temple.mp3', function( buffer ) {
  sound1.setBuffer( buffer );
  sound1.setRefDistance( 0.03 );
  sound1.setVolume(100);
  sound1.setLoop(true);
  sound1.play();
});
mesh1.add( sound1 );

//second sphere
var mesh2 = new THREE.Mesh( sphere, material_sphere2 );
mesh2.position.set(300, 2.5, -175);
scene.add( mesh2 );

var sound2 = new THREE.PositionalAudio( listener );
audioLoader.load( 'assets/sounds/bolero-of-fire.mp3', function( buffer ) {
  sound2.setBuffer( buffer );
  sound2.setRefDistance( 0.03 );
  sound2.setVolume(100);
  sound2.setLoop(true);
  sound2.play();
});
mesh2.add( sound2 );

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