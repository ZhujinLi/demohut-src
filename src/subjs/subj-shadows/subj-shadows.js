import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const W = 800;
const H = 600;

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas-main") })
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(70, W / H);
camera.position.set(-1.2, 1.2, 1.2);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, 1);

const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper());

const ambientLight = new THREE.AmbientLight("white", 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight("white", 0.3);
pointLight.position.set(1.8, 1.4, 1.2);
pointLight.lookAt(0, 0, 0);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(1024, 1024);
scene.add(pointLight);

// const spotLight = new THREE.SpotLight("white", 0.3);
// spotLight.decay = 2;
// console.log(spotLight.decay);
// spotLight.position.set(1.8, 1.4, 1.2);
// spotLight.castShadow = true;
// spotLight.shadow.camera.fov = 90;
// spotLight.shadow.mapSize.set(2048, 2048);
// scene.add(spotLight);

const roomGeo = new THREE.BoxBufferGeometry(4, 4, 4);
const roomMtl = new THREE.MeshPhongMaterial({ color: "#fffff0", side: THREE.DoubleSide });
const roomMesh = new THREE.Mesh(roomGeo, roomMtl);
roomMesh.receiveShadow = true;
scene.add(roomMesh);

const cubeGeo = new THREE.BoxBufferGeometry(0.5, 0.5, 2);
const cubeMtl = new THREE.MeshPhongMaterial({ color: "#80c0f0" });
const cubeMesh = new THREE.Mesh(cubeGeo, cubeMtl);
cubeMesh.position.z = -1;
cubeMesh.castShadow = true;
cubeMesh.receiveShadow = true;
scene.add(cubeMesh);

const ballGeo = new THREE.SphereBufferGeometry(0.3, 30, 30);
const ballMtl = new THREE.MeshPhongMaterial({ color: "#c05000" });
const ballMesh = new THREE.Mesh(ballGeo, ballMtl);
ballMesh.position.set(0.5, 0.8, -1.5);
ballMesh.castShadow = true;
scene.add(ballMesh);

const ctrl = new OrbitControls(camera, renderer.domElement);
ctrl.enableZoom = false;

const guiOptions = {
    "shadow mapping": true
};

const gui = new dat.GUI({ autoPlace: false });
document.getElementById("gui").appendChild(gui.domElement);
gui.add(guiOptions, "shadow mapping").onChange(enableShadowMapping);

enableShadowMapping(guiOptions["shadow mapping"]);

animate(0);

function enableShadowMapping(enabled) {
    pointLight.castShadow = enabled;
}

function animate(time) {
    ballMesh.position.setZ(-1.5 + 0.5 * Math.cos(time * 0.002));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}