import '/three/build/three.min.js';
import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';

class DemoQuat {
	static animate() {
		let o = DemoQuat.instance;
		o.renderer.render(o.scene, o.camera);
	}

	updateScene() {
		// Update axis
		if (this.rotateAxisMesh == undefined) {
			let material = new THREE.LineDashedMaterial({
				color: 0xffffff,
				dashSize: 0.2,
				gapSize: 0.2
			});
			let geometry = new THREE.Geometry();
			let line = this.rotateAxisMesh = new THREE.Line(geometry, material);
			this.scene.add(line);
		}
		let vertices = [new THREE.Vector3(0, 0, 0), this.rotateAxis];
		vertices[1].multiplyScalar(5);
		this.rotateAxisMesh.geometry.vertices = vertices;
		this.rotateAxisMesh.computeLineDistances();
		this.rotateAxisMesh.geometry.verticesNeedUpdate = true;

		// Update object rotation
		if (this.objScene) {
			this.objScene.setRotationFromQuaternion(this.quat);
		}

		requestAnimationFrame(DemoQuat.animate);
	}

	static onParamsChanged() {
		let o = DemoQuat.instance;

		let x = Number(document.getElementById('slider-axis-x').value);
		let y = Number(document.getElementById('slider-axis-y').value);
		let z = Number(document.getElementById('slider-axis-z').value);
		let angle = document.getElementById('slider-angle').value;

		o.rotateAxis = new THREE.Vector3(x, y, z);

		document.getElementById('label-axis-x').innerHTML = 'x: ' + x.toFixed(2);
		document.getElementById('label-axis-y').innerHTML = 'y: ' + y.toFixed(2);
		document.getElementById('label-axis-z').innerHTML = 'z: ' + z.toFixed(2);

		document.getElementById('label-angle').innerHTML = angle;

		let quat = o.quat = new THREE.Quaternion();
		quat.setFromAxisAngle(new THREE.Vector3(x, y, z), THREE.Math.degToRad(angle));

		document.getElementById('label-quat-res').innerHTML =
			"x: " + quat.x.toFixed(2) + "<br>" +
			"y: " + quat.y.toFixed(2) + "<br>" +
			"z: " + quat.z.toFixed(2) + "<br>" +
			"w: " + quat.w.toFixed(2);

		o.updateScene();
	}

	initView() {
		let w = 400;
		let h = 300;

		let camera = this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
		camera.position.set(5, 5, 5);
		camera.lookAt(0, 0, 0);
		camera.up.set(0, 1, 0);

		let scene = this.scene = new THREE.Scene();

		// ???: The model will fail to appear if commented out
		new THREE.BoxGeometry(1, 1, 1);

		let loader = new GLTFLoader();
		loader.load(
			'/models/Jet/Jet.gltf',
			function (gltf) {
				DemoQuat.instance.objScene = gltf.scene;
				scene.add(gltf.scene);
				requestAnimationFrame(DemoQuat.animate);
			}
		);

		let ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
		scene.add(ambientLight);

		let axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);

		let renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(w, h);
		document.getElementById('view-quat').appendChild(renderer.domElement);
	}

	constructor() {
		DemoQuat.instance = this;

		this.initView();

		let sliderAxisXElem = document.getElementById('slider-axis-x');
		sliderAxisXElem.min = -1;
		sliderAxisXElem.max = 1;
		sliderAxisXElem.value = 0;
		sliderAxisXElem.step = 0.05;
		sliderAxisXElem.oninput = DemoQuat.onParamsChanged;

		let sliderAxisYElem = document.getElementById('slider-axis-y');
		sliderAxisYElem.min = -1;
		sliderAxisYElem.max = 1;
		sliderAxisYElem.value = 1;
		sliderAxisYElem.step = 0.05;
		sliderAxisYElem.oninput = DemoQuat.onParamsChanged;

		let sliderAxisZElem = document.getElementById('slider-axis-z');
		sliderAxisZElem.min = -1;
		sliderAxisZElem.max = 1;
		sliderAxisZElem.value = 0;
		sliderAxisZElem.step = 0.05;
		sliderAxisZElem.oninput = DemoQuat.onParamsChanged;

		let sliderAngleElem = document.getElementById('slider-angle')
		sliderAngleElem.min = 0;
		sliderAngleElem.max = 360;
		sliderAngleElem.value = 0;
		sliderAngleElem.oninput = DemoQuat.onParamsChanged;

		DemoQuat.onParamsChanged();
	}
}

new DemoQuat();