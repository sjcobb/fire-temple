/*
 ** Credit to: https://github.com/free-unife/threejs-waterfall **
 * utils.js
 */

/*** J360 ***/
// Create a capturer that exports Equirectangular 360 JPG images in a TAR file
var canvas;
var equiManaged;

var capturer360 = new CCapture({
    format: 'threesixty',
    display: true,
    autoSaveTime: 3,
});

function startCapture360(event) {
    capturer360.start();
}

function stopCapture360(event) {
    capturer360.stop();
}

/* Function used to handle window resize.  */
function onWindowResize() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;

    renderer.setSize(canvasWidth, canvasHeight);

    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
}

/* Function that applies a texture specified by "location" to meshes, using
   "wrappingX" and "wrappingY" parameters.  */
function applyTex(location, wrappingX, wrappingY) {
    var texName;

    //THREE.ImageUtils.crossOrigin = '';
    texName = THREE.ImageUtils.loadTexture(location);
    texName.wrapS = texName.wrapT = THREE.RepeatWrapping;
    texName.repeat.set(wrappingX, wrappingY);

    return texName;

    /*
    var loader = new THREE.TextureLoader();
    loader.load('assets/textures/grass.png', onTextureLoaded);

    function onTextureLoaded(texture) {
        loadSkyBox();
        setupStage(); // For high end VR devices like Vive and Oculus, take into account the stage parameters provided.
    }
    */

}

/*
 * treeTrunkTween.js
 */

/* This variable is declared here (and not in main.js) to avoid problems 
   inside initTween function.  */
var treeTrunk;

/* Function that animates the tree trunk using TWEEN.js library.  */
function initTween() {
    /* Initial position.  */
    var source = {
        x: treeTrunkStruct.posX,
        y: treeTrunkStruct.posY,
        z: treeTrunkStruct.posZ
    };

    /* Final position.  */
    var target = {
        x: treeTrunkStruct.posZ,
        y: treeTrunkStruct.posY - 10,
        z: treeTrunkStruct.posZ
    };

    TWEEN.removeAll();

    var tween1 = new TWEEN.Tween(source)
        .to(target, 1200) /* Animation lasts 1200 ms.  */
        //.to(target, 2500) /* Animation lasts 1200 ms.  */
        //.repeat(5) /* Animation never stops.  */
        .repeat(Infinity) /* Animation never stops.  */
        .yoyo(true) /* Yoyo effect.  */
        /* Animation interpolating function.  */
        .easing(TWEEN.Easing.Elastic.InOut)
        .onUpdate(function () /* Tween update function.  */ {
            /* Reassign old position at the end of each loop.  */
            treeTrunk.position.y = source.y;
            /* Give a rotation effect to the trunk.  */
            treeTrunk.rotation.x += 0.1;
        });

    tween1.start(); /* Animation loop.  */
}

/*
 ** main.js **
*/

/* Global variables.  */
var scene, camera, renderer;

/* Constants.  */
var scr =
/* Screen dimensions.  */
{
    w: window.innerWidth,
    h: window.innerHeight
};

var gAccel = -9.81; /* g = 9.81 m/s^2.  */
//var particleCount = 4096; /* Falling particles.  */
//var lowerParticleCount = 2048; /* Particles at the base of the waterfall.  */

var particleCount = 1096; /* Falling particles.  */
var lowerParticleCount = 548; /* Particles at the base of the waterfall.  */

/* Data structs.  */
var waterfall = {
    w: scr.w / 4 /* Real width.  */,
    h: scr.h / 4 /* Upper start point.  */,
    startX: scr.w / 4 /* Lateral right start point.  */,
    l: -(scr.h / 5) /* Lower maximum (stop) point.  */
};

var globlPart =
/* Falling particles coordinate proprieties.  */
{
    pXVar: waterfall.w,
    pXMean: -(scr.w / 8),

    pYVar: 4000,
    pYMean: -10,

    pZVar: -50,
    pZMean: -100,

    initVel: 0.5,
    visible: false
};

var wall =
/* Waterfall wall.  */
{
    h: scr.h / 2,
    pZ: globlPart.pZMean - scr.w / 1.9
};

var lowerGloblPart = {
    pXVar: waterfall.w,
    pXMean: -(scr.w / 8),

    pYVar: 0,
    pYMean: waterfall.l * 1.18,

    pZVar: -50,
    pZMean: -75,

    initVel: 80,
    deaccel: -0.5
};

