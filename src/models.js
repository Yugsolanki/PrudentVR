import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'dat.gui'
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { OculusHandModel } from 'three/addons/webxr/OculusHandModel.js';
import { OculusHandPointerModel } from 'three/addons/webxr/OculusHandPointerModel.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
// import {VRButton} from './VRControls.js';

// const gui = new GUI();

let camera, scene, renderer;
let hand1, hand2;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let currentSession = null;
let controls;

// function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
    //camera.position.set(-1787, 575, 0);
    camera.position.set(-900, 700, 0);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableRotate = true;

    const light = new THREE.AmbientLight(0xffffff, 1); // soft white light
    scene.add(light);

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

    const geometry = new THREE.CylinderGeometry( 32.5, 32.5, 234, 416 );
    const material = new THREE.MeshBasicMaterial( {color:0x572202, wireframe: true} );
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(46.9, 565, 100);
    cylinder.rotation.set(0, Math.PI/2, Math.PI/2);
    scene.add( cylinder );


    // Controllers
    controller1 = renderer.xr.getController(0);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();
    const handModelFactory = new XRHandModelFactory();

    hand1 = renderer.xr.getHand(0);
    hand1.add(handModelFactory.createHandModel(hand1));
    scene.add(hand1);

    hand2 = renderer.xr.getHand(1);
    hand2.add(handModelFactory.createHandModel(hand2));
    scene.add(hand2);

    // 
    const geometry1 = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( -900, 700, 0 ), new THREE.Vector3( -900, 700, - 1 ) ] );
	const line = new THREE.Line( geometry1 );
	line.name = 'line';
	line.scale.z = 5;
    controller1.add( line.clone() );
    controller2.add( line.clone() );

    window.addEventListener( 'resize', onWindowResize );
// }



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
    controls.update();
    renderer.render(scene, camera);
}

const animate = function () {
    renderer.setAnimationLoop(render);
};


function checkVR(navigator) {
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            if (supported) {
                console.log('VR supported');
                EnterVR()
            } else {
                console.log('VR not supported');
            }
        });
    } else {
        if (window.isSecureContext === false) {
            console.log('WebXR needs HTTPS');
        } else {
            console.log('WebXR not supported');
        }
    }
}



function EnterVR() {
    let sessionInit = {optionalFeatures: ['local-floor']};
    navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
}

function onSessionStarted(session) {
    session.addEventListener('end', onSessionEnded);
    renderer.xr.setSession(session);
    currentSession = session;
}

function onSessionEnded(event) {
    currentSession.removeEventListener('end', onSessionEnded);
    currentSession = null;
}

var VRButtons = {
    createButton: function(renderer, options) {
        if (options && options.referenceSpaceType) {
            renderer.xr.setReferenceSpaceType(options.referenceSpaceType);
        }
    }
}

const vrEnter = document.getElementById('vr-enter');
const vrExit = document.getElementById('vr-exit');
vrExit.classList.add('hide');

vrEnter.addEventListener('click', () => {
    vrEnter.classList.add('hide');
    vrExit.classList.remove('hide');
    checkVR(navigator)
});

vrExit.addEventListener('click', () => {
    vrExit.classList.add('hide');
    vrEnter.classList.remove('hide');
});


// init();
animate();

export {renderer, scene, camera, controls, VRButtons};