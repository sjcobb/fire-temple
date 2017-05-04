/*
*** AUDIO JS ***
*/

var passViz;
console.log(passViz);

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
            console.log(passViz[0]);

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
    init();
    animate();
    function init() {
    	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    	camera.position.z = 400;
    	scene = new THREE.Scene();
    	var texture = new THREE.TextureLoader().load( 'assets/textures/crate.gif' );
    	var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    	var material = new THREE.MeshBasicMaterial( { map: texture } );
    	mesh = new THREE.Mesh( geometry, material );
    	scene.add( mesh );
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

    	requestAnimationFrame( animate );

    	//mesh.rotation.x += 0.005;
    	//mesh.rotation.y += 0.01;
    	
    	//console.log(passViz);
    	mesh.rotation.y = passViz[0];

    	renderer.render( scene, camera );

    }

};

