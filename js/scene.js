/*** SCENE JS ***/

var fire;

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

AFRAME.registerComponent('fire', {
  schema: {
      color: {
        default: '#fff'
      },
    },

    init: function () {

      var loader = new THREE.TextureLoader();

      //var tex = THREE.ImageUtils.loadTexture("/js/lib/three.fire/Fire.png");
      var tex = loader.load( '/js/lib/three.fire/Fire.png' );

      fire = new THREE.Fire(tex);
      fire.scale.set( 3, 3, 3 );
      console.log(fire);

      this.el.setObject3D('mesh', fire);

    },
    update: function() {
      //fire.update(t);
      fire.update();
    },
    remove: function() {
      //this.el.removeObject3D('mesh');
    }
});

AFRAME.registerComponent('crate', {
  schema: {
      enabled: { default: true },
      type: { default: 'default' }
    },

    init: function () {
      var el = this.el;
    }
    
    update: function() {

      var data = this.data;
      
      //var loader = new THREE.TextureLoader();

      //var tex = loader.load( '/assets/textures/crate.gif' );

      var tex = THREE.ImageUtils.loadTexture("/assets/textures/crate.gif");
      var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
      var material = new THREE.MeshBasicMaterial( { map: tex } );
      crate = new THREE.Mesh( geometry, material );
      //this.el.setObject3D('mesh', crate);

      this.el.setObject3D(this.attrName, new THREE.Mesh( geometry, material ));

      //fire.update();
    },

});

AFRAME.registerPrimitive('a-crate', {
  defaultComponents: {
    crate: {}
  },

  mappings: {
    
  }
});