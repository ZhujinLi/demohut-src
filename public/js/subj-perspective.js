'use strict';

import '/three/build/three.min.js';
import '/three/examples/js/loaders/GLTFLoader.js';
import '/three/examples/js/loaders/OBJLoader.js';
import '/three/examples/js/controls/OrbitControls.js';
import { GUI } from '/dat.gui/build/dat.gui.module.js';

/* global THREE, Chart */

showDemoFovCmp();
showDemoOrtho();
showDemoZoom();
showDemoNdc();

// Here we use ENU coordinate system, in the unit meter
function showDemoFovCmp() {
    const UNIT_LENGTH = 1000;
    const CAMERA_X = 3.5;

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#view-fov-cmp'), antialias: true });
    const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.01, 10000);
    const scene = new THREE.Scene();
    const clock = new THREE.Clock(true);

    let accumUnitCount = 0;
    let speedKmh;
    let lastUpdateDistance = 0;
    let units = [];

    initView();
    initGUI();

    function initView() {
        renderer.setClearColor(0xa8c7da);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(800, 450);

        camera.position.set(CAMERA_X, -10, 1);
        camera.up.set(0, 1, 0);
        camera.lookAt(CAMERA_X, 0, 1);

        const groundGeo = new THREE.PlaneGeometry(100000, 100000);
        const groundMtl = new THREE.MeshBasicMaterial({ color: 0xb0b0b0, depthWrite: false });
        const ground = new THREE.Mesh(groundGeo, groundMtl);
        scene.add(ground);

        addUnit();
        addUnit();

        speedKmh = 120;

        requestAnimationFrame(animate);
    }

    function initGUI() {
        const gui = new GUI({ autoPlace: false });
        gui.add(camera, 'fov').min(30).max(120);
        document.getElementById('gui-fov-cmp').appendChild(gui.domElement);
    }

    function animate() {
        const dist = clock.getElapsedTime() * msFromKmh(speedKmh);
        while (dist - lastUpdateDistance >= UNIT_LENGTH) {
            lastUpdateDistance += UNIT_LENGTH;
            addUnit();
        }

        camera.position.y = dist;
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function addUnit() {
        const unit = makeRepeatableTrackUnit(accumUnitCount);
        accumUnitCount++;

        if (units.length >= 2) {
            const oldUnit = units[0];
            scene.remove(oldUnit);

            units.shift();
        }

        units.push(unit);
        scene.add(unit);
    }

    function msFromKmh(kmh) {
        return kmh / 3.6;
    }

    function makeRepeatableTrackUnit(offset) {
        function makeRandomBuilding(x, y) {
            const height = (Math.random() ** 2) * 80 + 20;
            const geo = new THREE.BoxGeometry(Math.random() * 15 + 5, Math.random() * 15 + 5, height);
            geo.translate(x, y, height / 2);
            const mtl = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
            const building = new THREE.Mesh(geo, mtl);
            return building;
        }

        const root = new THREE.Object3D();

        const ROAD_WIDTH = 25;
        const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, UNIT_LENGTH);
        const roadTex = new THREE.TextureLoader().load('images/road.jpg');
        roadTex.wrapS = THREE.RepeatWrapping;
        roadTex.wrapT = THREE.RepeatWrapping;
        roadTex.repeat.set(1, UNIT_LENGTH / ROAD_WIDTH);
        roadTex.anisotropy = 16;
        const roadMtl = new THREE.MeshBasicMaterial({ map: roadTex });
        const road = new THREE.Mesh(roadGeo, roadMtl);
        root.add(road);

        for (let y = -UNIT_LENGTH / 2; y <= UNIT_LENGTH / 2; y += 50) {
            for (let x = -300; x <= 300; x += 50) {
                if (x != 0 && Math.random() < 1 / 5) {
                    const building = makeRandomBuilding(x, y);
                    root.add(building);
                }
            }
        }

        const sunLight = new THREE.DirectionalLight(0xe0e0e0, 0.3);
        sunLight.position.set(0, -1000, 1000);
        sunLight.target.position.set(0, 0, 0);
        root.add(sunLight);
        root.add(sunLight.target);

        const dayLight = new THREE.AmbientLight(0xf0f0f0, 0.6);
        root.add(dayLight);

        root.translateY(UNIT_LENGTH * offset);
        return root;
    }
}

