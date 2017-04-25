/*
*** SCENE JS ***
*/
//https://github.com/aframevr/aframe/issues/2560
//https://glitch.com/edit/#!/sharp-middle?path=README.md:1:0
//https://glitch.com/edit/#!/fixed-cent?path=README.md:1:0

AFRAME.registerComponent('material-grid-glitch', {
  schema: {color: {type: 'color'}},

  init: function () {
    const data = this.data;
  
    this.material  = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        color: { value: new THREE.Color(data.color) }
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });

    this.applyToMesh();
    this.el.addEventListener('model-loaded', () => this.applyToMesh());
  },


  /**
   * Update the ShaderMaterial when component data changes.
   */
  update: function () {
    this.material.uniforms.color.value.set(this.data.color);
  },
    
  /**
   * Apply the material to the current entity.
   */
  applyToMesh: function() {
    const mesh = this.el.getObject3D('mesh');
    if (mesh) {
      mesh.material = this.material;
    }
  },

  /**
   * On each frame, update the 'time' uniform in the shaders.
   */
  tick: function (t) {
    this.material.uniforms.time.value = t / 1000;
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
  ].join('\n'),

  fragmentShader: [
    "varying vec2 vUv;",
    "uniform vec3 color;",
    "uniform float time;",
    "void main() {",
    "  gl_FragColor = mix(",
    "    vec4(mod(vUv , 0.05) * 20.0, 1.0, 1.0),",
    "    vec4(color, 1.0),",
    "    sin(time)",
    "  );",
    "}",
  ].join('\n'),
  
})

