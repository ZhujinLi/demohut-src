import * as THREE from "three";
import * as dat from 'dat.gui';

const W = 800;
const H = 400;

let guiOptions = { steps: 32 };

const gui = new dat.GUI({ autoPlace: false });
gui.add(guiOptions, "steps").min(8).max(64).step(1);
document.getElementById("main-gui").appendChild(gui.domElement);

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("main-canvas") });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(W, H);
renderer.setClearColor("#808080");

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
camera.position.set(0, 0, 1);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const mtl = new THREE.ShaderMaterial({
    vertexShader: `
varying vec2 v_ndc;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_ndc = gl_Position.xy / gl_Position.w;
}
`,
    fragmentShader: `
uniform vec3 u_color;
uniform float u_steps;

varying vec2 v_ndc;

void main() {
    float r = floor(0.5 * (v_ndc.x + 1.0) * u_steps) / (u_steps - 1.0);
    gl_FragColor = vec4(u_color * r, 1.0);
}
`});

const geo = new THREE.PlaneGeometry(2, 0.3);

const mtlR = mtl.clone();
mtlR.uniforms.u_color = { value: new THREE.Vector3(1.0, 0.0, 0.0) };
const meshR = new THREE.Mesh(geo, mtlR);
meshR.position.set(0, 0.4, 0);
scene.add(meshR);

const mtlG = mtl.clone();
mtlG.uniforms.u_color = { value: new THREE.Vector3(0.0, 1.0, 0.0) };
const meshG = new THREE.Mesh(geo, mtlG);
meshG.position.set(0, 0, 0);
scene.add(meshG);

const mtlB = mtl.clone();
mtlB.uniforms.u_color = { value: new THREE.Vector3(0.0, 0.0, 1.0) };
const meshB = new THREE.Mesh(geo, mtlB);
meshB.position.set(0, -0.4, 0);
scene.add(meshB);

animate();

//

function animate() {
    requestAnimationFrame(animate);

    mtlR.uniforms.u_steps = { value: guiOptions.steps };
    mtlG.uniforms.u_steps = { value: guiOptions.steps };
    mtlB.uniforms.u_steps = { value: guiOptions.steps };

    renderer.render(scene, camera);
}