/*** SCENE JS ***/

AFRAME.registerComponent('fire', {
  schema: {
    width: {type: 'number', default: 1},
    height: {type: 'number', default: 1},
    depth: {type: 'number', default: 1},
    color: {type: 'color', default: '#AAA'}
  },
  init: function () {
    var data = this.data;
    var el = this.el;

    //var loader = new THREE.TextureLoader();
    //this.tex = loader.load( '/js/lib/three.fire/Fire.png' );

    this.tex = THREE.ImageUtils.loadTexture("/js/lib/three.fire/Fire.png");

    this.fire = new THREE.Fire(this.tex);
    this.fire.scale.set( 5, 5, 5 );

    el.setObject3D('fire-mesh', this.fire);
    
  }
});

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

    // Create geometry.
    this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);

    // Create material.
    //this.material = new THREE.MeshStandardMaterial({color: data.color});
    this.material = new THREE.MeshBasicMaterial( { map: this.tex } );

    // Create mesh.
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Set mesh on entity.
    el.setObject3D('crate-mesh', this.mesh);
  }
});


/*AFRAME.registerPrimitive('a-crate', {
  defaultComponents: {
    crate: {}
  },
  mappings: {}
});*/


/*AFRAME.registerShader('sunSky', {
  schema: {
    luminance: {default: 1, max: 0, min: 2, is: 'uniform'},
    mieCoefficient: {default: 0.005, min: 0, max: 0.1, is: 'uniform'},
    mieDirectionalG: {default: 0.8, min: 0, max: 1, is: 'uniform'},
    reileigh: {default: 1, max: 0, min: 4, is: 'uniform'},
    sunPosition: {type: 'vec3', default: '0 0 -1', is: 'uniform'},
    turbidity: {default: 2, max: 0, min: 20, is: 'uniform'}
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});*/