function showDemoOrtho() {
    const W = 800, H = 400;
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('view-ortho') });
    const scene = new THREE.Scene();
    const perspCamera = new THREE.PerspectiveCamera(60, W / H / 2);
    const orthoCamera = new THREE.OrthographicCamera();

    initView();
    requestAnimationFrame(render);

    function initView() {
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setScissorTest(true);
        renderer.shadowMap.enabled = true;

        perspCamera.position.set(25, 25, 25);

        const objTex = new THREE.TextureLoader().load('/models/HouseWithDriveway/HouseWithDriveway_BaseColor.png');
        new THREE.OBJLoader().load(
            '/models/HouseWithDriveway/HouseWithDriveway.obj',
            (obj) => {
                obj.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.map = objTex;
                    }
                });

                scene.add(obj);
            },
            null,
            (error) => { console.log(error); }
        );

        new THREE.GLTFLoader().load(
            '/models/jap_girl/asian-girl_anime-clean.gltf',
            (gltf) => {
                gltf.scene.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                gltf.scene.scale.set(0.007, 0.007, 0.007);
                gltf.scene.position.set(0, 3.1, 10);
                scene.add(gltf.scene);
            },
            null,
            (error) => { console.log(error); }
        );

        scene.add(new THREE.AmbientLight(0xffffff, 1));

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(-100, 100, -100);
        dirLight.target.position.set(0, 0, 0);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -20;
        dirLight.shadow.camera.right = 20;
        dirLight.shadow.camera.bottom = -20;
        dirLight.shadow.camera.top = 20;
        scene.add(dirLight);

        new THREE.OrbitControls(perspCamera, renderer.domElement);
    }

    function render() {
        updateOrthoParams();

        const leftArea = new THREE.Vector4(0, 0, W / 2, H);
        renderer.setViewport(leftArea);
        renderer.setScissor(leftArea);
        renderer.setClearColor(new THREE.Color(0xbfe3dd));
        renderer.render(scene, perspCamera);

        const rightArea = new THREE.Vector4(W / 2, 0, W / 2, H);
        renderer.setViewport(rightArea);
        renderer.setScissor(rightArea);
        renderer.setClearColor(new THREE.Color(0xabb3d4));
        renderer.render(scene, orthoCamera);

        requestAnimationFrame(render);
    }

    function updateOrthoParams() {
        const d = perspCamera.position.length() * Math.tan(perspCamera.fov / 180 * Math.PI / 2);
        orthoCamera.left = -d;
        orthoCamera.right = d;
        orthoCamera.bottom = -d;
        orthoCamera.top = d;
        orthoCamera.near = -2 * d;
        orthoCamera.far = 2 * d;
        orthoCamera.position.copy(orthoCamera.position);
        orthoCamera.rotation.copy(perspCamera.rotation);
        orthoCamera.updateProjectionMatrix();
    }
}

