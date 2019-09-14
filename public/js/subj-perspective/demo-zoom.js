import '/three/build/three.min.js';
import '/three/examples/js/controls/OrbitControls.js';

export function showDemoZoom() {
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

        new THREE.TextureLoader().load('/images/checker.png', (planeTex) => {
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

            requestAnimationFrame(render);
        });

        const ctrl = new THREE.OrbitControls(zoomCamera, renderer.domElement);
        ctrl.enableRotate = false;
        ctrl.enablePan = false;
        renderer.domElement.onwheel = () => {
            requestAnimationFrame(render);
        };
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
    }

    function formatCameraParams(camera) {
        return 'distance: ' + Math.round(camera.position.length()) + '<br>'
            + 'fov: ' + Math.round(camera.fov);
    }
}
