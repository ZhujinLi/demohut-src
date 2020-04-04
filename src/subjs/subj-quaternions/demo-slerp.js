import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls.js';
import * as _Quaternion from './quaternion_calc.js';
import { World } from './world.js';
import { Sphere } from './sphere.js';

function calcQuatTan(q0, q1, q2) {
	return new THREE.Quaternion().copy(q1).multiply(
		_Quaternion.exp(_Quaternion.scalarMultiply(
			_Quaternion.add(
				_Quaternion.log(new THREE.Quaternion().copy(q1).inverse().multiply(q0)),
				_Quaternion.log(new THREE.Quaternion().copy(q1).inverse().multiply(q2)))
			, -0.25))
	);
}

export function showDemoSlerp() {
	const INTERVAL_MS = 2000;
	let rendererL;
	let rendererR;
	let world;
	let sphere;
	let prevQuat;
	let currentQuat;
	let targetQuat;
	let nextQuat;
	let clock;
	let method;

	initView();
	initGUI();
	generateTarget();
	requestAnimationFrame(render);

	function render() {
		const elapsedS = clock.getElapsedTime();
		const elapsedMs = elapsedS * 1000;
		const t = elapsedMs / INTERVAL_MS;

		let quat = new THREE.Quaternion();
		if (method === "lerp") {
			const lerp = (x, y, a) => { return x + (y - x) * a; };

			quat.x = lerp(currentQuat.x, targetQuat.x, t);
			quat.y = lerp(currentQuat.y, targetQuat.y, t);
			quat.z = lerp(currentQuat.z, targetQuat.z, t);
			quat.w = lerp(currentQuat.w, targetQuat.w, t);
		} else if (method === "slerp") {
			quat = _Quaternion.slerp(currentQuat, targetQuat, t);
		} else if (method === "squad") {
			const tan0 = calcQuatTan(prevQuat, currentQuat, targetQuat);
			const tan1 = calcQuatTan(currentQuat, targetQuat, nextQuat);

			quat = _Quaternion.slerp(
				_Quaternion.slerp(currentQuat, targetQuat, t),
				_Quaternion.slerp(tan0, tan1, t),
				2 * t * (1 - t));
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

		prevQuat = new THREE.Quaternion(1, 0, 0, 0);
		currentQuat = new THREE.Quaternion(1, 0, 0, 0);
		targetQuat = new THREE.Quaternion(1, 0, 0, 0);
		nextQuat = makeRandomUnitQuat();
	}

	function initViewRight() {
		const w = 350;
		const h = 350;

		rendererR = new THREE.WebGLRenderer({ antialias: true });
		rendererR.setPixelRatio(window.devicePixelRatio);
		rendererR.setSize(w, h);
		document.getElementById('view-slerp-sphere').appendChild(rendererR.domElement);

		sphere = new Sphere(w, h);

		const ctrl = new THREE.OrbitControls(sphere.camera(), rendererR.domElement);
		ctrl.enableZoom = false;
	}

	function initGUI() {
		const radioLerp = document.getElementById('radio-lerp');
		radioLerp.checked = true;

		const radioSlerp = document.getElementById('radio-slerp');
		radioSlerp.checked = false;

		const radioSquad = document.getElementById('radio-squad');
		radioSquad.checked = false;

		method = "lerp";

		radioLerp.onclick = () => {
			radioSlerp.checked = false;
			radioSquad.checked = false;
			method = "lerp";
		}

		radioSlerp.onclick = () => {
			radioLerp.checked = false;
			radioSquad.checked = false;
			method = "slerp";
		}

		radioSquad.onclick = () => {
			radioLerp.checked = false;
			radioSlerp.checked = false;
			method = "squad";
		}
	}

	function generateTarget() {
		prevQuat = currentQuat;
		currentQuat = targetQuat;
		targetQuat = nextQuat;
		nextQuat = makeRandomUnitQuat();

		sphere.setTarget(targetQuat);

		clock.stop();
		clock.start();

		setTimeout(generateTarget, INTERVAL_MS);
	}

	function makeRandomUnitQuat() {
		const axis = new THREE.Vector3(
			Math.random() - 0.5,
			Math.random() - 0.5,
			Math.random() - 0.5
		);
		axis.normalize();

		const angle = Math.random() * Math.PI * 2;

		let q = new THREE.Quaternion();
		q.setFromAxisAngle(axis, angle);
		// No need to normalize because it already is

		return q;
	}
}