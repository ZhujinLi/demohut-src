import '/three/build/three.min.js';
import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';

class DemoQuat {
	render() {
		this.renderer.render(this.scene, this.camera);
	}

	updateScene() {
		// Update axis
		let rotateAxisMesh = this.scene.getObjectByName('rotateAxis');
		if (!rotateAxisMesh) {
			const material = new THREE.LineDashedMaterial({
				color: 0xffffff,
				dashSize: 0.2,
				gapSize: 0.2
			});
			const geometry = new THREE.Geometry();
			rotateAxisMesh = new THREE.Line(geometry, material);
			rotateAxisMesh.name = 'rotateAxis';
			this.scene.add(rotateAxisMesh);
		}
		const vertices = [new THREE.Vector3(0, 0, 0), this.rotateAxis];
		vertices[1].multiplyScalar(5);
		rotateAxisMesh.geometry.vertices = vertices;
		rotateAxisMesh.computeLineDistances();
		rotateAxisMesh.geometry.verticesNeedUpdate = true;

		// Update object rotation
		const jet = this.scene.getObjectByName('obj');
		jet && jet.setRotationFromQuaternion(this.quat);

		requestAnimationFrame(this.render.bind(this));
	}

	onParamsChanged() {
		const x = Number(document.getElementById('slider-axis-x').value);
		const y = Number(document.getElementById('slider-axis-y').value);
		const z = Number(document.getElementById('slider-axis-z').value);
		const angle = document.getElementById('slider-angle').value;

		this.rotateAxis = new THREE.Vector3(x, y, z);

		document.getElementById('label-axis-x').innerHTML = 'x: ' + x.toFixed(2);
		document.getElementById('label-axis-y').innerHTML = 'y: ' + y.toFixed(2);
		document.getElementById('label-axis-z').innerHTML = 'z: ' + z.toFixed(2);

		document.getElementById('label-angle').innerHTML = angle;

		const quat = new THREE.Quaternion();
		quat.setFromAxisAngle(new THREE.Vector3(x, y, z), THREE.Math.degToRad(angle));
		quat.normalize();
		this.quat = quat;

		document.getElementById('label-quat-res').innerHTML =
			"x: " + quat.x.toFixed(2) + "<br>" +
			"y: " + quat.y.toFixed(2) + "<br>" +
			"z: " + quat.z.toFixed(2) + "<br>" +
			"w: " + quat.w.toFixed(2);

		this.updateScene();
	}

	initView() {
		const w = 400;
		const h = 300;

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(w, h);
		document.getElementById('view-quat').appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
		this.camera.position.set(5, 5, 5);
		this.camera.lookAt(0, 0, 0);
		this.camera.up.set(0, 1, 0);

		this.ctrl = new OrbitControls(this.camera, this.renderer.domElement);
		this.ctrl.target.set(0, 0, 0);

		new THREE.PlaneGeometry(10, 10);

		const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
		this.scene.add(ambientLight);

		const axesHelper = new THREE.AxesHelper(5);
		this.scene.add(axesHelper);

		const loader = new GLTFLoader();
		loader.load(
			'/models/Jet/Jet.gltf',
			(gltf) => {
				gltf.scene.name = 'obj';
				this.scene.add(gltf.scene);
				requestAnimationFrame(this.render.bind(this));
			},
			null,
			(error) => { console.log(error); }
		);
	}

	initGUI() {
		const oninput = this.onParamsChanged.bind(this);

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

	constructor() {
		this.initView();
		this.initGUI();
		this.onParamsChanged();
	}
}

new DemoQuat();