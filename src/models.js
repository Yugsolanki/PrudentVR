import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'dat.gui'

const gui = new GUI();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
//camera.position.set(-1787, 575, 0);
camera.position.set(-900, 700, 0);
camera.rotation.set(0, 0, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = true;
controls.enableRotate = true;

// const light = new THREE.AmbientLight(0xffffff, 1); // soft white light
// scene.add(light);

const light2 = new THREE.HemisphereLight( 0xfffff6, 0x080820, 1 );
light2.position.set(0, 70, 0);
scene.add( light2 );

const light3 = new THREE.DirectionalLight(0xffffff, 2);
light3.position.set(-10, 70, 0);
scene.add(light3);

const loader = new GLTFLoader();

loader.load('/car_garage/scene.gltf', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.scale.set(260,260,260);
});

loader.load('/workshop_table/scene.gltf', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 20, 0);
    gltf.scene.scale.set(390,390,390);
    gltf.scene.rotation.set(0, Math.PI/2, 0);
});

loader.load('/lathe/scene.gltf', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 470, -230);
    gltf.scene.scale.set(1.3,1.3,1.3);
    gltf.scene.rotation.set(0, Math.PI/2, 0);
});

const animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};
animate();


const geometry = new THREE.CylinderGeometry( 32.5, 32.5, 234, 416 );
const material = new THREE.MeshBasicMaterial( {color:0x572202, wireframe: true} );
const cylinder = new THREE.Mesh( geometry, material );
cylinder.position.set(46.9, 565, 100);
cylinder.rotation.set(0, Math.PI/2, Math.PI/2);
scene.add( cylinder );