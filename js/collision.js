var Character = Class.extend({
    // Class constructor
    init: function(args) {
        'use strict';

        this.WALK_SPEED = 4;
        this.ROTATION_SPEED = 0.03;

        // Set the different geometries composing the humanoid
        var head = new THREE.SphereGeometry(32, 16, 16),
                hand = new THREE.SphereGeometry(8, 8, 8),
                foot = new THREE.SphereGeometry(16, 4, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                nose = new THREE.SphereGeometry(4, 8, 8),
                // Set the material, the "skin"
                material = new THREE.MeshLambertMaterial(args);

        // Set the character modelisation object
        this.mesh = new THREE.Object3D();
        this.mesh.position.y = 48;

        // Set and add its head
        this.head = new THREE.Mesh(head, material);
        this.head.position.y = 0;
        this.mesh.add(this.head);

        // Set and add its hands
        this.hands = {
            left: new THREE.Mesh(hand, material),
            right: new THREE.Mesh(hand, material)
        };

        this.hands.left.position.x = -40;
        this.hands.left.position.y = -8;
        this.hands.right.position.x = 40;
        this.hands.right.position.y = -8;
        this.mesh.add(this.hands.left);
        this.mesh.add(this.hands.right);

        // Set and add its feet
        this.feet = {
            left: new THREE.Mesh(foot, material),
            right: new THREE.Mesh(foot, material)
        };

        this.feet.left.position.x = -20;
        this.feet.left.position.y = -48;
        this.feet.left.rotation.y = Math.PI / 4;
        this.feet.right.position.x = 20;
        this.feet.right.position.y = -48;
        this.feet.right.rotation.y = Math.PI / 4;
        this.mesh.add(this.feet.left);
        this.mesh.add(this.feet.right);

        // Set and add its nose
        this.nose = new THREE.Mesh(nose, material);
        this.nose.position.y = 0;
        this.nose.position.z = 32;
        this.mesh.add(this.nose);

        // dummy user for collision detection
        // is always at the users location and
        // the dummy performs all movement before the user
        // to check that a collision isn't eminent. if it is
        // the user isn't allowed to take the next step
        this.dummyMesh = new THREE.Object3D();

        // Set the vector of the current motion
        this.direction = new THREE.Vector3(0, 0, 0);

        // Set the current animation step
        this.step = 0;

        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();
    },
    // Update the direction of the current motion
    setDirection: function(controls) {
        'use strict';

        // Either left or right, and either up or down (no jump or dive (on the Y axis), so far ...)
        var x = controls.left ? 1 : controls.right ? -1 : 0,
                y = 0,
                z = controls.up ? 1 : controls.down ? -1 : 0;

        this.direction.set(x, y, z);
    },
    // Process the character motions
    motion: function() {
        'use strict';

        // Update the directions if we intersect with an obstacle
        var freeToMove = this.collision();

        // If we're not static
        if (this.controls.up || this.controls.down || this.controls.left || this.controls.right) {

            // Rotate the character
            this.rotate();

            // Move the character
            if (freeToMove) {
                this.move();
            }
        }
    },
    // Test and avoid collisions
    collision: function() {
        'use strict';

        this.dummyMesh.position.x = this.mesh.position.x;
        this.dummyMesh.position.y = this.mesh.position.y;
        this.dummyMesh.position.z = this.mesh.position.z;

        this.dummyMesh.rotation.x = this.mesh.rotation.x;
        this.dummyMesh.rotation.y = this.mesh.rotation.y;
        this.dummyMesh.rotation.z = this.mesh.rotation.z;

        if (this.controls.up) {
            this.dummyMesh.translateZ(this.WALK_SPEED);
        } else if (this.controls.down) {
            this.dummyMesh.translateZ(-this.WALK_SPEED);
        }

        // Maximum distance from the origin before we consider collision
        var distance = 64;

        // Get the obstacles array from our world
        var obstacles = basicScene.world.getObstacles();

        // We only need to check the direction we're moving
        this.caster.set(this.dummyMesh.position, new THREE.Vector3(this.dummyMesh.position.x, this.dummyMesh.position.y, this.dummyMesh.position.z));

        // Test if we intersect with any obstacle mesh
        var collisions = this.caster.intersectObjects(obstacles);

        // And disable that direction if we do
        if (collisions.length > 0 && collisions[0].distance <= distance) {
            return false;
        } else {
            return true;
        }
    },
    // Rotate the character
    rotate: function() {
        'use strict';

        if (this.controls.left) {
            this.mesh.rotation.y += this.ROTATION_SPEED;
        } else if (this.controls.right) {
            this.mesh.rotation.y -= this.ROTATION_SPEED;
        }
    },
    move: function() {
        'use strict';

        if (this.controls.up) {
            this.mesh.translateZ(this.WALK_SPEED);
        } else if (this.controls.down) {
            this.mesh.translateZ(-this.WALK_SPEED);
        }

        // Now some animation trigonometry, using our "step" property ...
        this.step += 0.25;

        // ... to slightly move our feet and hands
        this.feet.left.position.setZ(Math.sin(this.step) * 16);
        this.feet.right.position.setZ(Math.cos(this.step + (Math.PI / 2)) * 16);
        this.hands.left.position.setZ(Math.cos(this.step + (Math.PI / 2)) * 8);
        this.hands.right.position.setZ(Math.sin(this.step) * 8);
    }
});

var World = Class.extend({
    // Class constructor
    init: function(args) {
        'use strict';
        // Set the different geometries composing the room
        var ground = new THREE.PlaneGeometry(512, 1024),
                height = 128,
                walls = [
                    new THREE.PlaneGeometry(ground.height, height),
                    new THREE.PlaneGeometry(ground.width, height),
                    new THREE.PlaneGeometry(ground.height, height),
                    new THREE.PlaneGeometry(ground.width, height)
                ],
                obstacles = [
                    new THREE.CubeGeometry(64, 64, 64)
                ],
                // Set the material, the "skin"
                material = new THREE.MeshLambertMaterial(args),
                i;
        // Set the "world" modelisation object
        this.mesh = new THREE.Object3D();
        // Set and add the ground
        this.ground = new THREE.Mesh(ground, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.mesh.add(this.ground);
        // Set and add the walls
        this.walls = [];
        for (i = 0; i < walls.length; i += 1) {
            this.walls.push(new THREE.Mesh(walls[i], material));
            this.walls[i].position.y = height / 2;
            this.mesh.add(this.walls[i]);
        }
        this.walls[0].rotation.y = -Math.PI / 2;
        this.walls[0].position.x = ground.width / 2;
        this.walls[1].rotation.y = Math.PI;
        this.walls[1].position.z = ground.height / 2;
        this.walls[2].rotation.y = Math.PI / 2;
        this.walls[2].position.x = -ground.width / 2;
        this.walls[3].position.z = -ground.height / 2;
        // Set and add the obstacles
        this.obstacles = [];
        for (i = 0; i < obstacles.length; i += 1) {
            this.obstacles.push(new THREE.Mesh(obstacles[i], material));
            this.mesh.add(this.obstacles[i]);
        }
        this.obstacles[0].position.set(0, 32, 128);
    },
    getObstacles: function() {
        'use strict';
        return this.obstacles.concat(this.walls);
    }
});

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * http://ejohn.org/blog/simple-javascript-inheritance/
 */
// Inspired by base2 and Prototype
(function() {
    var initializing = false, fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function() {
    };

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] === "function" &&
                    typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                    (function(name, fn) {
                        return function() {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();