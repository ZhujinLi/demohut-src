// After extensive research, I've found that core three.js doesn't provide high quality soft shadows,
// even with PCFSoftShadowMap (it uses PCF for anti-aliasing purpose). So I refer to this third-party
// PCSS implementation with customized shader: https://threejs.org/examples/webgl_shadowmap_pcss.html

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import pcss from "./pcss.inject.frag";

const W = 800;
const H = 450;

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas-main") })
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(30, W / H);
camera.position.set(1.7, 18, -1.6);
camera.up.set(0, 1, 0);

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(10));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 0.9);
light.position.set(2, 8, 4);
light.lookAt(-100, -100, 100);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
light.shadow.camera.top = light.shadow.camera.right = 10;
light.shadow.camera.left = light.shadow.camera.bottom = -10;
light.shadow.camera.far = 20;
scene.add(light);
scene.add(new THREE.CameraHelper(light.shadow.camera));

const ballGeo = new THREE.SphereBufferGeometry(0.5, 30, 30);
const ballMtl = new THREE.MeshPhongMaterial({ color: "#e07000" });
const ball = new THREE.Mesh(ballGeo, ballMtl);
ball.position.set(1.5, 0, -4.5);
ball.castShadow = true;
scene.add(ball);

const loader = new THREE.TextureLoader();
const texture = loader.load('./checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.repeat.set(10000, 10000);

const groundGeo = new THREE.PlaneBufferGeometry(20000, 20000, 8, 8);
const groundMtl = new THREE.MeshPhongMaterial({ specular: 0x222222, map: texture });
const ground = new THREE.Mesh(groundGeo, groundMtl);
ground.rotation.x = - Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const columnGeo = new THREE.BoxBufferGeometry(1, 4, 1);
const columnMtl = new THREE.MeshPhongMaterial({ color: 0x4080c0 });
const column = new THREE.Mesh(columnGeo, columnMtl);
column.position.y = 2;
column.castShadow = true;
column.receiveShadow = true;
scene.add(column);

const wallGeo = new THREE.BoxBufferGeometry(10, 3, 0.1);
const wallMtl = new THREE.MeshPhongMaterial({ color: 0xa0ffa0 });
const wall = new THREE.Mesh(wallGeo, wallMtl);
wall.receiveShadow = true;
wall.castShadow = true;
wall.position.set(0, 1.5, -7);
scene.add(wall);

const wall2Geo = new THREE.BoxBufferGeometry(10, 3, 0.1);
const wall2Mtl = new THREE.MeshPhongMaterial({ color: 0xa0ffa0 });
const wall2 = new THREE.Mesh(wall2Geo, wall2Mtl);
wall2.receiveShadow = true;
wall2.castShadow = true;
wall2.position.set(-2.5, 1.5, -5);
wall2.rotateY(Math.PI / 2);
scene.add(wall2);

// overwrite shadowmap code
{
    let shader = THREE.ShaderChunk.shadowmap_pars_fragment;
    shader = shader.replace(
        '#ifdef USE_SHADOWMAP',
        '#ifdef USE_SHADOWMAP' + pcss
    );
    shader = shader.replace(
        '#if defined( SHADOWMAP_TYPE_PCF )',
        '\nreturn PCSS( shadowMap, shadowCoord );\n' +
        '#if defined( SHADOWMAP_TYPE_PCF )'
    );
    THREE.ShaderChunk.shadowmap_pars_fragment = shader;
}

const ctrl = new OrbitControls(camera, renderer.domElement);
ctrl.target.set(0, 0, -2);
ctrl.update();
ctrl.enableZoom = false;
ctrl.maxPolarAngle = Math.PI / 2 - 0.01;

const guiOptions = {
    "shadow mapping": true
};

const gui = new dat.GUI({ autoPlace: false });
document.getElementById("gui").appendChild(gui.domElement);
gui.add(guiOptions, "shadow mapping").onChange(enableShadowMapping);

enableShadowMapping(guiOptions["shadow mapping"]);

animate(0);

function enableShadowMapping(enabled) {
    light.castShadow = enabled;
}

function animate(time) {
    ball.position.setY(3 + 2.5 * Math.cos(time * 0.002));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}