function showDemoZoom() {
    const W = 800, H = 400;
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('view-zoom') });
    const scene = new THREE.Scene();
    const zoomCamera = new THREE.PerspectiveCamera(60, W / H / 2);
    const fovCamera = new THREE.PerspectiveCamera();

    initView();
    requestAnimationFrame(render);

    function initView() {
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setScissorTest(true);
        renderer.shadowMap.enabled = true;

        zoomCamera.position.set(0, 0, 100);
        fovCamera.copy(zoomCamera);

        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(50, 50, 50);
        pointLight.castShadow = true;
        scene.add(pointLight);

        {
            const boxGeo = new THREE.BoxBufferGeometry(10, 10, 40);
            const boxMtl = new THREE.MeshStandardMaterial({ color: '#f44' });
            const box = new THREE.Mesh(boxGeo, boxMtl);
            box.castShadow = true;
            box.receiveShadow = true;
            box.position.set(20, -10, 20);
            scene.add(box);
        }

        {
            const boxGeo = new THREE.BoxBufferGeometry(10, 10, 4);
            const boxMtl = new THREE.MeshStandardMaterial({ color: '#f44' });
            const box = new THREE.Mesh(boxGeo, boxMtl);
            box.castShadow = true;
            box.receiveShadow = true;
            box.position.set(25, 25, 2);
            scene.add(box);
        }

        const sphereGeo = new THREE.SphereBufferGeometry(10, 20, 20);
        const sphereMtl = new THREE.MeshStandardMaterial({ color: '#ffc' });
        const sphere = new THREE.Mesh(sphereGeo, sphereMtl);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.position.set(-20, 20, 10);
        scene.add(sphere);

        const planeTex = new THREE.TextureLoader().load('/images/checker.png');
        planeTex.wrapS = THREE.RepeatWrapping;
        planeTex.wrapT = THREE.RepeatWrapping;
        planeTex.magFilter = THREE.NearestFilter;
        planeTex.repeat.set(50, 50);

        const planeGeo = new THREE.PlaneBufferGeometry(500, 500);
        const planeMat = new THREE.MeshPhongMaterial({
            map: planeTex,
            side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.receiveShadow = true;
        scene.add(plane);

        const ctrl = new THREE.OrbitControls(zoomCamera, renderer.domElement);
        ctrl.enableRotate = false;
    }

    function render() {
        const leftArea = new THREE.Vector4(0, 0, W / 2, H);
        renderer.setViewport(leftArea);
        renderer.setScissor(leftArea);
        const d = zoomCamera.position.length();
        const halfWidth = Math.tan(zoomCamera.fov / 2 / 180 * Math.PI) * d;
        const fov = Math.atan(halfWidth / fovCamera.position.z) / Math.PI * 180 * 2;
        fovCamera.fov = fov;
        const pos = new THREE.Vector3().copy(zoomCamera.position);
        pos.setLength(fovCamera.position.length());
        fovCamera.position.copy(pos);
        fovCamera.updateProjectionMatrix();
        renderer.render(scene, fovCamera);

        const rightArea = new THREE.Vector4(W / 2, 0, W / 2, H);
        renderer.setViewport(rightArea);
        renderer.setScissor(rightArea);
        renderer.render(scene, zoomCamera);

        document.getElementById('label-left-params').innerHTML = formatCameraParams(fovCamera);
        document.getElementById('label-right-params').innerHTML = formatCameraParams(zoomCamera);

        requestAnimationFrame(render);
    }

    function formatCameraParams(camera) {
        return 'distance: ' + Math.round(camera.position.length()) + '<br>'
            + 'fov: ' + Math.round(camera.fov);
    }
}

function showDemoNdc() {
    const W = 900, H = 300;
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('view-ndc') });
    const scene = new THREE.Scene();
    const scene2 = new THREE.Scene();
    const mainCamera = new THREE.PerspectiveCamera(45, W / H / 3);
    const auxCamera = new THREE.PerspectiveCamera(45, W / H / 3);
    const auxCamera2 = new THREE.OrthographicCamera(-2, 2, 2, -2, -10, 10);
    let cameraHelper;
    let lineChart;
    const normalSpheres = new Array();
    const projSpheres = new Array();

    initView();
    initGUI();
    update();
    requestAnimationFrame(render);

    function initView() {
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setScissorTest(true);

        mainCamera.position.set(10, 10, 30);
        mainCamera.lookAt(0, 0, 0);
        mainCamera.updateProjectionMatrix();

        auxCamera.position.set(200, 200, 0);
        auxCamera.near = 0.1;
        auxCamera.far = 10000;
        auxCamera.lookAt(0, 0, 0);
        auxCamera.updateProjectionMatrix();

        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(0, 10, 0);
            light.target.position.set(-5, 0, 0);
            scene.add(light);
            scene.add(light.target);

            const light2 = new THREE.DirectionalLight().copy(light);
            scene2.add(light2);
            scene2.add(light2.target);
        }

        {
            const sphereRadius = 3;
            const sphereWidthDivisions = 32;
            const sphereHeightDivisions = 16;
            const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
            for (let i = 0; i < 20; ++i) {
                const sphereMat = new THREE.MeshPhongMaterial();
                sphereMat.color.setHSL(i * .73, 1, 0.5);
                const mesh = new THREE.Mesh(sphereGeo, sphereMat);
                mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
                mesh.updateMatrix();
                scene.add(mesh);
                normalSpheres.push(mesh);

                const projGeo = new THREE.SphereGeometry().copy(sphereGeo);
                const projMesh = new THREE.Mesh(projGeo, sphereMat);
                projSpheres.push(projMesh);
                scene2.add(projMesh);
            }
        }

        {
            const planeSize = 400;

            const loader = new THREE.TextureLoader();
            const texture = loader.load('/images/checker.png');
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            const repeats = planeSize / 2;
            texture.repeat.set(repeats, repeats);

            const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
            const planeMat = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
            const mesh = new THREE.Mesh(planeGeo, planeMat);
            mesh.rotation.x = Math.PI * -.5;
            scene.add(mesh);
        }

        scene.add(new THREE.AxesHelper(100));

        cameraHelper = new THREE.CameraHelper(mainCamera);
        cameraHelper.material.depthTest = false;
        scene.add(cameraHelper);

        auxCamera2.position.set(1, 1.5, 0.5);
        auxCamera2.lookAt(0, 0, 0);
        auxCamera2.updateProjectionMatrix();

        scene2.add(new THREE.AxesHelper(2));

        const unitBoxGeo = new THREE.BoxBufferGeometry(2, 2, 2);
        const unitBoxMtl = new THREE.MeshBasicMaterial({ color: "#ff0", wireframe: true });
        const unitBox = new THREE.Mesh(unitBoxGeo, unitBoxMtl);
        scene2.add(unitBox);

        new THREE.OrbitControls(auxCamera, document.getElementById("area-ndc-middle"));
        new THREE.OrbitControls(auxCamera2, document.getElementById("area-ndc-right"));
    }

    function update() {
        const value = document.getElementById('slider-near').value;
        const near = 10 ** value;
        mainCamera.near = near;
        mainCamera.far = near + 100;
        mainCamera.updateProjectionMatrix();

        cameraHelper.update();

        document.getElementById('label-near').innerHTML = 'near: ' + near.toFixed(5);

        const points = [];
        const n = mainCamera.near;
        const f = mainCamera.far;
        const step = n < 1 ? 0.1 : 1;
        for (let z = mainCamera.near; z <= mainCamera.far; z += step)
            points.push({
                x: z - mainCamera.near,
                y: -(2 * f * n / (f - n)) * (1 / z) + (f + n) / (f - n)
            });
        lineChart.data.datasets[0].data = points;
        lineChart.update();

        const translateVec = new THREE.Vector3().copy(mainCamera.position).negate();
        const translateMat = new THREE.Matrix4().makeTranslation(translateVec.x, translateVec.y, translateVec.z);
        const lookAtMat = new THREE.Matrix4().makeRotationFromQuaternion(mainCamera.quaternion);
        lookAtMat.getInverse(lookAtMat);
        const viewMat = new THREE.Matrix4().copy(lookAtMat).multiply(translateMat);
        projSpheres.forEach((projSphere, i) => {
            const mvp = new THREE.Matrix4().copy(mainCamera.projectionMatrix)
                .multiply(viewMat)
                .multiply(normalSpheres[i].matrix);
            normalSpheres[i].geometry.vertices.forEach((v3, j) => {
                const v4 = new THREE.Vector4(v3.x, v3.y, v3.z, 1);
                v4.applyMatrix4(mvp);
                v4.multiplyScalar(1 / v4.w);
                projSphere.geometry.vertices[j].set(v4.x, v4.y, -v4.z);
            })
            projSphere.geometry.verticesNeedUpdate = true;
        })
    }

    function initGUI() {
        const sliderNear = document.getElementById('slider-near');
        sliderNear.min = -5;    // log
        sliderNear.max = 2;
        sliderNear.value = 0;
        sliderNear.step = 0.01;
        sliderNear.oninput = update;

        const dists = [];
        for (let i = 0; i <= 100; i += 10)
            dists.push(i);

        lineChart = new Chart('plot-ndc', {
            type: 'line',
            data: {
                labels: dists,
                datasets: [
                    { data: [], fill: false, pointRadius: 0 }
                ]
            },
            options: {
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: -1,
                            max: 1
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'z_ndc'
                        }
                    }],
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            min: 0,
                            max: 100,
                            stepSize: 10,
                            fixedStepSize: 1,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'z-near'
                        }
                    }]
                },
                legend: {
                    display: false
                }
            }
        });
    }

    function render() {
        const leftArea = new THREE.Vector4(0, 0, W / 3, H);
        cameraHelper.visible = false;
        renderer.setViewport(leftArea);
        renderer.setScissor(leftArea);
        renderer.render(scene, mainCamera);

        const middleArea = new THREE.Vector4(W / 3, 0, W / 3, H);
        cameraHelper.visible = true;
        renderer.setViewport(middleArea);
        renderer.setScissor(middleArea);
        renderer.render(scene, auxCamera);

        const rightArea = new THREE.Vector4(W * 2 / 3, 0, W / 3, H);
        renderer.setViewport(rightArea);
        renderer.setScissor(rightArea);
        renderer.render(scene2, auxCamera2);

        requestAnimationFrame(render);
    }
}