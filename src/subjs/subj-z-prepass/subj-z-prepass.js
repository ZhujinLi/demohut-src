import * as THREE from "three";
import * as dat from 'dat.gui';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const W = 800;
const H = 400;

const BUILDING_PARAMS = [
    { pos: new THREE.Vector3(0, 0, 0), dim: [10, 10, 60] },
    { pos: new THREE.Vector3(-15, 0, 0), dim: [10, 10, 60] },
    { pos: new THREE.Vector3(20, 0, 0), dim: [10, 20, 35] },
    { pos: new THREE.Vector3(0, 30, 0), dim: [100, 20, 35] },
    { pos: new THREE.Vector3(100, -100, 0), dim: [70, 70, 15] },
    { pos: new THREE.Vector3(0, -30, 0), dim: [120, 10, 15] },
];


const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("main-canvas") });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(W, H);
renderer.setClearColor("#f0f0f0");

const camera = new THREE.PerspectiveCamera(50, W / H);
camera.position.set(-100, 100, 80);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

scene.add(new THREE.AmbientLight("#505050"));

const dirLight = new THREE.DirectionalLight("#a0a0a0");
dirLight.position.set(50, 50, 50);
dirLight.lookAt(0, 0, 0);
scene.add(dirLight);

const dirLight1 = new THREE.DirectionalLight("#202020");
dirLight1.position.set(60, -70, 80);
dirLight1.lookAt(0, 0, 0);
scene.add(dirLight1);

const gridHelper = new THREE.GridHelper(1000, 20);
gridHelper.rotateX(Math.PI / 2);
scene.add(gridHelper);

let buildings = new THREE.Object3D;
scene.add(buildings);

let guiOptions = { method: "z-prepass" };

const gui = new dat.GUI({ autoPlace: false, width: 300 });
gui.add(guiOptions, "method", ["z-prepass", "sorted alpha blending"]).onChange(updateBuildings);
document.getElementById("main-gui").appendChild(gui.domElement);

updateBuildings();

const ctrl = new OrbitControls(camera, renderer.domElement);
ctrl.enableZoom = false;

animate();

//

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

function updateBuildings() {
    buildings.children = [];

    renderer.sortObjects = guiOptions.method != "z-prepass";

    // For simplicity here we generate duplicate meshes rather than rendering with two passes.
    // The final result should be the same.
    if (guiOptions.method == "z-prepass") {
        [false, true].forEach((colorWrite) => {
            for (let i = 0; i < BUILDING_PARAMS.length; i++) {
                const bld = genBuidlingAtIndex(i);
                bld.material.colorWrite = colorWrite;
                buildings.add(bld);
            }
        });
    } else {
        for (let i = 0; i < BUILDING_PARAMS.length; i++) {
            [THREE.BackSide, THREE.FrontSide].forEach((side) => {
                const bld = genBuidlingAtIndex(i);
                bld.material.side = side;
                buildings.add(bld);
            });
        }
    }
}

/**
 * @returns {THREE.Mesh}
 */
function genBuidlingAtIndex(i) {
    const dim = BUILDING_PARAMS[i].dim;
    const geo = new THREE.BoxBufferGeometry(dim[0], dim[1], dim[2]);
    const mtl = new THREE.MeshPhongMaterial({ transparent: true, color: "#ffffff", opacity: 0.5 });
    const bld = new THREE.Mesh(geo, mtl);
    bld.position.copy(BUILDING_PARAMS[i].pos);
    bld.position.setZ(dim[2] / 2);
    return bld;
}