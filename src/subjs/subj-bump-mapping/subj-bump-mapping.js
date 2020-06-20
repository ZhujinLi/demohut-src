import * as THREE from "three";
import * as dat from "dat.gui";
import vert from "./bump.vert";
import frag from "./bump.frag";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas-main") });
renderer.setSize(600, 600);

const camera = new THREE.PerspectiveCamera(50, 1);
camera.position.set(1, 1, 1);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, 1);

const scene = new THREE.Scene();

let plane = new THREE.Mesh();
scene.add(plane);

const ctrl = new OrbitControls(camera, renderer.domElement);

const diffTex = new THREE.TextureLoader().load("./diffuse.png");
const normalTex = new THREE.TextureLoader().load("./normal.png");
const heightfieldTex = new THREE.TextureLoader().load("./heightfield.png");

const guiOptions = {
    "diffuse texture": true,
    "normal texture": true,
    "heightfield texture": "displacement mapping",
    "tessellation": 50,
};

const gui = new dat.GUI({ autoPlace: false, width: 350 });
gui.add(guiOptions, "diffuse texture").onChange(updateMesh);
gui.add(guiOptions, "normal texture").onChange(updateMesh);
gui.add(guiOptions, "heightfield texture",
    ["off", "displacement mapping", "parallax mapping", "parallax occlusion mapping", "relief mapping"])
    .onChange(onHeightfieldMethodChanged);
let paramsFolder = null;
document.getElementById('div-gui').appendChild(gui.domElement);
onHeightfieldMethodChanged();

requestAnimationFrame(render);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function updateMesh() {
    let tess = 1;
    if (guiOptions["heightfield texture"] == "displacement mapping")
        tess = guiOptions["tessellation"];

    const geo = new THREE.PlaneBufferGeometry(2, 2, tess, tess);
    plane.geometry = geo;

    const mtl = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag });
    mtl.uniforms.u_diffTex = { type: "t", value: diffTex };
    mtl.uniforms.u_normalTex = { type: "t", value: normalTex };
    mtl.uniforms.u_heightfieldTex = { type: "t", value: heightfieldTex };
    mtl.uniforms.u_enableDiff = { value: guiOptions["diffuse texture"] };
    mtl.uniforms.u_enableNormal = { value: guiOptions["normal texture"] };
    mtl.uniforms.u_enableDisplacement = { value: guiOptions["heightfield texture"] == "displacement mapping" };
    plane.material = mtl;
}

function onHeightfieldMethodChanged() {
    if (paramsFolder)
        gui.removeFolder(paramsFolder);
    paramsFolder = gui.addFolder("params");
    paramsFolder.open();

    switch (guiOptions["heightfield texture"]) {
        case "displacement mapping":
            paramsFolder.add(guiOptions, "tessellation").min(1).max(100).onChange(updateMesh);
    }

    updateMesh();
}