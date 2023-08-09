import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'dat.gui'

const gui = new GUI();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(-100, 50, 0);
camera.rotation.set(0, 0, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
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
//helper



const light3 = new THREE.DirectionalLight(0xffffff, 2);
light3.position.set(-10, 70, 0);
scene.add(light3);



const loader = new GLTFLoader();


const geometry = new THREE.CylinderGeometry( 2.5, 2.5, 18, 32 );
const material = new THREE.MeshBasicMaterial( {color: 0x572202, wireframe: false } );
const cylinder = new THREE.Mesh( geometry, material );
cylinder.position.set(3.61, 42.2, 7.5);
cylinder.rotation.set(0, Math.PI/2, Math.PI/2);
scene.add( cylinder );


loader.load('/workshop_table/scene.gltf', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.scale.set(30,30,30);
    // gltf.scene.scale.set(0.1, 0.1, 0.1);
    gltf.scene.rotation.set(0, Math.PI/2, 0);

    const workshopFolder = gui.addFolder('Table');
    workshopFolder.add(gltf.scene.position, 'x', -10, 10).name('Table X');
    workshopFolder.add(gltf.scene.position, 'y', -10, 10).name('Table Y');
    workshopFolder.add(gltf.scene.position, 'z', -10, 10).name('Table Z');
    workshopFolder.add(gltf.scene.rotation, 'x', -10, 10).name('Table Rotation X');
    workshopFolder.add(gltf.scene.rotation, 'y', -10, 10).name('Table Rotation Y');
    workshopFolder.add(gltf.scene.rotation, 'z', -10, 10).name('Table Rotation Z');
    workshopFolder.add(gltf.scene.scale, 'x', 0, 50).name('Table Scale X');
    workshopFolder.add(gltf.scene.scale, 'y', 0, 50).name('Table Scale Y');
    workshopFolder.add(gltf.scene.scale, 'z', 0, 50).name('Table Scale Z');
});

loader.load('/car_garage/scene.gltf', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0);
    gltf.scene.scale.set(20,20,20);

    const garageFolder = gui.addFolder('Garage');
    garageFolder.add(gltf.scene.position, 'x', -10, 10).name('Lathe X');
    garageFolder.add(gltf.scene.position, 'y', -10, 10).name('Lathe Y');
    garageFolder.add(gltf.scene.position, 'z', -10, 10).name('Lathe Z');
    garageFolder.add(gltf.scene.rotation, 'x', -10, 10).name('Rotation X');
    garageFolder.add(gltf.scene.rotation, 'y', -10, 10).name('Rotation Y');
    garageFolder.add(gltf.scene.rotation, 'z', -10, 10).name('Rotation Z');
    garageFolder.add(gltf.scene.scale, 'x', -10, 10).name('Scale X');
    garageFolder.add(gltf.scene.scale, 'y', -10, 10).name('Scale Y');
    garageFolder.add(gltf.scene.scale, 'z', -10, 10).name('Scale Z');
});

loader.load('/lathe/scene.gltf', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.set(0, 35, -18);
    gltf.scene.scale.set(0.1,0.1,0.1);
    gltf.scene.rotation.set(0, Math.PI/2, 0);

    const latheFolder = gui.addFolder('Lathe');
    latheFolder.add(gltf.scene.position, 'x', 0, 50).name('Lathe X');
    latheFolder.add(gltf.scene.position, 'y', 0, 50).name('Lathe Y');
    latheFolder.add(gltf.scene.position, 'z', -20, 50).name('Lathe Z');
    latheFolder.add(gltf.scene.rotation, 'x', -2, 2).name('Rotation X');
    latheFolder.add(gltf.scene.rotation, 'y', -2, 2).name('Rotation Y');
    latheFolder.add(gltf.scene.rotation, 'z', -2, 2).name('Rotation Z');
    latheFolder.add(gltf.scene.scale, 'x', 0, 0.1).name('Scale X');
    latheFolder.add(gltf.scene.scale, 'y', 0, 0.1).name('Scale Y');
    latheFolder.add(gltf.scene.scale, 'z', 0, 0.1).name('Scale Z');
});




const animate = function () {
    requestAnimationFrame(animate);
    
    controls.update();
    
    renderer.render(scene, camera);
};

animate();



//Dat GUI
const woodFolder = gui.addFolder('Wood');
woodFolder.add(cylinder.position, 'x', -10, 10).name('Wood X');
woodFolder.add(cylinder.position, 'y', 0, 50).name('Wood Y');
woodFolder.add(cylinder.position, 'z', -30, 30).name('Wood Z');
woodFolder.add(cylinder.rotation, 'x', -10, 10).name('Wood Rotation X');
woodFolder.add(cylinder.rotation, 'y', -10, 10).name('Wood Rotation Y');
woodFolder.add(cylinder.rotation, 'z', -10, 10).name('Wood Rotation Z');
woodFolder.add(cylinder.scale, 'x', -10, 10).name('Wood Scale X');
woodFolder.add(cylinder.scale, 'y', -10, 10).name('Wood Scale Y');
woodFolder.add(cylinder.scale, 'z', -10, 10).name('Wood Scale Z');
woodFolder.add(geometry.parameters, 'radiusTop', 0, 10).name('Wood Radius Top');
woodFolder.add(geometry.parameters, 'radiusBottom', 0, 10).name('Wood Radius Bottom');
woodFolder.add(geometry.parameters, 'height', 0, 10).name('Wood Height');
woodFolder.open()

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'x', -100, 100).name('Camera X');
cameraFolder.add(camera.position, 'y', -50, 100).name('Camera Y');
cameraFolder.add(camera.position, 'z', -50, 100).name('Camera Z');

const lightFolder = gui.addFolder('Light');
lightFolder.add(light2.position, 'x', -50, 50).name('Light X');
lightFolder.add(light2.position, 'y', 0, 70).name('Light Y');
lightFolder.add(light2.position, 'z', 0, 50).name('Light Z');