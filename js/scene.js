/*** SCENE JS ***/

/*AFRAME.registerComponent('fire-old', {
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

      var test = new THREE.Fire(tex);
      console.log(test);

      this.el.setObject3D('mesh', new THREE.Fire( tex ));

    },
    update: function() {

    },
    remove: function() {
      //this.el.removeObject3D('mesh');
    }
});