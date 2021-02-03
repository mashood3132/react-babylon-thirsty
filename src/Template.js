/* Babylon JS is available as **npm** package.  
You can easily build a simple `React` Component around a `canvas` and Babylon JS
I have created a minimal example with React+ Babylon:
 */
import React, { Component } from "react";
import * as BABYLON from "babylonjs";

var scene;
var boxMesh;
const GROUND_SIZE = 60;
var lastClickedMesh = null;
var shadowGenerator;
/**
 * Example temnplate of using Babylon JS with React
 */
class BabylonScene extends Component {
  constructor(props) {
    super(props);
    this.state = { useWireFrame: false, shouldAnimate: false };
  }

  componentDidMount = () => {
    // start ENGINE
    this.engine = new BABYLON.Engine(this.canvas, true);

    //Create Scene
    scene = new BABYLON.Scene(this.engine);

    //create Physics Engine
    var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    scene.enablePhysics(gravityVector, new BABYLON.AmmoJSPlugin());

    //--Light---
    this.addLight();

    //--Camera---
    this.addCamera();

    //--Meshes---
    this.addModels();

    //--Ground---
    this.addGround();

    // Add Events
    window.addEventListener("resize", this.onWindowResize, false);

    // Render Loop
    this.engine.runRenderLoop(() => {
      scene.render();
    });

    //Animation
    scene.registerBeforeRender(() => {
      //boxMesh.rotation.y += 0.01;
      //boxMesh.rotation.x += 0.01;

      scene.meshes.forEach(mesh => {
        if (mesh.name === "s" && mesh.position.y < 0) {
          mesh.position.y = 30;
          mesh.position.x = Math.random() * GROUND_SIZE - GROUND_SIZE / 2;
          mesh.position.z = Math.random() * GROUND_SIZE - GROUND_SIZE / 2;

          //this.createBall();
        }
      });
    });

    var h1 = new BABYLON.HighlightLayer("hl", scene);

    scene.onPointerObservable.add(evt => {
      if (evt.pickInfo.hit && evt.pickInfo.pickedMesh !== undefined) {
        let mesh = evt.pickInfo.pickedMesh;
        if (mesh && mesh.name === "s") {
          if (lastClickedMesh) {
            // console.log("unhighlighting", lastClickedMesh);
            h1.removeMesh(lastClickedMesh);
          }
          lastClickedMesh = mesh;
          h1.addMesh(lastClickedMesh, BABYLON.Color3.Green());

          mesh.applyImpulse(
            new BABYLON.Vector3(
              Math.random() * 10,
              Math.random() * 10,
              Math.random() * 10
            ),
            mesh.position
          );
        }
      }
    }, BABYLON.PointerEventTypes.POINTERDOWN);

    // this.canvas.addEventListener("pointerdown", this.onPointerDown, false);
    //this.canvas.addEventListener("pointerup", this.onPointerUp, false);
    //this.canvas.addEventListener("pointermove", this.onPointerMove, false);

    // scene.onDispose = () => {
    //   //this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    //   this.canvas.removeEventListener("pointerup", this.onPointerUp);
    //   //this.canvas.removeEventListener("pointermove", this.onPointerMove);
    // };
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize, false);
  }

  shootBullet = (position, velocity) => {
    let ballMaterial = new BABYLON.StandardMaterial("cover", scene);
    ballMaterial.diffuseTexture = new BABYLON.Texture("./assets/ball.png");
    var ballMesh = BABYLON.Mesh.CreateSphere("s", 8, 4, scene);
    ballMesh.position = position; // new BABYLON.Vector3(2, 3, 4);
    ballMesh.material = ballMaterial;
    ballMesh.position.copyFrom(position);
    //PHysics
    ballMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      ballMesh,
      BABYLON.PhysicsImpostor.SphereImpostor,
      { mass: 0.5, restitution: 2.2 },
      scene
    );
    ballMesh.physicsImpostor.setLinearVelocity(velocity);
  };

  onWindowResize = event => {
    this.engine.resize();
  };

  /**
   * Add Lights
   */
  addLight = () => {
    //---------- LIGHT---------------------
    // Create a basic light, aiming 0,1,0 - meaning, to the sky.
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 10, 0),
      scene
    );
    var dirLight = new BABYLON.DirectionalLight(
      "dir02",
      new BABYLON.Vector3(0.2, -1, 0),
      scene
    );
    light.position = new BABYLON.Vector3(0, 80, 0);

    shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
  };

  /**
   * Add Camera
   */
  addCamera = () => {
    // ---------------ArcRotateCamera or Orbit Control----------
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 4,
      4,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.inertia = 0;
    camera.angularSensibilityX = 250;
    camera.angularSensibilityY = 250;

    // This attaches the camera to the canvas
    camera.attachControl(this.canvas, true);
    new BABYLON.Vector3(GROUND_SIZE / 2, GROUND_SIZE / 3, GROUND_SIZE / 2);
  };

  /**
   * Create Stage and Skybox
   */
  addGround = () => {
    var groundMaterial = new BABYLON.StandardMaterial("grass0", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "./assets/ground.jpeg",
      scene
    );

    var groundMesh = BABYLON.MeshBuilder.CreateBox(
      "ground",
      { width: GROUND_SIZE, depth: GROUND_SIZE, height: 2 },
      scene
    );
    groundMesh.material = groundMaterial;
    groundMesh.receiveShadows = true;
    groundMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      groundMesh,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 0.5, restitution: 0.2 },
      scene
    );

    //Add SkyBox
    var photoSphere = BABYLON.Mesh.CreateSphere("skyBox", 16.0, 500.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("smat", scene);
    skyboxMaterial.emissiveTexture = new BABYLON.Texture(
      "assets/skybox.jpeg",
      scene,
      1,
      0
    );
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.emissiveTexture.uOffset = -Math.PI / 2; // left-right
    skyboxMaterial.emissiveTexture.uOffset = 0.1; // up-down
    skyboxMaterial.backFaceCulling = false;
    photoSphere.material = skyboxMaterial;
  };

  /**
   * Add Models
   */
  addModels = () => {
    // Add BOX
    boxMesh = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 4, width: 5, depth: 8 },
      scene
    );
    boxMesh.position.y = 5;

    var boxMaterial = new BABYLON.StandardMaterial("wood", scene);
    boxMaterial.diffuseTexture = new BABYLON.Texture(
      "./assets/portal_cube.png",
      scene
    );
    boxMesh.material = boxMaterial;
    boxMesh.forceSharedVertices();
    boxMesh.increaseVertices(15);
    boxMesh.receiveShadows = true;

    // Add Box Physics
    boxMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      boxMesh,
      BABYLON.PhysicsImpostor.SoftbodyImpostor,
      { mass: 15, friction: 0.5, restitution: 0, margin: 0.15 },
      scene
    );
    boxMesh.physicsImpostor.pressure = 40000;
    boxMesh.physicsImpostor.velocityIterations = 10;
    boxMesh.physicsImpostor.positionIterations = 10;
    boxMesh.physicsImpostor.stiffness = 1;

    shadowGenerator.addShadowCaster(boxMesh);

    //Add Cloath
    var cover = new BABYLON.StandardMaterial("cover", scene);
    cover.diffuseTexture = new BABYLON.Texture(
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/VichyKaro.png"
    );
    cover.backFaceCulling = false;

    var clothMesh = BABYLON.MeshBuilder.CreateGround(
      "plane",
      { width: 10, height: 10, subdivisions: 25 },
      scene
    );
    clothMesh.position.y = 10;
    clothMesh.position.z = 5;
    clothMesh.material = cover;

    clothMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      clothMesh,
      BABYLON.PhysicsImpostor.ClothImpostor,
      {
        mass: 1,
        friction: 0.1,
        restitution: 0,
        margin: 0.25,
        damping: 0.01,
        fixedPoints: 3
      },
      scene
    );
    clothMesh.physicsImpostor.velocityIterations = 10;
    clothMesh.physicsImpostor.positionIterations = 10;
    clothMesh.physicsImpostor.stiffness = 0.5;
    shadowGenerator.addShadowCaster(clothMesh);

    //Add Hinge
    var wood = new BABYLON.StandardMaterial("wood", scene);
    wood.diffuseTexture = new BABYLON.Texture("/assets/wood.jpeg");

    //Base
    var base = BABYLON.MeshBuilder.CreateBox(
      "base",
      { width: 6, depth: 6, height: 3 },
      scene
    );
    base.position = new BABYLON.Vector3(-26, 2, -9);
    base.material = wood;
    base.physicsImpostor = new BABYLON.PhysicsImpostor(
      base,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 0, restitution: 0 },
      scene
    );

    //Column
    var upright = BABYLON.MeshBuilder.CreateBox(
      "upright",
      { width: 3, depth: 3, height: 24 },
      scene
    );
    upright.position = new BABYLON.Vector3(-26, 15, -9);
    upright.material = wood;
    upright.physicsImpostor = new BABYLON.PhysicsImpostor(
      upright,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 0, restitution: 0 },
      scene
    );

    //Arm
    var arm = BABYLON.MeshBuilder.CreateBox(
      "arm",
      { width: 30, depth: 1, height: 1 },
      scene
    );
    arm.position = new BABYLON.Vector3(-15, 27.5, -9);
    arm.material = wood;
    arm.physicsImpostor = new BABYLON.PhysicsImpostor(
      arm,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 10, friction: 0, restitution: 0 },
      scene
    );

    let joint = new BABYLON.HingeJoint({
      mainPivot: new BABYLON.Vector3(0, 12.5, 0),
      connectedPivot: new BABYLON.Vector3(15, 0, 0),
      mainAxis: new BABYLON.Vector3(0, 1, 0),
      connectedAxis: new BABYLON.Vector3(0, 1, 0)
    });

    // add the main body and joint to the connected axle
    upright.physicsImpostor.addJoint(arm.physicsImpostor, joint);
    joint.setMotor(0.5, 100);

    var nbPoints = 10;
    let myPoints = [];
    for (var i = 0; i < nbPoints; i++) {
      myPoints.push(
        new BABYLON.Vector3(-25, 26.8, -9),
        new BABYLON.Vector3(-25, 26.5 - (22 * i) / nbPoints, -9)
      );
    }

    //Create Ropes
    var rope = BABYLON.MeshBuilder.CreateLines(
      "lines",
      { points: myPoints },
      scene
    );
    rope.color = BABYLON.Color3.Black();

    rope.physicsImpostor = new BABYLON.PhysicsImpostor(
      rope,
      BABYLON.PhysicsImpostor.RopeImpostor,
      { mass: 1 },
      scene
    );
    rope.physicsImpostor.velocityIterations = 10;
    rope.physicsImpostor.positionIterations = 10;
    rope.physicsImpostor.stiffness = 5;

    rope.physicsImpostor.addHook(arm.physicsImpostor, 0, 1);

    var blackMat = new BABYLON.StandardMaterial("blackMat", scene);
    blackMat.diffuseColor = BABYLON.Color3.Black();

    var sphere = BABYLON.MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 5, segments: 12 },
      scene
    );
    sphere.position = new BABYLON.Vector3(-25, 5, -9);
    sphere.material = blackMat;

    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
      sphere,
      BABYLON.PhysicsImpostor.SphereImpostor,
      { mass: 10 },
      scene
    );

    rope.physicsImpostor.addHook(sphere.physicsImpostor, 1, 1);
    shadowGenerator.addShadowCaster(sphere);

    var impulseDirection = new BABYLON.Vector3(0, 0, -1);
    var impulseMagnitude = 25;
    sphere.physicsImpostor.applyImpulse(
      impulseDirection.scale(impulseMagnitude),
      sphere.getAbsolutePosition()
    );

    for (var ii = 0; ii < 15; ii++) {
      this.createBall();
    }

    var box;
    var bmat;

    var row, col;
    for (row = 1; row < 7; row++) {
      for (col = -5; col < 6; col++) {
        box = BABYLON.MeshBuilder.CreateBox(
          "s",
          { height: 2, width: 2, depth: 2 },
          scene
        );

        box.position.x = -10;
        box.position.y = row * 2 + 0.2 * row;
        box.position.z = col * 2 + 0.2 * col;
        // box.setPosition(new BABYLON.Vector3(-20 + col * 2, row * 2.1, 30));
        bmat = new BABYLON.StandardMaterial("wood", scene);
        // bmat.diffuseTexture = new BABYLON.Texture("textures/misc.jpg", scene);
        box.material = bmat;
        box.physicsImpostor = new BABYLON.PhysicsImpostor(
          box,
          BABYLON.PhysicsImpostor.BoxImpostor,
          { mass: 1, restitution: 0, friction: 1, move: false },
          scene
        );
      }
    }
  };

  createBall = () => {
    var ballMaterial = new BABYLON.StandardMaterial("cover", scene);
    ballMaterial.diffuseTexture = new BABYLON.Texture("./assets/ball.png");

    // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    var ballMesh = BABYLON.Mesh.CreateSphere("s", 8, 4, scene);

    // Move the sphere upward 1/2 its height
    ballMesh.position.y = 30;
    ballMesh.position.x = Math.random() * GROUND_SIZE - GROUND_SIZE / 2;
    ballMesh.position.z = Math.random() * GROUND_SIZE - GROUND_SIZE / 2;
    ballMesh.material = ballMaterial;

    ballMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      ballMesh,
      BABYLON.PhysicsImpostor.SphereImpostor,
      { mass: 0.5, restitution: 2.2 },
      scene
    );
  };

  render() {
    return (
      <canvas
        style={{ width: window.innerWidth, height: window.innerHeight }}
        ref={canvas => {
          this.canvas = canvas;
        }}
      />
    );
  }
}
export default BabylonScene;
