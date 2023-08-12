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

    this.woodDiameter = 2;
    this.woodHeight = 10;
    this.woodSegments = 100;
    this.heightOfEachSegment = this.woodHeight / this.woodSegments;

    this.boxes = [];
    this.chisel = null;
    this.point = null;
    this.createScene();

    this.render();
    this.resize();
    this.moveChisel();
    this.getPoint();
  }

  createScene() {
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

    //create the chisel
    this.chisel = BABYLON.MeshBuilder.CreateCylinder('chisel', {diameter: 0.5, height: 2, updatable: true}, this.scene);
    this.chisel.rotate(BABYLON.Axis.X, Math.PI);
    this.chisel.position = new BABYLON.Vector3(0, -2, -3);
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
      this.getDistanceBetweenWoodAndChisel();
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
    const woodX = this.boxes[49].position.x;
    const woodY = this.boxes[49].position.y - (this.woodDiameter / 2);
    const woodZ = this.boxes[49].position.z;

    const dx = chiselX - woodX;
    const dy = chiselY - woodY;
    const dz = chiselZ - woodZ;

    //get distance between chisel and wood
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    console.log(distance);
    return distance;
  }

  getPoint() {
    //put a point at the top of the chisel
    this.point = BABYLON.MeshBuilder.CreateSphere('point', {diameter: 0.1}, this.scene);
    this.point.position = new BABYLON.Vector3(0, -1, -3); //y = height of chisel / 2, z = z of chisel
  }
}


const scene = new Scene();