var riverOutput =
/* Two rectangles drawn at the end of the river.  */
{
    dimY: 20,
    dimZ: -lowerGloblPart.pZVar,
    startX: globlPart.pXVar + globlPart.pXMean + 2
};
var riverOutputStruct = {
    X0: riverOutput.startX,
    Y0: waterfall.h - riverOutput.dimY,
    Z0: globlPart.pZMean,

    X1: riverOutput.startX,
    Y1: waterfall.h,
    Z1: globlPart.pZMean,

    X2: riverOutput.startX,
    Y2: waterfall.h - riverOutput.dimY,
    Z2: globlPart.pZMean - riverOutput.dimZ
};

var trees = {
    scaleX: 64 /* Trees are 64*64.  */,
    scaleY: 64,

    posXRight: riverOutput.startX + 50,
    posYRight: waterfall.h + 32 /* + 32 = 64 / 2.  */,
    posZRight: globlPart.pZMean - 100
};

var treeTrunkStruct = {
    radius: 20,
    height: 100,

    posX: riverOutput.startX + 200,
    posY: waterfall.l * 1.2 + 2.5,
    posZ: 300,

    rotX: -90,
    rotZ: 90
};

/* Other structs */
var particles = []; /* Falling particles.  */

var lowerParticles = []; /* Lower water particles.  */

var particleSys;
var lowerParticleSys;

var time = []; /* Clock for main waterfall particles.  */
var lowerTime = []; /* Clock for main waterfall particles.  */

var cameraControls; /* Used to control camera from mouse */
var clock = new THREE.Clock(); /* Clock for camera controls.  */

/* Function that calls all the other functions.  */
function main() {
    init(); /* Define main structures.  */

    createEnvironment(); /* Create objects.  */

    defineParticles(); /* Create particles.  */

    render(); /* Start rendering.  */
    //animate();
}

/* Function used to initialize all the core elements like scene, camera, 
   light and fog.  */
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, scr.w / scr.h, 0.1, 10000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setClearColor(new THREE.Color(0xffffff, 1.0));
    renderer.setSize(scr.w, scr.h);

    /*** J360 ***/
    //var equiManaged;
    //equiManaged = new CubemapToEquirectangular(renderer, true, "1K");
    equiManaged = new CubemapToEquirectangular(renderer, true, "2K");
    //equiManaged = new CubemapToEquirectangular(renderer, true, "4K");
    //console.log(equiManaged);

    /* Camera positioning and pointing it to the center of the scene.  */

    camera.position.x = -waterfall.startX * 2;
    camera.position.y = waterfall.h * 4;
    camera.position.z = waterfall.h * 4;
    camera.lookAt(0, 0, 0); //Look at the center of the scene


    // camera.position.x = -waterfall.startX;
    // camera.position.y = waterfall.h;
    // camera.position.z = waterfall.h;
    // camera.lookAt(0, 0, 0);

    //var container = document.getElementsByClassName('container')[0];
    var container = document.getElementById('WebGL-output');

    /* Add the output of the renderer to the html element.  */
    canvas = container.appendChild(renderer.domElement);
    //document.getElementById("WebGL-output").appendChild(renderer.domElement);

    /* Camera mouse controls.  */
    cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    /* alternate Orbit controls */
    //cameraControls = new THREE.OrbitControls(camera, container);

    /* Sun light.  */
    var sunLight = new THREE.DirectionalLight(0x0f0f0f, 100.0);
    sunLight.position
        .set(-riverOutput.startX, 64000, riverOutput.dimZ + 20)
        .normalize();
    scene.add(sunLight);

    /* Fog. */
    scene.fog = new THREE.FogExp2(0x2f2f2f, 0.0005);

    window.addEventListener("resize", onWindowResize, false);
}

/* Function used to call other functions that create all objects except the 
   particles.  */
function createEnvironment() {
    /* Use screen width and height as variables to create
           some objects.  */
    createWaterfallWall(scr.w, waterfall.h * 2, scr.w, wall.pZ);
    createTrees();
    createTreeTrunk();
    initTween();
    createLake(-(scr.w * 2), scr.w * 2, 0, waterfall.l * 1.2, 0, -90);
    createRiverOutput();
    createRiver(riverOutput.startX * 2, 0, scr.w, waterfall.h + 2, wall.pZ);
    createSkyBox();
}

