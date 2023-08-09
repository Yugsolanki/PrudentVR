import * as BABYLON from '@babylonjs/core';

const canvas = document.getElementById('renderCanvas');

const engine =  new BABYLON.Engine(canvas, true);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  scene.createDefaultLight(true);

  // const camera = new BABYLON.UniversalCamera('UniversalCamera', new BABYLON.Vector3(0, 0, -10), scene);
  const camera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0, 0, new BABYLON.Vector3(0, 0, -10), scene);
  // camera.attachControl(canvas, true);
  // camera.inputs.addMouseWheel();
  camera.setTarget(BABYLON.Vector3.Zero());

  let boxes = []
  let x = 0 - 5;
  for (let i = 0; i < 100; i++) {
    const box = BABYLON.MeshBuilder.CreateCylinder('box', {diameter: 2, height: 0.1, updatable: true}, scene);
    box.rotate(BABYLON.Axis.Z, Math.PI / 2);
    box.position.x = x;
    x += 0.1;
    boxes.push(box);
  }
  

  const chisel = BABYLON.MeshBuilder.CreateCylinder('chisel', {diameter: 0.5, height: 2, updatable: true}, scene);
  chisel.rotate(BABYLON.Axis.X, Math.PI);
  chisel.position = new BABYLON.Vector3(0, -2, -5);

  
  //get the top of the chisel position center
  const chiselTop = chisel.getBoundingInfo().boundingBox.maximumWorld;
  console.log(chiselTop);


  //put a point at the top of the chisel
  const point = BABYLON.MeshBuilder.CreateSphere('point', {diameter: 0.1}, scene);
  point.position = new BABYLON.Vector3(0, -1, -5);

  
  

  //add event listerns to move the chisel on wsd
  window.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
      chisel.position.z += 0.1;
    } else if (e.key === 's') {
      chisel.position.z -= 0.1;
    } else if (e.key === 'd') {
      chisel.position.x += 0.1;
    } else if (e.key === 'a') {
      chisel.position.x -= 0.1;
    } else if (e.key === 'q') {
      chisel.position.y += 0.1;
    } else if (e.key === 'e') {
      chisel.position.y -= 0.1;
    }
  });

  return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});