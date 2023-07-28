import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from 'three/addons/controls/DragControls.js';
import Helpers from "./helper";
import {Howl, Howler} from 'howler';

class WoodTurningMachine {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x356339 );
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    this.helpers = new Helpers();

    this.keyCodes = [37,38,39,40,87,83];
    this.initialDragSpeed = 0.030;
    this.dragSpeed = this.initialDragSpeed;
    this.woodLayersCount = 20;
    this.woodLayersRadius = this.helpers.getLayersRadius(this.woodLayersCount, 5);
    this.layerColor = this.helpers.generateShadesOfBrown(this.woodLayersCount);
    this.sound = new Howl({
      src: ['/lathe.mp3'],
      onfade: function() {
        console.log('Finished!');
        
      }
    });
    Howler.volume(0.15);

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
    // this.orbit.enablePan = false;
    this.orbit.enableRotate = false
    this.orbit.update();

    this.woodLayers = this.renderWood(20, 100, this.woodLayersCount)
    this.invisibleCylinder = this.renderBoundingBox(this.woodLayersRadius[0], 20);

    this.chiselMesh = this.renderChisel(1,5);
    this.scene.add(this.chiselMesh)
    // const controls = new DragControls( obj, this.camera, this.renderer.domElement );
    // controls.addEventListener("drag", () => {
    //   this.temp();
    // })


    this.renderer.domElement.addEventListener('pointerdown', (e)=> {this.onMouseDown(e)})
    this.renderer.domElement.addEventListener('pointermove', (e) => {this.onMouseMove(e)})
    this.renderer.domElement.addEventListener('pointerup', (e) => {this.onMouseUp(e)});

    //Start animation
    this.animate()
  }

 
  /**
   * Render wood segments
   * @param {*} height  height of the wood
   * @param {*} segmentCount  number of segments in the wood
   * @returns array of wood segments mesh, each segment is a cylinder mesh
   */
  renderWood(height = 20, segmentCount = 100) {
    const widthOfEachSegment = height / segmentCount;
    const woodLayers = [];

    let x = -height / 2;
    for (let j = 0; j < segmentCount; j++) {
      let geometry = new THREE.CylinderGeometry(
        this.woodLayersRadius[0],
        this.woodLayersRadius[0],
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

    this.woodLayers.forEach((layer) => {
      layer.rotation.x += this.dragSpeed;
    }
    );
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
      this.sound.play();
    } else {
      this.sound.pause();
    }
    if (bool) {
      this.dragSpeed = 0.0075;
      const [start, end] = this.helpers.getSegments(this.woodLayers, this.chiselMesh);
      for (let i = start; i <= end; i++) {
        let rad = this.woodLayers[i].geometry.parameters.radiusTop - (this.woodLayers[i].geometry.parameters.radiusTop - distance);
        this.woodLayers[i].geometry = new THREE.CylinderGeometry(rad, rad, 20/100)
        let color = new THREE.Color(this.layerColor[5]);
        this.woodLayers[i].material.color = color;
        // this.scene.remove(this.woodLayers[i][j]);
      }
    } else {
      this.dragSpeed = this.initialDragSpeed;
    }
  }

  onMouseUp(e) {
    this.isDragging = false;
  }

  onMouseMove(event) {
    if (this.isDragging) {
      const delta = {
        x: event.clientX - this.previousMousePosition.x,
        y: event.clientY - this.previousMousePosition.y,
      };

      this.chiselMesh.position.x += delta.x * this.dragSpeed;
      this.chiselMesh.position.y -= delta.y * this.dragSpeed;
  
      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
      this.temp(); // Call your function during dragging here
    }
  }

  onMouseDown(event) {
    this.isDragging = true;
    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

}

const WoodTurning = new WoodTurningMachine();

//Add eventlister to move the tool
document.addEventListener("keydown", function (event) {
  WoodTurning.chiselMovement(event.keyCode);
});

// Add event listeners to the renderer or container element