/* Function that creates the grey box / waterfall wall.  */
function createWaterfallWall(dimX, dimY, dimZ, posZ) {
    var lWall, lWallGeometry, lWallMaterial, lWallTex;

    lWallGeometry = new THREE.BoxGeometry(dimX, dimY, dimZ);
    lWallMaterial = new THREE.MeshPhongMaterial({ color: 0x0f0f0f });
    lWall = new THREE.Mesh(lWallGeometry, lWallMaterial);

    lWall.position.z = posZ;

    scene.add(lWall);
}

/* Creates some trees on the top of the box.  */
function createTrees() {
    var i, tree;

    THREE.ImageUtils.crossOrigin = '';
    var treeTexture = THREE.ImageUtils.loadTexture("assets/textures/tree.png");

    var treeMaterial = new THREE.SpriteMaterial({
        map: treeTexture,
        //useScreenCoordinates: false
    });
    for (i = 0; trees.posZRight - i * 200 > -scr.w; i++) {
        /* Right trees.  */
        tree = new THREE.Sprite(
            treeMaterial
        ); /* Use sprites so that
							 * the trees will
							 * always point to 
							 * the camera.  */
        /* z distance between each tree is 200.  */
        tree.position.set(
            trees.posXRight,
            trees.posYRight,
            trees.posZRight - i * 200
        );
        tree.scale.set(trees.scaleX, trees.scaleY, 1.0);
        scene.add(tree);

        /* Left trees.  */
        tree = new THREE.Sprite(treeMaterial);
        tree.position.set(
            -trees.posXRight,
            trees.posYRight,
            trees.posZRight - i * 200
        );
        tree.scale.set(trees.scaleX, trees.scaleY, 1.0);
        scene.add(tree);
    }
}

/* Function that creates the mesh of the floating tree trunk in the lake.  */
function createTreeTrunk() {
    var treeTrunkGeometry, treeTrunkMaterial, treeTrunkTex;

    treeTrunkGeometry = new THREE.CylinderGeometry(
        treeTrunkStruct.radius,
        treeTrunkStruct.radius,
        treeTrunkStruct.height,
        100,
        100,
        false
    );
    treeTrunkTex = applyTex("assets/textures/treeTrunkTex.jpg", 1, 1);
    treeTrunkMaterial = new THREE.MeshBasicMaterial({ map: treeTrunkTex });
    treeTrunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);

    treeTrunk.position.x = treeTrunkStruct.posX;
    treeTrunk.position.y = treeTrunkStruct.posY;
    treeTrunk.position.z = treeTrunkStruct.posZ;

    treeTrunk.rotation.x = treeTrunkStruct.rotX * Math.PI / 180.0;
    treeTrunk.rotation.z = treeTrunkStruct.rotZ * Math.PI / 180.0;

    treeTrunk.visible = false;

    scene.add(treeTrunk);
}

/* Creates lake using color and texture.  */
function createLake(dimX, dimY, posX, posY, posZ, rotX) {
    var lLake, lLakeGeometry, lLakeMaterial, lLakeTex;

    lLakeGeometry = new THREE.PlaneGeometry(dimX, dimY);
    lLakeTex = applyTex("assets/textures/water.jpg", 50, 50);
    lLakeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00005f,
        side: THREE.DoubleSide,
        map: lLakeTex
    });
    lLake = new THREE.Mesh(lLakeGeometry, lLakeMaterial);

    lLake.position.x = posX;
    lLake.position.y = posY;
    lLake.position.z = posZ;

    lLake.rotation.x = rotX * Math.PI / 180.0;

    scene.add(lLake);
}

/* Creates two rectangular sides at the top of the waterfall.
 
   How does it work:

   A is lower triangle;		
   B is upper triangle;
   Numbers correspond to the order in which triangles are drawn.

   (A/B points)
			2/1  0 (B starting point)
			 ____
			|\   |
			| \B |
			|A \ |
			|___\|

   (A starting point)	0    1/2

   Texture mapping:

			0,1  1,1
 			 ____
			|\   |
			| \B |
			|A \ |
			|___\|
 
			0,1  1,0
 */

