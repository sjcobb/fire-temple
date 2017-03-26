/*** SCENE JS ***/

/*AFRAME.registerComponent('lost', {
  schema: {
      color: {
        default: '#000'
      },
    },

    update: function() {

      var wallTexture = loader.load( 'assets/textures/lost-wall.png' );

      var material = new THREE.MeshBasicMaterial({
        color: this.data.color,
        map: wallTexture, 
        side: THREE.DoubleSide
      });

      var geometry = new THREE.PlaneGeometry(100, 50, 1, 1);

      this.el.setObject3D('mesh', new THREE.Mesh(geometry, material));
    },

    remove: function() {
      this.el.removeObject3D('mesh');
    }
});*/

AFRAME.registerComponent('fire', {
  schema: {

  },
  init: function () {
    console.log("init fire");

    VolumetricFire.texturePath = '../textures/fire';

    var fireWidth  = 2;
    var fireHeight = 4;
    var fireDepth  = 2;
    var sliceSpacing = 0.5;

    var fire = new VolumetricFire(
      fireWidth,
      fireHeight,
      fireDepth,
      sliceSpacing,
      camera
    );

    this.el.setObject3D('mesh', new THREE.Mesh(fire.geometry, fire.material));

  },
  update: function () {

  },
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});