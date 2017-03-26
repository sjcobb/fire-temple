/*** SCENE JS ***/

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