function createRiverOutput() {
    var A, B, riverOutputMaterial, mesh;

    riverOutputMaterial = new THREE.MeshPhongMaterial({
        color: 0x2f2f2f,
        side: THREE.DoubleSide
    });

    /* Right A and B.  */
    A = new THREE.Geometry();
    A.vertices.push(
        new THREE.Vector3(
            riverOutputStruct.X0 /* A0.  */,
            riverOutputStruct.Y0,
            riverOutputStruct.Z0
        )
    );
    A.vertices.push(
        new THREE.Vector3(
            riverOutputStruct.X1 /* A1.  */,
            riverOutputStruct.Y1,
            riverOutputStruct.Z1
        )
    );
    A.vertices.push(
        new THREE.Vector3(
            riverOutputStruct.X2 /* A2.  */,
            riverOutputStruct.Y2,
            riverOutputStruct.Z2
        )
    );
    A.faces.push(new THREE.Face3(0, 1, 2));
    mesh = new THREE.Mesh(A, riverOutputMaterial);
    scene.add(mesh);

    B = new THREE.Geometry();
    B.vertices.push(
        new THREE.Vector3(
            riverOutputStruct.X0 /* B0.  */,
            riverOutputStruct.Y1,
            riverOutputStruct.Z2
        )
    );
    B.vertices.push(
        new THREE.Vector3(
            riverOutputStruct.X1 /* B1.  */,
            riverOutputStruct.Y2,
            riverOutputStruct.Z2
        )
    );
    B.vertices.push(
        new THREE.Vector3(
            riverOutputStruct.X2 /* B2.  */,
            riverOutputStruct.Y1,
            riverOutputStruct.Z1
        )
    );
    B.faces.push(new THREE.Face3(0, 1, 2));
    mesh = new THREE.Mesh(B, riverOutputMaterial);
    scene.add(mesh);

    /* Left A and B.  */
    A = new THREE.Geometry();
    A.vertices.push(
        new THREE.Vector3(
            -riverOutputStruct.X0 /* A0.  */,
            riverOutputStruct.Y0,
            riverOutputStruct.Z0
        )
    );
    A.vertices.push(
        new THREE.Vector3(
            -riverOutputStruct.X1 /* A1.  */,
            riverOutputStruct.Y1,
            riverOutputStruct.Z1
        )
    );
    A.vertices.push(
        new THREE.Vector3(
            -riverOutputStruct.X2 /* A2.  */,
            riverOutputStruct.Y2,
            riverOutputStruct.Z2
        )
    );
    A.faces.push(new THREE.Face3(0, 1, 2));
    mesh = new THREE.Mesh(A, riverOutputMaterial);
    scene.add(mesh);

    B = new THREE.Geometry();
    B.vertices.push(
        new THREE.Vector3(
            -riverOutputStruct.X0 /* B0.  */,
            riverOutputStruct.Y1,
            riverOutputStruct.Z2
        )
    );
    B.vertices.push(
        new THREE.Vector3(
            -riverOutputStruct.X1 /* B1.  */,
            riverOutputStruct.Y2,
            riverOutputStruct.Z2
        )
    );
    B.vertices.push(
        new THREE.Vector3(
            -riverOutputStruct.X2 /* B2.  */,
            riverOutputStruct.Y1,
            riverOutputStruct.Z1
        )
    );
    B.faces.push(new THREE.Face3(0, 1, 2));
    mesh = new THREE.Mesh(B, riverOutputMaterial);
    scene.add(mesh);
}

/* Creates river with water texture on top of the box.  */
function createRiver(dimX, dimY, dimZ, posY, posZ) {
    var lRiver, lRiverGeometry, lRiverMaterial, lRiverTex;

    lRiverGeometry = new THREE.BoxGeometry(dimX, dimY, dimZ);
    lRiverTex = applyTex("assets/textures/water512.jpg", 4, 8);

    lRiverMaterial = new THREE.MeshBasicMaterial({ map: lRiverTex });
    lRiver = new THREE.Mesh(lRiverGeometry, lRiverMaterial);

    lRiver.position.y = posY;
    lRiver.position.z = posZ;

    scene.add(lRiver);
}

