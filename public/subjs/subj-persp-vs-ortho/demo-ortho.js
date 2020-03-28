import '/public/libs/threejs/r108/three.min.js';
import '/public/libs/threejs/r108/examples/js/loaders/GLTFLoader.js';
import '/public/libs/threejs/r108/examples/js/loaders/OBJLoader.js';
import '/public/libs/threejs/r108/examples/js/controls/OrbitControls.js';

export function showDemoOrtho() {
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

        const objTex = new THREE.TextureLoader().load('/public/subjs/subj-persp-vs-ortho/HouseWithDriveway/HouseWithDriveway_BaseColor.png');
        new THREE.OBJLoader().load(
            '/public/subjs/subj-persp-vs-ortho/HouseWithDriveway/HouseWithDriveway.obj',
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
            '/public/subjs/subj-persp-vs-ortho/jap_girl/asian-girl_anime-clean.gltf',
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

                requestAnimationFrame(render);
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
        renderer.domElement.onmousemove = renderer.domElement.onwheel = () => { requestAnimationFrame(render) };
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
