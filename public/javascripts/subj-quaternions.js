import '/three/build/three.min.js';
import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';

function showViewSimple() {
	let w = 400;
	let h = 300;

	let camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
	camera.position.set(5, 5, 5);
	camera.lookAt(0, 0, 0);
	camera.up.set(0, 1, 0);

	let scene = new THREE.Scene();

	// ???: The model will fail to appear if commented out
	new THREE.BoxGeometry(1, 1, 1);

	let loader = new GLTFLoader();
	loader.load(
		'/models/Jet/Jet.gltf',
		function (gltf) {
			scene.add(gltf.scene);
		}
	);

	let ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
	scene.add(ambientLight);

	let axesHelper = new THREE.AxesHelper(5);
	scene.add(axesHelper);

	let renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(w, h);
	document.getElementById('view-simple').appendChild(renderer.domElement);

	function animate() {
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}

	animate();
}

showViewSimple();