/* Function that creates the skybox with 512*512 size pictures.  */
function createSkyBox() {
    var path, urls, textureCube, shader, skyMaterial, sky;

    path = "assets/textures/";
    urls = [
        path + "posx.jpg",
        path + "negx.jpg",
        path + "posy.jpg",
        path + "negy.jpg",
        path + "posz.jpg",
        path + "negz.jpg"
    ];

    textureCube = THREE.ImageUtils.loadTextureCube(urls);
    textureCube.format = THREE.RGBFormat;

    shader = THREE.ShaderLib.cube;
    shader.uniforms.tCube.value = textureCube;

    skyMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    /*  Define the skybox: it's a cube 4096*4096*4096.  */
    sky = new THREE.Mesh(new THREE.BoxGeometry(4096, 4096, 4096), skyMaterial);
    scene.add(sky);
}

/* Function that creates both the falling particles and also the particles at
   the base of the waterfall.  */
function defineParticles() {
    var particleTex, p, pGeometry;

    pGeometry = new THREE.Geometry();
    particleTex = applyTex("assets/textures/drop2.png", 1, 1);
    pMaterial = new THREE.PointsMaterial({
        color: 0x3399ff /* Blue-like colour.  */,
        map: particleTex /* Texture.  */,
        size: 10,
        sizeAttenuation: true,
        fog: true,
        transparent: true /* Alpha channel = 0; propriety inherited
				      from Material.  */
    });

    /* Creates falling particles.  */
    for (p = 0; p < particleCount; p++) {
        /* Initial position and velocity added to pGeometry.  */
        particles[p] = {
            position: new THREE.Vector3(
                Math.random() * globlPart.pXVar + globlPart.pXMean,
                Math.random() * globlPart.pYVar + globlPart.pYMean,
                Math.random() * globlPart.pZVar + globlPart.pZMean
            ),
            velocity: new THREE.Vector3(
                0,
                0.5,
                Math.random() * globlPart.initVel + globlPart.initVel
            )
        };
        pGeometry.vertices.push(particles[p].position);

        /* Start the particle clock.  */
        time[p] = new THREE.Clock();
        time[p].start();
    }

    particleSys = new THREE.Points(pGeometry, pMaterial);
    particleSys.sortParticles = true;
    particleSys.visible = false; /* Inherited from Object3D.  */
    scene.add(particleSys);

    /* Create lower particles.
	   See previous comments.  */
    pGeometry = new THREE.Geometry();
    particleTex = applyTex("assets/textures/drop.png", 1, 1);
    pMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        map: particleTex,
        size: 10,
        sizeAttenuation: true,
        fog: true,
        transparent: true
    });

    for (p = 0; p < lowerParticleCount; p++) {
        lowerParticles[p] = {
            position: new THREE.Vector3(
                Math.random() * lowerGloblPart.pXVar + lowerGloblPart.pXMean,
                lowerGloblPart.pYMean,
                Math.random() * lowerGloblPart.pZVar + lowerGloblPart.pZMean
            ),
            velocity: new THREE.Vector3(
                lowerGloblPart.initVel,
                0.5,
                Math.random() * lowerGloblPart.initVel + lowerGloblPart.initVel
            )
        };
        pGeometry.vertices.push(lowerParticles[p].position);

        lowerTime[p] = new THREE.Clock();
        lowerTime[p].start();
    }

    lowerParticleSys = new THREE.Points(pGeometry, pMaterial);
    lowerParticleSys.sortParticles = true;
    lowerParticleSys.visible = false;

    scene.add(lowerParticleSys);
}

/* Rendering loop.  */
function render() {

    particleMgr();

    var delta = clock.getDelta();
    //var delta = clock.getDelta() + 1000;

    cameraControls.update(delta);
    //console.log({cameraControls});

    //TWEEN.update(); //update tree trunk

    if (particleSys.visible == true && treeTrunk.visible == false) //If the waterfall particles are not yet visible...
        treeTrunk.visible = true;

    renderer.render(scene, camera);

    setInterval(function () {
        requestAnimationFrame(render);
    }, 500);
    //requestAnimationFrame(render);

    capturer360.capture(canvas); //J360
}

/*var lastRender = 0;
function animate(timestamp) {
    var delta = Math.min(timestamp - lastRender, 500);
    lastRender = timestamp;
    var elapsed = clock.getElapsedTime();

    cameraControls.update(elapsed);
    particleMgr();

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}*/

/* Particle manager function, called by renderer.  */
function particleMgr() {
    fallingParticlesMgr();
    lowerParticlesMgr();
}

