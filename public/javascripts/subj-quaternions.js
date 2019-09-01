import '/three/build/three.min.js';
import '/three/examples/js/loaders/GLTFLoader.js';
import '/three/examples/js/controls/OrbitControls.js';

/* global THREE */

function _Quaternion_distance(l, r) {
	return new THREE.Quaternion(l.x - r.x, l.y - r.y, l.z - r.z, l.w - r.w).length();
}

class World {
	constructor(w, h, renderCallback) {
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
		this._camera.position.set(5, 5, 5);
		this._camera.lookAt(0, 0, 0);
		this._camera.up.set(0, 1, 0);

		const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
		this._scene.add(ambientLight);

		const axesHelper = new THREE.AxesHelper(5);
		this._scene.add(axesHelper);

		const loader = new THREE.GLTFLoader();
		loader.load(
			'/models/Jet/Jet.gltf',
			(gltf) => {
				this._obj = gltf.scene;
				this._scene.add(gltf.scene);
				if (renderCallback) {
					requestAnimationFrame(renderCallback);
				}
			},
			null,
			(error) => { console.log(error); }
		);
	}

	scene() { return this._scene; }
	camera() { return this._camera; }
	obj() { return this._obj; }
}

class Sphere {
	constructor(w, h) {
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 10);
		this._camera.position.z = 5;
		this._camera.lookAt(0, 0, 0);
		this._camera.up.set(0, 1, 0);

		const targetGeometry = new THREE.SphereBufferGeometry(0.02);
		const targetMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

		this._target = new THREE.Mesh(targetGeometry, targetMaterial);
		this._scene.add(this._target);

		const sphereMaterialOld = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.3 });
		this._sphereOld = new THREE.Mesh(new THREE.Geometry(), sphereMaterialOld);
		this._scene.add(this._sphereOld);

		const sphereMaterialNew = new THREE.MeshBasicMaterial({ color: 0xff8080, wireframe: true, transparent: true, opacity: 0.3 });
		this._sphereNew = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 32, 32), sphereMaterialNew);
		this._scene.add(this._sphereNew);

		// Since the geometry in a mesh could not be resized, I gave up the attempt of using a dynamic line
		this._tracePoints = [];
	}

	scene() { return this._scene; }
	camera() { return this._camera; }

	setTarget(quat) {
		const pos = new THREE.Vector3(quat.x, quat.y, quat.z);
		const radius = pos.length();

		this._sphereOld.geometry = this._sphereNew.geometry;
		this._sphereNew.geometry = new THREE.SphereBufferGeometry(radius, 32, 32);

		this._target.position.copy(pos);
	}

	addTrace(quat) {
		const pos = new THREE.Vector3(quat.x, quat.y, quat.z);
		const point = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
		point.position.copy(pos);
		this._tracePoints.push(point);
		this._scene.add(point);

		this._truncateTraceIfNeeded();
	}

	_truncateTraceIfNeeded() {
		while (this._tracePoints.length > 500) {
			this._scene.remove(this._tracePoints[0]);
			this._tracePoints.shift();
		}
	}

}

function showDemoQuat() {
	let renderer;
	let world;
	let rotateAxis, quat;

	initView();
	initGUI();
	onParamsChanged();

	function render() {
		const scene = world.scene();
		const camera = world.camera();
		renderer.render(scene, camera);
	}

	function updateScene() {
		// Update axis
		const scene = world.scene();
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
		const jet = world.obj();
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

		world = new World(w, h, render.bind(this));
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

function showDemoSlerp() {
	const INTERVAL_MS = 3000;
	let rendererL;
	let rendererR;
	let world;
	let sphere;
	let currentQuat;
	let targetQuat;
	let clock;
	let method;

	initView();
	initGUI();
	generateTarget();
	requestAnimationFrame(render);

	function render() {
		const elapsedS = clock.getElapsedTime();
		const elapsedMs = elapsedS * 1000;
		const progress = elapsedMs / INTERVAL_MS;

		let quat = new THREE.Quaternion();
		if (method === "slerp") {
			THREE.Quaternion.slerp(currentQuat, targetQuat, quat, progress);
		} else if (method === "lerp") {
			const lerp = (x, y, a) => { return x + (y - x) * a; };

			quat.x = lerp(currentQuat.x, targetQuat.x, progress);
			quat.y = lerp(currentQuat.y, targetQuat.y, progress);
			quat.z = lerp(currentQuat.z, targetQuat.z, progress);
			quat.w = lerp(currentQuat.w, targetQuat.w, progress);
		}

		sphere.addTrace(quat);

		quat.normalize();
		const obj = world.obj();
		obj && obj.setRotationFromQuaternion(quat);

		rendererL.render(world.scene(), world.camera());
		rendererR.render(sphere.scene(), sphere.camera());

		requestAnimationFrame(render);
	}

	function initView() {
		initViewLeft();
		initViewRight();
	}

	function initViewLeft() {
		const w = 350;
		const h = 350;

		rendererL = new THREE.WebGLRenderer({ antialias: true });
		rendererL.setPixelRatio(window.devicePixelRatio);
		rendererL.setSize(w, h);
		document.getElementById('view-slerp-world').appendChild(rendererL.domElement);

		world = new World(w, h);

		clock = new THREE.Clock(false);

		targetQuat = new THREE.Quaternion(1, 0, 0, 0);
		currentQuat = new THREE.Quaternion(1, 0, 0, 0);
	}

	function initViewRight() {
		const w = 350;
		const h = 350;

		rendererR = new THREE.WebGLRenderer({ antialias: true });
		rendererR.setPixelRatio(window.devicePixelRatio);
		rendererR.setSize(w, h);
		document.getElementById('view-slerp-sphere').appendChild(rendererR.domElement);

		sphere = new Sphere(w, h);

		new THREE.OrbitControls(sphere.camera(), rendererR.domElement);
	}

	function initGUI() {
		const radioSlerp = document.getElementById('radio-slerp');
		radioSlerp.checked = true;
		method = "slerp";

		const radioLerp = document.getElementById('radio-lerp');
		radioLerp.checked = false;

		radioSlerp.onclick = () => {
			radioLerp.checked = false;
			method = "slerp";
		}

		radioLerp.onclick = () => {
			radioSlerp.checked = false;
			method = "lerp";
		}
	}

	function generateTarget() {
		currentQuat = targetQuat;

		const axis = new THREE.Vector3(
			Math.random() - 0.5,
			Math.random() - 0.5,
			Math.random() - 0.5
		);
		axis.normalize();

		const angle = Math.random() * Math.PI * 2;

		targetQuat = new THREE.Quaternion();
		targetQuat.setFromAxisAngle(axis, angle);
		// No need to normalize because it already is

		// Choose the shortest arc (slerp does this automatically though)
		const targetQuatAnti = new THREE.Quaternion(-targetQuat.x, -targetQuat.y, -targetQuat.z, -targetQuat.w);
		if (_Quaternion_distance(currentQuat, targetQuatAnti) < _Quaternion_distance(currentQuat, targetQuat)) {
			targetQuat = targetQuatAnti;
		}

		sphere.setTarget(targetQuat);

		clock.stop();
		clock.start();

		setTimeout(generateTarget, INTERVAL_MS);
	}

}

showDemoSlerp();