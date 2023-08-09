import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {Howl, Howler} from 'howler';
import Helpers from "./helpers";

class WoodTurningMachine {
  constructor() {
    //Initialize scene, camera, renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x356339 );
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    //Helpers class
    this.helpers = new Helpers();

    //CONTANTS
    //Drag speed constants
    this.initialDragSpeed = 0.030;
    this.dragSpeed = this.initialDragSpeed;

    //Wood constants
    this.woodLayersCount = 20;
    this.woodHeight = 20;
    this.woodRadius = 5;
    this.layerColor = this.helpers.generateShadesOfBrown(this.woodLayersCount);

    //Sound
    this.soundOn = true;
    this.sound = new Howl({
      src: ['./lathe.mp3'],
      loop: true,
      volume: 0.5,
    });

    //Chisel constants
    this.previousChiselPosition = {x: 0,y: 0,z: 0}; //previous chisel position
    this.previousRadius = Array(100).fill(5); //initial radius of each wood layer is 5

    //Mouse control
    this.isDragging = false,
    this.previousMousePosition = {
      x: 0, 
      y: 0
    }


    //Render wood, bounding box and chisel
    this.woodLayers = this.renderWood(this.woodHeight, 100, this.woodRadius)
    this.invisibleCylinder = this.renderBoundingBox(this.woodRadius, this.woodHeight);
    this.chiselMesh = this.renderChisel(1,5);


    //Initialize renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    //Initialize orbit controls
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    // this.orbit.enablePan = false; //enable it for panning
    this.orbit.enableRotate = false
    this.orbit.update();

    //Add event listeners
    this.renderer.domElement.addEventListener('pointerdown', (e)=> {this.onMouseDown(e)})
    this.renderer.domElement.addEventListener('pointermove', (e) => {this.onMouseMove(e)})
    this.renderer.domElement.addEventListener('pointerup', () => {this.onMouseUp()});

    //Start animation
    this.animate()
  }

 
  /**
   * Render wood segments
   * @param {*} height  height of the wood
   * @param {*} segmentCount  number of segments in the wood
   * @returns array of wood segments mesh, each segment is a cylinder mesh
   */
  renderWood(height = 20, segmentCount = 100, radius = 5) {
    const widthOfEachSegment = height / segmentCount;
    const woodLayers = [];
    let x = -height / 2;
    for (let j = 0; j < segmentCount; j++) {
      let geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        widthOfEachSegment,
        32
      );
      let color = this.layerColor[0];
      let material = new THREE.MeshBasicMaterial({color: color,wireframe: false});
      let cylinder = new THREE.Mesh(geometry, material);
      cylinder.position.set(x, 0, 0);
      cylinder.rotation.z = Math.PI / 2;
      this.scene.add(cylinder);
      x += widthOfEachSegment;
      woodLayers.push(cylinder);
    }
    return woodLayers;
  }

  /**
   * Render bounding box of wood mesh
   * @param {Number} radius  radius of the bounding box
   * @param {Number} height  height of the bounding box
   * @returns  bounding box mesh
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
    this.scene.add(chiselMesh);
    return chiselMesh;
  }

  /**
   * Animation function, it will render the scene
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * It will check if the chisel is in contact with the wood, if yes then it will update the wood layers and sound accordingly,
   * else it will update the chisel position radius and drag speed, also it will update the previous chisel position and radius array accordingly 
   */
  updateWoodAndSound() {
    const [collision, distance, depth] = this.helpers.getCollisionAndDepth(
      this.chiselMesh,
      this.invisibleCylinder
    );
  
    // If collision is true, then play the sound, else pause the sound
    this.soundOn ? (distance < 6.0 ? this.sound.play() : this.sound.pause()) : this.sound.pause();
  
    //If collision is true, then change the color of the wood layer in contact with the chisel, also change the radius of the wood layer
    if (collision) {
      this.dragSpeed = 0.0075; //reduce the drag speed
      const [start, end] = this.helpers.getSegments(this.woodLayers, this.chiselMesh);
      for (let i = start; i <= end; i++) {
        let rad = this.woodLayers[i].geometry.parameters.radiusTop - (this.woodLayers[i].geometry.parameters.radiusTop - distance);
        this.woodLayers[i].geometry = new THREE.CylinderGeometry(Math.max(rad, 0), Math.max(rad, 0), 20/100);
        this.woodLayers[i].material.color = new THREE.Color(this.layerColor[5]);
      }
    } else {
      this.dragSpeed = this.initialDragSpeed;
    }
    this.previousChiselPosition.x = this.chiselMesh.position.x;
  }  

  /**
   * Function to handle mouse down event, it will set the isDragging flag to false
  */
  onMouseUp() {
    this.isDragging = false;
  }

  /**
   * Function to handle mouse down event, it will set the isDragging flag to true and store the previous mouse position, so that we can calculate the delta between the current mouse position and the previous mouse position, and move the chisel accordingly 
   * @param {PointerEvent} event 
   */
  onMouseMove(event) {
    if (this.isDragging) {
      // Calculate the delta between the current mouse position and the previous mouse position 
      const delta = {
        x: event.clientX - this.previousMousePosition.x,
        y: event.clientY - this.previousMousePosition.y,
      };

      // Move the chisel mesh according to the mouse movement 
      this.chiselMesh.position.x += delta.x * this.dragSpeed;
      this.chiselMesh.position.y -= delta.y * this.dragSpeed;

      // Limit the chisel movement, so that it does not go out of the wood mesh 
      if (this.chiselMesh.position.x > this.woodWidth/2 + 10) 
        this.chiselMesh.position.x = this.woodWidth/2 + 10 //
      else if (this.chiselMesh.position.x < -this.woodWidth/2 - 10) 
        this.chiselMesh.position.x = -this.woodWidth/2 - 10

      // Limit the chisel movement, so that it does not go beyond the wood center 
      if (this.chiselMesh.position.y > -2.5) 
        this.chiselMesh.position.y = -2.5

      // it will update the previous mouse position to the current mouse position
      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
      this.updateWoodAndSound(); // Call your function during dragging here
    }
  }

  /**
   * Function to handle mouse down event, it will set the isDragging flag to true and store the current mouse position to the previous mouse position
   * @param {PointerEvent} event
  */
  onMouseDown(event) {
    this.isDragging = true;
    this.previousMousePosition = {x: event.clientX,y: event.clientY,};
  }

}

const WoodTurning = new WoodTurningMachine();
