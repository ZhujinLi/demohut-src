'use strict';

import '/three/build/three.min.js';
import '/three/examples/js/loaders/GLTFLoader.js';
import '/three/examples/js/loaders/OBJLoader.js';
import '/three/examples/js/controls/OrbitControls.js';
import { GUI } from '/dat.gui/build/dat.gui.module.js';

/* global THREE */

showDemoFovCmp();
showDemoOrtho();

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