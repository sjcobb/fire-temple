/*
*** AUDIO JS ***
*/

var controller = {
    speed       : 1.0,
    magnitude   : 1.3,
    lacunarity  : 2.0,
    gain        : 0.5,
    noiseScaleX : 1.0,
    noiseScaleY : 2.0,
    noiseScaleZ : 1.0,
    wireframe   : false
};

var passViz;
passViz = 0.2;
//console.log(passViz);

//https://blog.prototypr.io/get-started-with-the-web-audio-api-for-music-visualization-b6f594416a16
//http://stackoverflow.com/questions/29544371/finding-the-average-of-an-array-using-js
//https://johnresig.com/blog/fast-javascript-maxmin

Array.max = function( array ){
    return Math.max.apply( Math, array );
};
 
Array.min = function( array ){
    return Math.min.apply( Math, array );
};

//var grades = [80, 77, 88, 95, 68];
var grades = [145, 138, 103, 49, 39, 39, 38, 33, 26, 21, 15, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var grades = [245, 235, 198, 159, 135, 120, 116, 107, 102, 96, 96, 102, 97, 78, 46, 39, 32, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var grades;

function getAvg(grades) {
  return grades.reduce(function (p, c) {
  return p + c;
//}) / grades.length;
}) / 16; //cut array in half to account for overload of 0's in freq distribution
}

function normalize(val, max, min) { 
    return (val - min) / (max - min); 
}

function distFreq(freq) {
    var max = Array.max(freq);
    var avg = getAvg(freq);
    var norm = normalize(avg, max, 0) || 1;
    console.log("max: " + max);
    console.log("freqAvg: " + avg);
    console.log("freqNorm: " + norm);
    return norm;
}

var freqMax;
var freqAvg;
var freqNorm = 1;


/*** AUDIO API ***/
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
var renderers = {
    'r0': (function() {
        var barsArr = [],
            initialized = false,
            barsEl;
        var height = 0;
        var init = function(config) {
            var count = config.count;
            var width = config.width;
            var barWidth = (width / count) >> 0;
            height = config.height;
            barsEl = document.getElementById('bars');
            for (var i = 0; i < count; i++) {
                var nunode = document.createElement('div');
                nunode.classList.add('bar');
                nunode.style.width = barWidth + 'px';
                nunode.style.left = (barWidth * i) + 'px';
                barsArr.push(nunode);
                barsEl.appendChild(nunode);
            }
            initialized = true;
        };
        var max = 256;
        var renderFrame = function(frequencyData) {
            for (var i = 0; i < barsArr.length; i++) {
                var bar = barsArr[i];
                bar.style.height = ((frequencyData[i] / max) * height + 'px');
            }
        };
        return {
            init: init,
            isInitialized: function() {
                return initialized;
            },
            renderFrame: renderFrame
        }
    })()
};
window.onload = function() {
    function Visualization(config) {
        var audio, audioStream, analyser, source, audioCtx, canvasCtx, frequencyData, running = false,
            renderer = config.renderer,
            width = config.width || 360,
            height = config.height || 360;
        var init = function() {
            audio = document.getElementById('r0audio');
            audioCtx = new AudioContext();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 64;
            frequencyData = new Uint8Array(analyser.frequencyBinCount);
            renderer.init({
                count: analyser.frequencyBinCount,
                width: width,
                height: height
            });
        };
        this.start = function() {
            audio.play();
            running = true;
            renderFrame();
        };
        this.stop = function() {
            running = false;
            audio.pause();
        };
        this.setRenderer = function(r) {
            if (!r.isInitialized()) {
                r.init({
                    count: analyser.frequencyBinCount,
                    width: width,
                    height: height
                });
            }
            renderer = r;
        };
        this.isPlaying = function() {
            return running;
        }
        var renderFrame = function() {
            analyser.getByteFrequencyData(frequencyData);

            passViz = frequencyData;
            //console.log(passViz);
            //console.log(passViz[0]);

            grades = passViz;
            freqMax = Array.max(grades);
            freqAvg = getAvg(grades);
            
            freqNorm = normalize(freqAvg, freqMax, 0) || 1; //http://stackoverflow.com/questions/7540397/convert-nan-to-0-in-javascript
            //freqNorm = normalize(freqAvg, freqMax, 0) + 1 || 1; //arbitrarily add 1 so viz looks better
            //console.log("max: " + freqMax);
            //console.log("freqAvg: " + freqAvg);
            //console.log("freqNorm: " + freqNorm);

            distFreq(grades);

            renderer.renderFrame(frequencyData);
            if (running) {
                requestAnimationFrame(renderFrame);
            }
        };
        init();
    };
    var vis = document.querySelectorAll('.initiator');
    var v = null;
    var lastEl;
    var lastElparentId;
    for (var i = 0; i < vis.length; i++) {
        vis[i].onclick = (function() {
            return function() {
                var el = this;
                var id = el.parentNode.id;
                if (!v) {
                    v = new Visualization({
                        renderer: renderers[id]
                    });
                }
                v.setRenderer(renderers[id]);
                if (v.isPlaying()) {
                    if (lastElparentId === id) {
                        v.stop();
                        el.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    } else {
                        lastEl.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        el.style.backgroundColor = 'rgba(0,0,0,0)';
                    }
                } else {
                    v.start();
                    el.style.backgroundColor = 'rgba(0,0,0,0)';
                }
                lastElparentId = id;
                lastEl = el;
            };
        })();
    }

    /*** 3D VISUALIZATION ***/
    //console.log(passViz[0]);

    var camera, scene, renderer;
    var mesh;

    var clock = new THREE.Clock();
    var fire;

    init();
    animate();
    function init() {
    	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    	camera.position.z = 400;
    	scene = new THREE.Scene();
    	var texture = new THREE.TextureLoader().load( 'fire-temple/assets/textures/crate.gif' );
    	var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    	var material = new THREE.MeshBasicMaterial( { map: texture } );
    	mesh = new THREE.Mesh( geometry, material );
    	//scene.add( mesh );

    	camera.position.z = 2;
    	//scene.add(camera);

    	var tex = THREE.ImageUtils.loadTexture("/fire-temple/assets/textures/fire/firetex.png");
    	fire = new THREE.Fire( tex );

    	//fire.position.set(0, 0, 0);

    	//fire.frustumCulled = false;

    	var wireframeMat = new THREE.MeshBasicMaterial({
    	    color : new THREE.Color(0xffffff),
    	    wireframe : true
    	});
    	var wireframe = new THREE.Mesh(fire.geometry, wireframeMat.clone());
    	fire.add(wireframe);
    	wireframe.visible = true;
    	//wireframe.visible = false;

    	//console.log(fire);
    	scene.add(fire);

    	var onUpdateMat = function() {
    	    fire.material.uniforms.magnitude.value = controller.magnitude;
    	    fire.material.uniforms.lacunarity.value = controller.lacunarity;
    	    fire.material.uniforms.gain.value = controller.gain;
    	    fire.material.uniforms.noiseScale.value = new THREE.Vector4(
    	        controller.noiseScaleX,
    	        controller.noiseScaleY,
    	        controller.noiseScaleZ,
    	        0.3
    	    );
    	};
    	var gui = new dat.GUI();
    	gui.add(controller, "speed", 0.1, 10.0).step(0.1);
    	gui.add(controller, "magnitude", 0.0, 10.0).step(0.1).onChange(onUpdateMat);
    	gui.add(controller, "lacunarity", 0.0, 10.0).step(0.1).onChange(onUpdateMat);
    	gui.add(controller, "gain", 0.0, 5.0).step(0.1).onChange(onUpdateMat);
    	gui.add(controller, "noiseScaleX", 0.5, 5.0).step(0.1).onChange(onUpdateMat);
    	gui.add(controller, "noiseScaleY", 0.5, 5.0).step(0.1).onChange(onUpdateMat);
    	gui.add(controller, "noiseScaleZ", 0.5, 5.0).step(0.1).onChange(onUpdateMat);
    	gui.add(controller, "wireframe").onChange(function() {
    	    var wireframe = fire.children[0];
    	    wireframe.visible = controller.wireframe;
    	});
    	//console.log(controller.speed);

    	/*** RENDERER ***/
    	renderer = new THREE.WebGLRenderer();
    	renderer.setPixelRatio( window.devicePixelRatio );
    	renderer.setSize( window.innerWidth, window.innerHeight );
    	document.body.appendChild( renderer.domElement );
    	//
    	window.addEventListener( 'resize', onWindowResize, false );
    }
    function onWindowResize() {
    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();
    	renderer.setSize( window.innerWidth, window.innerHeight );
    }
    function animate() {


    	var elapsed = clock.getElapsedTime();


        var vizSpeed = passViz[0] * 0.01;
        //var t = clock.elapsedTime * vizSpeed;
    	//console.log(vizSpeed);

        //console.log("controller.speed: " + controller.speed);
        //var t = clock.elapsedTime * controller.speed;


        //console.log("NORM ANIM: " + freqNorm);
        var t = clock.elapsedTime * freqNorm;
        //var t = clock.elapsedTime * controller.speed;

    	fire.update(t);

    	//fire.position.x = passViz[0]/200;

    	//mesh.rotation.x += 0.005;
    	//mesh.rotation.y += 0.01;
    	
    	//console.log(passViz);

    	//mesh.rotation.y = passViz[0];

    	requestAnimationFrame( animate );

    	renderer.render( scene, camera );

    }

};

