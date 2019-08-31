import '/three/build/three.min.js';
import '/three/examples/js/loaders/GLTFLoader.js';

/* global THREE */

function showDemoQuat() {
	let renderer, scene, camera;
	let rotateAxis, quat;

	initView();
	initGUI();
	onParamsChanged();

	function render() {
		renderer.render(scene, camera);
	}

	function updateScene() {
		// Update axis
		let rotateAxisMesh = scene.getObjectByName('rotateAxis');
		if (!rotateAxisMesh) {
			const material = new THREE.LineDashedMaterial({
				color: 0xffffff,
				dashSize: 0.2,
				gapSize: 0.2
			});
			const geometry = new THREE.Geometry();
			rotateAxisMesh = new THREE.Line(geometry, material);
			rotateAxisMesh.name = 'rotateAxis';
			scene.add(rotateAxisMesh);
		}
		const vertices = [new THREE.Vector3(0, 0, 0), rotateAxis];
		vertices[1].multiplyScalar(5);
		rotateAxisMesh.geometry.vertices = vertices;
		rotateAxisMesh.computeLineDistances();
		rotateAxisMesh.geometry.verticesNeedUpdate = true;

		// Update object rotation
		const jet = scene.getObjectByName('obj');
		jet && jet.setRotationFromQuaternion(quat);

		requestAnimationFrame(render);
	}

	function onParamsChanged() {
		const x = Number(document.getElementById('slider-axis-x').value);
		const y = Number(document.getElementById('slider-axis-y').value);
		const z = Number(document.getElementById('slider-axis-z').value);
		const angle = document.getElementById('slider-angle').value;

		rotateAxis = new THREE.Vector3(x, y, z);

		document.getElementById('label-axis-x').innerHTML = 'x: ' + x.toFixed(2);
		document.getElementById('label-axis-y').innerHTML = 'y: ' + y.toFixed(2);
		document.getElementById('label-axis-z').innerHTML = 'z: ' + z.toFixed(2);

		document.getElementById('label-angle').innerHTML = angle + '°';

		quat = new THREE.Quaternion();
		quat.setFromAxisAngle(new THREE.Vector3(x, y, z), THREE.Math.degToRad(angle));
		quat.normalize();

		document.getElementById('label-quat-res').innerHTML =
			"x: " + quat.x.toFixed(2) + "<br>" +
			"y: " + quat.y.toFixed(2) + "<br>" +
			"z: " + quat.z.toFixed(2) + "<br>" +
			"w: " + quat.w.toFixed(2);

		updateScene();
	}

	function initView() {
		const w = 400;
		const h = 300;

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(w, h);
		document.getElementById('view-quat').appendChild(renderer.domElement);

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
		camera.position.set(5, 5, 5);
		camera.lookAt(0, 0, 0);
		camera.up.set(0, 1, 0);

		const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
		scene.add(ambientLight);

		const axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);

		const loader = new THREE.GLTFLoader();
		loader.load(
			'/models/Jet/Jet.gltf',
			(gltf) => {
				gltf.scene.name = 'obj';
				scene.add(gltf.scene);
				requestAnimationFrame(render);
			},
			null,
			(error) => { console.log(error); }
		);
	}

	function initGUI() {
		const oninput = onParamsChanged.bind(this);

		const sliderAxisXElem = document.getElementById('slider-axis-x');
		sliderAxisXElem.min = -1;
		sliderAxisXElem.max = 1;
		sliderAxisXElem.value = 0;
		sliderAxisXElem.step = 0.05;
		sliderAxisXElem.oninput = oninput;

		const sliderAxisYElem = document.getElementById('slider-axis-y');
		sliderAxisYElem.min = -1;
		sliderAxisYElem.max = 1;
		sliderAxisYElem.value = 1;
		sliderAxisYElem.step = 0.05;
		sliderAxisYElem.oninput = oninput;

		const sliderAxisZElem = document.getElementById('slider-axis-z');
		sliderAxisZElem.min = -1;
		sliderAxisZElem.max = 1;
		sliderAxisZElem.value = 0;
		sliderAxisZElem.step = 0.05;
		sliderAxisZElem.oninput = oninput;

		const sliderAngleElem = document.getElementById('slider-angle')
		sliderAngleElem.min = 0;
		sliderAngleElem.max = 360;
		sliderAngleElem.value = 0;
		sliderAngleElem.oninput = oninput;
	}
}

showDemoQuat();