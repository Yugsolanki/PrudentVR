import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from 'three/addons/controls/DragControls.js';
import Helpers from "./helper";

class WoodTurningMachine {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x356339 );
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    this.helpers = new Helpers();

    this.keyCodes = [37,38,39,40,87,83];
    this.chiselSpeed = 0.1
    this.woodLayersCount = 20;
    this.woodLayersRadius = this.helpers.getLayersRadius(this.woodLayersCount, 5);
    this.layerColor = this.helpers.generateShadesOfBrown(this.woodLayersCount);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.update();

    this.woodLayers = this.renderWood(20, 100, this.woodLayersCount)
    // console.log(this.woodLayers)
    this.invisibleCylinder = this.renderBoundingBox(this.woodLayersRadius[0], 20);

    this.chiselMesh = this.renderChisel(1,5);
    this.scene.add(this.chiselMesh)
    let obj = [this.chiselMesh]
    const controls = new DragControls( obj, this.camera, this.renderer.domElement );
    controls.addEventListener("drag", () => {
      this.temp();
    })



    //Start animation
    this.animate()
  }

  /**
   * Changes the position of the chisel
   * @param {Number} key Key Number which is being pressed
   */
  chiselMovement(key) {
    if (this.keyCodes.includes(key)) 
      this.temp(); 

    if (key == 37) 
      this.chiselMesh.position.x -= this.chiselSpeed; //left
    else if (key == 39) 
      this.chiselMesh.position.x += this.chiselSpeed; //right
    else if (key == 38)
      this.chiselMesh.position.y += this.chiselSpeed; //up
    else if (key == 40) 
      this.chiselMesh.position.y -= this.chiselSpeed; //down
    else if (key == 87) 
      this.chiselMesh.position.z += this.chiselSpeed; //w
    else if (key == 83)
      this.chiselMesh.position.z -= this.chiselSpeed; //s
  }
 
  /**
   * Render woods
   * @param {Number} height height of the wood
   * @param {Number} segmentCount number of segments in wood
   * @param {Number} woodLayersCount number of layers to wood
   * @returns woodLayers an array, all layers of wood
   */
  renderWood(height = 20, segmentCount = 100, woodLayersCount = 15) {
    const widthOfEachSegment = height / segmentCount;
    const woodSegments = [];
    const woodLayers = [];
    const woodLayersRadius = this.woodLayersRadius;

    for (let i = 0; i < woodLayersCount; i++) {
      woodSegments.length = 0;
      let x = -height / 2;
      for (let j = 0; j < segmentCount; j++) {
        let geometry = new THREE.CylinderGeometry(
          woodLayersRadius[i],
          woodLayersRadius[i],
          widthOfEachSegment
        );

        let color = this.layerColor[i];
      
        let material = new THREE.MeshBasicMaterial({color: color,wireframe: false});
        let cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(x, 0, 0);
        cylinder.rotation.z = Math.PI / 2;
        this.scene.add(cylinder);
        x += widthOfEachSegment;
        woodSegments.push(cylinder);
      }
      woodLayers[i] = [...woodSegments];
    }
    return woodLayers;
  }

  /**
   * Gives us a Bounding Box for wood
   * @param {Number} radius radius of the bounding box
   * @param {Number} height height of the bounding box
   * @returns gives a bounding box
   */
  renderBoundingBox(radius = 5, height = 10, ) {
    const boundingBoxGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const boundingBoxMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    const boundingBoxMesh = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);
    return boundingBoxMesh;
  }

  /**
   * Render Chisel
   * @param {Number} radius radius of the chisel
   * @param {Number} height height of the chisel
   * @returns chisel mesh
   */
  renderChisel(radius = 1, height = 5) {
    const chiselGeometry = new THREE.CylinderGeometry(radius,radius,height,32);
    const chiselMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
    });
    const chiselMesh = new THREE.Mesh(chiselGeometry, chiselMaterial);
    chiselMesh.position.set(0, -10, 0);
    return chiselMesh;
  }

  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * It will check if collision is happening or not and if collision is happening then it will get the segments to be deleted from the wood layer and delete it from the scene
   */
  temp() {
    const [bool, distance, depth] = this.helpers.getCollisionAndDepth(
      this.chiselMesh,
      this.invisibleCylinder
    );
    if (bool) {
      this.chiselSpeed = 0.025
      for (let i = 0; i<this.woodLayersCount; i++) {
        if (distance < this.woodLayersRadius[i]) {
          const [start, end] = this.helpers.getSegments(this.woodLayers[i], this.chiselMesh);
          for (let j = start; j <= end; j++) {
            let rad = this.woodLayers[i][j].geometry.parameters.radiusTop - distance;
            // console.log(rad)
            this.woodLayers[i][j].geometry = new THREE.CylinderGeometry(this.woodLayers[i][j].geometry.parameters.radiusTop - rad, this.woodLayers[i][j].geometry.parameters.radiusTop-rad, 20/100)
            // this.scene.remove(this.woodLayers[i][j]);
          }
        }
      }
    }
  }

}

const WoodTurning = new WoodTurningMachine();

//Add eventlister to move the tool
document.addEventListener("keydown", function (event) {
  WoodTurning.chiselMovement(event.keyCode);
});