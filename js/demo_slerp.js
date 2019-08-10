import './three.js';

let w = 600;
let h = 400;

let camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
camera.position.z = 5;

let scene = new THREE.Scene();

let geometry = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
let cube = new THREE.Mesh(geometry, material);
scene.add(cube);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.getElementById('demo1').appendChild(renderer.domElement);

function animate() {
	cube.rotation.x += 0.05;
	cube.rotation.y += 0.05;
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

animate();