/*** THREE.Fire: https://github.com/mattatz/THREE.Fire ***/
AFRAME.registerComponent('fire', {
  schema: {color: {type: 'color'}},
  init: function () {
    const data = this.data,
          mesh = this.el.getObject3D('mesh');

    var loader = new THREE.TextureLoader();
    this.tex = loader.load( '/js/lib/three.fire/Fire.png' );
    this.tex.magFilter = this.tex.minFilter = THREE.LinearFilter;
    this.tex.wrapS = THREE.wrapT = THREE.ClampToEdgeWrapping;

    this.material = new THREE.ShaderMaterial( {
      defines: {
        "ITERATIONS"    : "20",
        "OCTIVES"       : "3"
      },
      uniforms: {
        fireTex        : { type : "t",     value : this.tex },
        color          : { type : "c",     value : new THREE.Color(0xeeeeee) },
        time           : { type : "f",     value : 0.0 },
        seed           : { type : "f",     value : Math.random() * 19.19 },
        invModelMatrix : { type : "m4",    value : new THREE.Matrix4().set( 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, -0.5, 0, 0, 2 ) },
        scale          : { type : "v3",    value : new THREE.Vector3(1, 1, 1) },
        noiseScale     : { type : "v4",    value : new THREE.Vector4(1, 2, 1, 0.3) },
        magnitude      : { type : "f",     value : 1.3 },
        lacunarity     : { type : "f",     value : 2.0 },
        gain           : { type : "f",     value : 0.5 },
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false
    } );

    var wireframeMat = new THREE.MeshBasicMaterial({
        color : new THREE.Color(0xffffff),
        wireframe : true
    });
    var wireframe = new THREE.Mesh(mesh.geometry, wireframeMat.clone());
    mesh.add(wireframe);
    wireframe.visible = false;

    this.el.addEventListener('model-loaded', () => this.update());
  },
  update: function (data) {
    const mesh = this.el.getObject3D('mesh');
    //console.log(this.el.id);

    if (mesh) {
      //console.log(mesh);
      mesh.material = this.material;

      //this.el.setAttribute('position', {x: 5, y: 0, z: 0});
      var test = this.el.getAttribute('position');
      //console.log(test);
      mesh.position.set(test.x, test.y, test.z);

      if (this.el.id == "top-right") {
        mesh.position.set(2.5, 11.5, 3);
      } else if (this.el.id == "top-left") {
        mesh.position.set(-2, 11.5, 3);
      } else {
        mesh.position.set(0, 0, 0);
      }

      //this.material.src = data.src;
    }
  },
  tick: function (time, delta) {
    const mesh = this.el.getObject3D('mesh');

    var invModelMatrix = this.material.uniforms.invModelMatrix.value;
    invModelMatrix.getInverse( mesh.matrix );
    this.material.uniforms.invModelMatrix.value = invModelMatrix;

    this.material.uniforms.time.value = time / 1000; //always needed for flame flicker
  },
  vertexShader: [
    "varying vec3 vWorldPos;",
    "void main() {",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;",
    "}"
  ].join('\n'),
  fragmentShader: [
    "uniform vec3 vCameraPosition;",
    "uniform vec3 color;",
    "uniform float time;",
    "uniform float seed;",
    "uniform mat4 invModelMatrix;",
    "uniform vec3 scale;",

    "uniform vec4 noiseScale;",
    "uniform float magnitude;",
    "uniform float lacunarity;",
    "uniform float gain;",

    "uniform sampler2D fireTex;",

    "varying vec3 vWorldPos;",

    // GLSL simplex noise function by ashima / https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl
    // -------- simplex noise
    "vec3 mod289(vec3 x) {",
        "return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec4 mod289(vec4 x) {",
        "return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec4 permute(vec4 x) {",
        "return mod289(((x * 34.0) + 1.0) * x);",
    "}",

    "vec4 taylorInvSqrt(vec4 r) {",
        "return 1.79284291400159 - 0.85373472095314 * r;",
    "}",

    "float snoise(vec3 v) {",
        "const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);",
        "const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);",

        // First corner
        "vec3 i  = floor(v + dot(v, C.yyy));",
        "vec3 x0 = v - i + dot(i, C.xxx);",

        // Other corners
        "vec3 g = step(x0.yzx, x0.xyz);",
        "vec3 l = 1.0 - g;",
        "vec3 i1 = min(g.xyz, l.zxy);",
        "vec3 i2 = max(g.xyz, l.zxy);",

        "vec3 x1 = x0 - i1 + C.xxx;",
        "vec3 x2 = x0 - i2 + C.yyy;", // 2.0*C.x = 1/3 = C.y
        "vec3 x3 = x0 - D.yyy;",      // -1.0+3.0*C.x = -0.5 = -D.y

        // Permutations
        "i = mod289(i); ",
        "vec4 p = permute(permute(permute( ",
                "i.z + vec4(0.0, i1.z, i2.z, 1.0))",
                "+ i.y + vec4(0.0, i1.y, i2.y, 1.0)) ",
                "+ i.x + vec4(0.0, i1.x, i2.x, 1.0));",

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        "float n_ = 0.142857142857;", // 1.0/7.0
        "vec3  ns = n_ * D.wyz - D.xzx;",

        "vec4 j = p - 49.0 * floor(p * ns.z * ns.z);", //  mod(p,7*7)

        "vec4 x_ = floor(j * ns.z);",
        "vec4 y_ = floor(j - 7.0 * x_);", // mod(j,N)

        "vec4 x = x_ * ns.x + ns.yyyy;",
        "vec4 y = y_ * ns.x + ns.yyyy;",
        "vec4 h = 1.0 - abs(x) - abs(y);",

        "vec4 b0 = vec4(x.xy, y.xy);",
        "vec4 b1 = vec4(x.zw, y.zw);",

        "vec4 s0 = floor(b0) * 2.0 + 1.0;",
        "vec4 s1 = floor(b1) * 2.0 + 1.0;",
        "vec4 sh = -step(h, vec4(0.0));",

        "vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;",
        "vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;",

        "vec3 p0 = vec3(a0.xy, h.x);",
        "vec3 p1 = vec3(a0.zw, h.y);",
        "vec3 p2 = vec3(a1.xy, h.z);",
        "vec3 p3 = vec3(a1.zw, h.w);",

        //Normalise gradients
        "vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));",
        "p0 *= norm.x;",
        "p1 *= norm.y;",
        "p2 *= norm.z;",
        "p3 *= norm.w;",

        // Mix final noise value
        "vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);",
        "m = m * m;",
        "return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));",
    "}",
    // simplex noise --------

    "float turbulence(vec3 p) {",
        "float sum = 0.0;",
        "float freq = 1.0;",
        "float amp = 1.0;",
        
        "for(int i = 0; i < OCTIVES; i++) {",
            "sum += abs(snoise(p * freq)) * amp;",
            "freq *= lacunarity;",
            "amp *= gain;",
        "}",

        "return sum;",
    "}",

    "vec4 samplerFire (vec3 p, vec4 scale) {",
        "vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);",

        "if(st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);",

        "p.y -= (seed + time) * scale.w;",
        "p *= scale.xyz;",

        "st.y += sqrt(st.y) * magnitude * turbulence(p);",

        "if(st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);",
       
        "return texture2D(fireTex, st);",
    "}",

    "vec3 localize(vec3 p) {",
        "return (invModelMatrix * vec4(p, 1.0)).xyz;",
    "}",

    "void main() {",
        "vec3 rayPos = vWorldPos;",
        "vec3 rayDir = normalize(rayPos - cameraPosition);",
        "float rayLen = 0.0288 * length(scale.xyz);",

        "vec4 col = vec4(0.0);",

        "for(int i = 0; i < ITERATIONS; i++) {",
            "rayPos += rayDir * rayLen;",

            "vec3 lp = localize(rayPos);",

            "lp.y += 0.5;",
            "lp.xz *= 2.0;",
            "col += samplerFire(lp, noiseScale);",
        "}",

        "col.a = col.r;",

        "gl_FragColor = col;",
    "}"
  ].join('\n')
});

/*** CRATE EXAMPLE ***/
AFRAME.registerComponent('crate', {
  schema: {
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},
    color: {type: 'color', default: '#AAA'}
  },
  init: function () {
    var data = this.data;
    var el = this.el;

    this.tex = THREE.ImageUtils.loadTexture("/assets/textures/crate.gif");
    this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);

    //this.material = new THREE.MeshStandardMaterial({color: data.color});
    this.material = new THREE.MeshBasicMaterial( { map: this.tex } );

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(2, 2, 2);

    //this.mesh.material.wireframe = true;
    //console.log(this.mesh);

    el.setObject3D('crate-mesh', this.mesh);
  }
});


/*AFRAME.registerPrimitive('a-crate', {
  defaultComponents: {
    crate: {}
  },
  mappings: {}
});*/