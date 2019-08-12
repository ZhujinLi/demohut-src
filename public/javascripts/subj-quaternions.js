import '/three/build/three.min.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';

function showViewSimple() {
	let w = 400;
	let h = 300;

	let camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
	camera.position.set(3, 3, 3);
	camera.up.set(0, 0, 1);

	let scene = new THREE.Scene();

	let geometry = new THREE.BoxGeometry(1, 1, 1);
	let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	let cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	var axesHelper = new THREE.AxesHelper(1.5);
	scene.add(axesHelper);

	let renderer = new THREE.WebGLRenderer();
	renderer.setSize(w, h);
	document.getElementById('view-simple').appendChild(renderer.domElement);

	let controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.enablePan = false;
	controls.enableZoom = false;

	function animate() {
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}

	animate();
}

showViewSimple();