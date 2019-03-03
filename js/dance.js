/*
*** AUDIO JS ***
*/
var fire;
var passViz = [0];
var freqMax,
    freqAvg,
    freqNorm = 1;
var vizLac = 2.0;
var vizActive = true;

Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

function getAvg(grades) {
    return grades.reduce(function (p, c) {
        return p + c;
    //}) / grades.length;
    }) / 16;
}

function normalize(val, max, min) { 
    return (val - min) / (max - min); 
}

function distFreq(freq) {
    var max = Array.max(freq);
    var avg = getAvg(freq);
    var norm = normalize(avg, max, 0) + 1 || 0; //arbitrarily add # so viz looks better
    //var norm = normalize(avg, max, 0) || 1;

    //vizLac = norm + 1.2; //arbitrarily add # so viz looks better
    vizLac = norm + 1.0;
    fire.material.uniforms.lacunarity.value = vizLac;
    
    console.log("max: " + max);
    console.log("freqAvg: " + avg);
    console.log("freqNorm: " + norm);
    console.log("lacunarity: " + vizLac);

    if (norm !== 0) {
        vizActive = true;
    } else {
        vizActive = false;
    }
    return norm;
}

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
            width = config.width || 150,
            height = config.height || 150;
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
            vizActive = true;
            running = true;
            renderFrame();
        };
        this.stop = function() {
            audio.pause();
            running = false;
            vizActive = false;
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
            renderer.renderFrame(frequencyData);
            if (running) {
                requestAnimationFrame(renderFrame);
            }
        };
        init();
    };
    var v = null;
    var lastEl;
    var lastElparentId;
    v = new Visualization({
        renderer: renderers["r0"]
    });
    v.setRenderer(renderers["r0"]);
    v.start();

    document.getElementById("pause").onclick = function() {
        if (v.isPlaying()) {
            v.stop();
        }
    };
    document.getElementById("play").onclick = function() {
        v.start();
    };
    
    /*** 3D VISUALIZATION ***/
    var camera, scene, renderer;
    var mesh;
    var clock = new THREE.Clock();

    init();
    animate();
    function init() {
        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.z = 2;
        scene = new THREE.Scene();
        
        var loader = new THREE.TextureLoader();
        var tex = loader.load( 'https://sjcobb.github.io/fire-temple/assets/textures/fire/firetex.png' );
        fire = new THREE.Fire( tex );
        //fire.scale.set(1.5, 1.5, 1.5);
        scene.add(fire);

        /*** RENDERER ***/
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        
        window.addEventListener( 'resize', onWindowResize, false );
    }
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    function animate() {
        var elapsed = clock.getElapsedTime();
        //console.log(passViz);
        
        if (vizActive == true) {
            var t = clock.elapsedTime * freqNorm;
            fire.update(t);
            fire.rotation.y += 0.01;
            //fire.rotation.y += 0.005;
            //fire.rotation.x += 0.005;
            //fire.rotation.z += 0.005;
        }
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    }

    window.setInterval(function(){
        if (vizActive == true) {
            freqNorm = distFreq(passViz);
        }
    }, 800);

};

