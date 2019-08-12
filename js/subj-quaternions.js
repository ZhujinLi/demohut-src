import THREE from './three.js';
import { OrbitControls } from './OrbitControls.js';

function showViewSimple() {
	let w = 600;
	let h = 400;

	let camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
	camera.position.set(5, 5, 5);

	let scene = new THREE.Scene();

	let geometry = new THREE.BoxGeometry(1, 1, 1);
	let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	let cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	var axesHelper = new THREE.AxesHelper(1.5);
	scene.add(axesHelper);

	let clock = new THREE.Clock();

	let renderer = new THREE.WebGLRenderer();
	renderer.setSize(w, h);
	document.getElementById('view-simple').appendChild(renderer.domElement);

	let controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.enablePan = false;
	controls.enableZoom = false;

	function animate() {
		let delta = clock.getDelta();
		console.log(delta);
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}

	animate();
}

showViewSimple();