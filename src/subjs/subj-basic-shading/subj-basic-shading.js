import * as THREE from "three";
import 'three/examples/js/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import phongVert from './phong.vert';
import phongFrag from './phong.frag';
import gourandVert from './gourand.vert';
import gourandFrag from './gourand.frag';

// Here I try to use the minimal features of three.js and calculate the shading by myself.

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas-cmp") });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(800, 400);
renderer.setScissorTest(true);

const camera = new THREE.PerspectiveCamera(45, 1);
camera.position.set(2, 2, 0);
camera.lookAt(0, 0, 0);

const ctrl = new THREE.OrbitControls(camera, renderer.domElement);
ctrl.enablePan = false;
ctrl.enableZoom = false;

let guiOptions = {
    "tessellation": 30,
    "smoothness": 20,
    "light intensity": [255, 255, 255],
    "diffuse color": [200, 200, 0],
    "specular color": [50, 50, 50],
};

const gui = new dat.GUI({ autoPlace: false });
gui.add(guiOptions, "tessellation").min(8).max(100).step(1);
gui.add(guiOptions, "smoothness").min(0).max(50);
gui.addColor(guiOptions, 'light intensity');
gui.addColor(guiOptions, 'diffuse color');
gui.addColor(guiOptions, 'specular color');
document.getElementById('gui-cmp').appendChild(gui.domElement);

requestAnimationFrame(render);

function render() {
    const globeMtl = new THREE.ShaderMaterial();
    globeMtl.uniforms.u_lightPos = { value: new THREE.Vector3(1, 1, -1) };
    globeMtl.uniforms.u_lightIntensity = { value: vec3FromRGBArray(guiOptions["light intensity"]) };
    globeMtl.uniforms.u_diffColor = { value: vec3FromRGBArray(guiOptions["diffuse color"]) };
    globeMtl.uniforms.u_specColor = { value: vec3FromRGBArray(guiOptions["specular color"]) };
    globeMtl.uniforms.u_cameraPos = { value: camera.position };
    globeMtl.uniforms.u_smoothness = { value: guiOptions["smoothness"] };

    const tess = guiOptions["tessellation"];
    const globeGeo = new THREE.SphereBufferGeometry(1, tess, tess);

    requestAnimationFrame(render);

    // Gourand
    const gourandMtl = globeMtl;
    gourandMtl.vertexShader = gourandVert;
    gourandMtl.fragmentShader = gourandFrag;
    const gourandScene = new THREE.Scene();
    gourandScene.add(new THREE.Mesh(globeGeo, gourandMtl));
    renderer.setScissor(0, 0, 400, 400);
    renderer.setViewport(0, 0, 400, 400);
    renderer.render(gourandScene, camera);

    // Phong
    const phongMtl = globeMtl.clone();
    phongMtl.vertexShader = phongVert;
    phongMtl.fragmentShader = phongFrag;
    const phongScene = new THREE.Scene();
    phongScene.add(new THREE.Mesh(globeGeo, phongMtl));
    renderer.setScissor(400, 0, 400, 400);
    renderer.setViewport(400, 0, 400, 400);
    renderer.render(phongScene, camera);
}

function vec3FromRGBArray(rgb) {
    return new THREE.Vector3(rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0);
}