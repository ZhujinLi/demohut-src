import '/three/build/three.min.js';
import { World } from '../util/plane-obj/world.js';

export function showDemoQuat() {
    let renderer;
    let world;
    let rotateAxis, quat, quatRaw;

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

        quatRaw = new THREE.Quaternion();
        quatRaw.setFromAxisAngle(new THREE.Vector3(x, y, z), THREE.Math.degToRad(angle));

        document.getElementById('label-quat-raw').innerHTML =
            "x: " + quatRaw.x.toFixed(2) + "<br>" +
            "y: " + quatRaw.y.toFixed(2) + "<br>" +
            "z: " + quatRaw.z.toFixed(2) + "<br>" +
            "w: " + quatRaw.w.toFixed(2);

        quat = new THREE.Quaternion().copy(quatRaw);
        quat.normalize();

        document.getElementById('label-quat-unit').innerHTML =
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