/* Function that manages particles falling from the waterfall.  */
function fallingParticlesMgr() {
    /* Get the number of particles.  */
    var pCount = particleCount;
    while (pCount-- /* Loop all particles. */) {
        /* Get the current particle.  */
        var particle = particles[pCount];
        //console.log({particle});

        /* Calculate elapsed time and use modulus operator to
		   solve animation problems.  */
        var elapsed = time[pCount].getElapsedTime() % 20;
        //var elapsed = time[pCount].getElapsedTime();
        //console.log(elapsed);

        /* Check if we need to reset particle position.  */
        if (particle.position.y < waterfall.l) {
            //console.log("particle needs reset");
            /* - height */
            /* Check if the particles can be made visible.  */
            if (particleSys.visible == false && pCount == 1)
                particleSys.visible = true;

            /* Particle clock reset.  */
            time[pCount] = new THREE.Clock();
            time[pCount].start();

            /* Assign random positions for x and z (in a fixed 
			   range), but not for y which has fixed values.  */
            particle.position.x =
                Math.random() * globlPart.pXVar + globlPart.pXMean;
            particle.velocity.x = 0;

            particle.position.y = waterfall.h;
            particle.velocity.y = globlPart.initVel;

            particle.position.z =
                Math.random() * globlPart.pZVar + globlPart.pZMean;
            particle.velocity.z =
                Math.random() * globlPart.initVel + globlPart.initVel;
        } else {
            /* vy = g * t (where t is the leapsed time.)  */
            particle.velocity.y = gAccel * elapsed;
            /* y = 1/2 * g * t^2 (uniform acceleration.)  */
            particle.position.y += 1 / 2 * particle.velocity.y * elapsed;

            /* vz = v0 (where z corresponds to x.)  */
            particle.velocity.z += 0;
            /* z = v0 * t  */
            particle.position.z += particle.velocity.z * elapsed;
        }
        /* Reassign particle to main particles array  */
        //console.log(pCount);
        particles[pCount] = particle;
    }
}

function lowerParticlesMgr() {
    var pCount = lowerParticleCount;
    while (pCount--) {
        if (particleSys.visible == true && pCount == 1)
            lowerParticleSys.visible = true;

        /* Get the current particle.  */
        var particle = lowerParticles[pCount];
        /* Calculate elapsed time.  */
        var elapsed = lowerTime[pCount].getElapsedTime() % 20;

        /* Check if we need to reset particle x position.  */
        if (
            particle.position.x < -(waterfall.startX * 2) ||
            particle.position.x > waterfall.startX * 2
        ) {
            /* clock reset */
            lowerTime[pCount] = new THREE.Clock();
            lowerTime[pCount].start();

            particle.position.x =
                Math.random() * lowerGloblPart.pXVar + lowerGloblPart.pXMean;
            particle.velocity.x = lowerGloblPart.initVel;
        }
        /* Check if we need to reset z position.  */
        if (
            particle.position.z < lowerGloblPart.pZMean ||
            particle.position.z > 2 * -lowerGloblPart.pZMean
        ) {
            /* Clock reset.  */
            lowerTime[pCount] = new THREE.Clock();
            lowerTime[pCount].start();

            particle.position.z =
                Math.random() * (lowerGloblPart.pZVar - 10) * 4 +
                lowerGloblPart.pZMean +
                100;
            particle.velocity.z = lowerGloblPart.initVel / 2;
        }

        /* particle.velocity.x has been changed to particle.position.x 
		   in the first round bracket.  */
        particle.position.x =
            particle.position.x +
            particle.position.x * elapsed +
            1 /
            2 *
            lowerGloblPart.deaccel *
            elapsed *
            elapsed; /* Using speed 
							       attenuation
							       (deaccel).  */
        particle.position.z =
            particle.position.z + particle.position.z * elapsed;

        /* Reassign particle to main particles array  */
        lowerParticles[pCount] = particle;
    }
}

/*** CALL MAIN ***/
main();

/*** PLAY MUSIC ***/
/*var x = document.getElementById("myAudio"); 

function playAudio() { 
    x.play().then(()=>x.pause());
    setTimeout(()=> x.play(), 3000);
    
    //x.play(); 
} 
playAudio();

function pauseAudio() { 
    x.pause(); 
} 
*/