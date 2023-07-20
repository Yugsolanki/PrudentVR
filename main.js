import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {renderWood, checkIntersectingSegments, checkIntersectionWithBoundingBox,temp,getSegments, checkIntersectionBetweenCylinder, getCylinderEndVertices} from "./helper.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 20);
camera.lookAt(0, 0, 0);


//Wood
let segments = renderWood(scene);


// Create a chisel type tool
const geometry4 = new THREE.CylinderGeometry(1, 1, 10);
const material4 = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  wireframe: true,
});
const cylinder2 = new THREE.Mesh(geometry4, material4);
cylinder2.position.set(0, -14, 0);
scene.add(cylinder2);
const bla = getCylinderEndVertices(cylinder2);
console.log(bla);


// Create a bounding box
const boundingBox = new THREE.Box3();
const radius = segments[0].geometry.parameters.radiusTop;
const height = 20;
boundingBox.setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(radius, height, radius));
boundingBox.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
const [boxMin, boxMax] = [boundingBox.min, boundingBox.max];


//Add eventlister to move the tool
document.addEventListener("keydown", function (event) {
  if (event.keyCode == 37) {
    //left
    cylinder2.position.x -= 0.1;
  } else if (event.keyCode == 39) {
    //right
    cylinder2.position.x += 0.1;
  } else if (event.keyCode == 38) {
    //up
    cylinder2.position.y += 0.1;
  } else if (event.keyCode == 40) {
    //down
    cylinder2.position.y -= 0.1;
  } else if (event.keyCode == 87) {
    //w
    cylinder2.position.z += 0.1;
  } else if (event.keyCode == 83) {
    //s
    cylinder2.position.z -= 0.1;
  }
});


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 20);
orbit.update();


function animate() {
  requestAnimationFrame(animate);
  // cylinder.rotation.x += 0.01;

  // const isIntersecting = checkIntersectionWithBoundingBox(boundingBox, cylinder2);

  const [isIntersecting2, index] = checkIntersectingSegments(segments, cylinder2);

  
  if (isIntersecting2) {
    console.log("Intersecting");
  }

  renderer.render(scene, camera);
}
animate();