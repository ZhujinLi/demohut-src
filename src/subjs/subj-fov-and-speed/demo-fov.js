import * as THREE from 'three';
import * as dat from 'dat.gui';

export function showDemoFov() {
    const UNIT_LENGTH = 1000;
    const CAMERA_X = 3.5;

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#view-fov'), antialias: true });
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
        const gui = new dat.GUI({ autoPlace: false });
        gui.add(camera, 'fov').min(30).max(120);
        document.getElementById('gui-fov').appendChild(gui.domElement);
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
        const roadTex = new THREE.TextureLoader().load('./road.jpg');
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
