import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Helpers from "./helper";
import {Howl, Howler} from 'howler';

class Wood {
  constructor() {

  }
}

class WoodTurningMachine {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x356339 );
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    this.helpers = new Helpers();

    this.button = document.createElement('button');
    this.button.innerHTML = 'Sound On';
    this.button.style.position = 'absolute';
    this.button.style.top = '10px';
    this.button.style.left = '10px';
    this.button.style.zIndex = 1;
    this.button.addEventListener('click', () => {
      this.soundOn = !this.soundOn;
      if(this.soundOn) {
        this.button.innerHTML = 'Sound Off';
      } else {
        this.sound.stop();
        this.button.innerHTML = 'Sound On';
      }
    });
    document.body.appendChild(this.button);

    //CONTANTS
    this.keyCodes = [37,38,39,40,87,83];
    this.initialDragSpeed = 0.030;
    this.dragSpeed = this.initialDragSpeed;
    this.woodLayersCount = 20;
    this.woodWidth = 20;
    this.woodHeight = 5;
    this.woodLayersRadius = this.helpers.getLayersRadius(this.woodLayersCount, 5);
    this.layerColor = this.helpers.generateShadesOfBrown(this.woodLayersCount);
    this.soundOn = false;
    this.sound = new Howl({
      src: ['/lathe.mp3'],
      loop: true,
      onfade: function() {
        console.log('Finished!');
        
      }
    });
    Howler.volume(0.10);
    this.previousChiselPosition = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.previousRadius = Array(100).fill(5);

    //Mouse control
    this.isDragging = false,
    this.previousMousePosition = {
      x: 0, 
      y: 0
    }

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    // this.orbit.enablePan = false; //enable it for panning
    this.orbit.enableRotate = false
    this.orbit.update();

    this.woodLayers = this.renderWood(this.woodWidth, 100, this.woodHeight)
    this.invisibleCylinder = this.renderBoundingBox(this.woodLayersRadius[0], 20);

    this.chiselMesh = this.renderChisel(1,5);
    this.scene.add(this.chiselMesh)

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
        widthOfEachSegment
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
   * Temporary function, it will change the color of the wood layer in contact with the chisel
   */
  temp() {
    const [bool, distance, depth] = this.helpers.getCollisionAndDepth(
      this.chiselMesh,
      this.invisibleCylinder
    );
    
    if (distance < 6.0) {
      if (this.soundOn) 
        this.sound.play();
    } else {
      this.sound.pause();
    }
    
    if (bool) {
      this.dragSpeed = 0.0075;
      const [start, end] = this.helpers.getSegments(this.woodLayers, this.chiselMesh);
      for (let i = start; i <= end; i++) {
        let rad = this.woodLayers[i].geometry.parameters.radiusTop - (this.woodLayers[i].geometry.parameters.radiusTop - (distance));
        if (rad < 0) rad = 0;

        if (rad > this.previousRadius[i]) rad = this.previousRadius[i];
        this.previousRadius[i] = rad;
        this.woodLayers[i].geometry = new THREE.CylinderGeometry(rad, rad, 20/100)
        let color = new THREE.Color(this.layerColor[5]);
        this.woodLayers[i].material.color = color;
        // this.scene.remove(this.woodLayers[i][j]);

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
      if (this.chiselMesh.position.x > this.woodWidth/2 + 10) {
        this.chiselMesh.position.x = this.woodWidth/2 + 10
      } else if (this.chiselMesh.position.x < -this.woodWidth/2 - 10) {
        this.chiselMesh.position.x = -this.woodWidth/2 - 10
      }

      // Limit the chisel movement, so that it does not go beyond the wood center 
      if (this.chiselMesh.position.y > -2.5) {
        this.chiselMesh.position.y = -2.5
      }

      // it will update the previous mouse position to the current mouse position
      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
      this.temp(); // Call your function during dragging here
    }
  }

  /**
   * Function to handle mouse down event, it will set the isDragging flag to true and store the current mouse position to the previous mouse position
   * @param {PointerEvent} event
  */
  onMouseDown(event) {
    this.isDragging = true;
    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  mute() {
    this.soundOn = !this.soundOn;
  }

}

const WoodTurning = new WoodTurningMachine();
