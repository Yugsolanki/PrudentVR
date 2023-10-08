import * as BABYLON from '@babylonjs/core';

class Scene {
  constructor() {
    this.canvas = document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.createDefaultLight(true);

    this.camera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0, 0, new BABYLON.Vector3(0, 0, -10), this.scene);
    this.camera.attachControl(this.canvas, true);
    this.camera.inputs.addMouseWheel();
    this.camera.setTarget(BABYLON.Vector3.Zero());

    this.createScene();

    this.render();
    this.resize();
    this.moveChisel();
    this.getEndVerticesOfChisel();
  }

  createScene() {
    this.boxes = [];
    this.woodDiameter = 2;
    this.woodHeight = 10;
    this.woodSegments = 100;
    this.heightOfEachSegment = this.woodHeight / this.woodSegments;

    //create the wood segment
    let x = 0 - (this.woodHeight / 2);
    for (let i = 0; i < this.woodSegments; i++) {
      const box = BABYLON.MeshBuilder.CreateCylinder('box', {diameter: this.woodDiameter, height: this.heightOfEachSegment}, this.scene);
      box.rotate(BABYLON.Axis.Z, Math.PI / 2);
      box.position.x = x;
      x += 0.1;
      // color it brown
      const boxMaterial = new BABYLON.StandardMaterial('boxMaterial', this.scene);
      boxMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
      box.material = boxMaterial;
      this.boxes.push(box);
    }

    //create a bounding box around the wood
    this.woodBoundingBox = BABYLON.MeshBuilder.CreateBox('woodBoundingBox', {width: 2, height: 10, depth: 2}, this.scene);
    this.woodBoundingBox.position = new BABYLON.Vector3(0, 0, 0);
    this.woodBoundingBox.visibility = 0;
    this.woodBoundingBox.rotate(BABYLON.Axis.Z, Math.PI / 2);

    //create the chisel
    this.chisel = BABYLON.MeshBuilder.CreateCylinder('chisel', {diameter: 0.5, height: 2, updatable: true}, this.scene);
    this.chisel.rotate(BABYLON.Axis.X, Math.PI);
    this.chisel.position = new BABYLON.Vector3(0, -3, 0);
  }

  render() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  resize() {
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  moveChisel() {
    window.addEventListener('keydown', (e) => {
      this.updateWood();
      if (e.key === 'w') {
        this.chisel.position.z += 0.1;
      } else if (e.key === 's') {
        this.chisel.position.z -= 0.1;
      } else if (e.key === 'd') {
        this.chisel.position.x += 0.1;
      } else if (e.key === 'a') {
        this.chisel.position.x -= 0.1;
      } else if (e.key === 'q') {
        this.chisel.position.y += 0.1;
      } else if (e.key === 'e') {
        this.chisel.position.y -= 0.1;
      }
    });
  }

  getDistanceBetweenWoodAndChisel() {
    //get x, y, z of chisel
    const chiselX = this.chisel.position.x;
    const chiselY = this.chisel.position.y;
    const chiselZ = this.chisel.position.z;

    //get x, y, z of wood
    const woodX = this.woodBoundingBox.position.x;
    const woodY = this.woodBoundingBox.position.y;
    const woodZ = this.woodBoundingBox.position.z;

    //get difference between chisel and wood
    const dx = chiselX - woodX;
    const dy = chiselY - woodY;
    const dz = chiselZ - woodZ;

    //get distance between chisel and wood
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) - this.woodDiameter;
    return distance;
  }

  getEndVerticesOfChisel() {
    const chiselX = this.chisel.position.x;
    const chiselY = this.chisel.position.y;
    const chiselZ = this.chisel.position.z;

    //get chisel top left and top right
    const chiselTopLeftX = chiselX - 0.25;
    const chiselTopLeftY = chiselY + 1;
    const chiselTopLeftZ = chiselZ + 0.25;
    const chiselTopRightX = chiselX + 0.25;
    const chiselTopRightY = chiselY + 1;
    const chiselTopRightZ = chiselZ + 0.25;
    
    const topLeft = new BABYLON.Vector3(chiselTopLeftX, chiselTopLeftY, chiselTopLeftZ);
    const topRight = new BABYLON.Vector3(chiselTopRightX, chiselTopRightY, chiselTopRightZ);

    return {topLeft, topRight};
  }

  getDistanceBetweenTwoPoints(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;

    const distance =  Math.sqrt(dx * dx  + dz * dz) - this.woodDiameter / 10;
    return distance;
  }

  getCollidingWoodSegments() {
    const {topLeft, topRight} = this.getEndVerticesOfChisel();
    
    let start = null;
    let end = null;
    const comparison = 0.08;

    for (let i = 0; i < this.boxes.length; i++) {
      const boxPosition = this.boxes[i].position;
      const distance = this.getDistanceBetweenTwoPoints(topLeft, boxPosition);
      if (distance < comparison) {
        start = i;
        break;
      }
    }

    for (let i = this.boxes.length - 1; i >= 0; i--) {
      const boxPosition = this.boxes[i].position;
      const distance = this.getDistanceBetweenTwoPoints(topRight, boxPosition);
      if (distance < comparison) {
        end = i;
        break;
      }
    }

    return [start, end];
  }

  updateWood() {
    const distance = this.getDistanceBetweenWoodAndChisel();
    if (distance < 0.1) {
      const [start, end] = this.getCollidingWoodSegments();
      if (start !== null && end !== null) {
        for (let i = start; i <= end; i++) {
          this.boxes[i].dispose();
        }
      }
    }
  }

  plotPoint(position) {
    //draw a point
    const point = BABYLON.MeshBuilder.CreateSphere('point', {diameter: 0.1}, this.scene);
    point.position = position;
    point.material = new BABYLON.StandardMaterial('pointMaterial', this.scene);
    point.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
  }
}


const scene = new Scene();
