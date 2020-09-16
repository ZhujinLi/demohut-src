import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "three/examples/js/loaders/GLTFLoader.js";
import latLonVert from "./lat-lon.vert";
import latLonFrag from "./lat-lon.frag";
import sphereVert from "./sphere.vert";
import sphereFrag from "./sphere.frag";

const W = 1024;
const H = 1152;
const CUBE_SIZE = W / 8;
const SCENE_CENTER = new THREE.Vector3(-0.5, 1.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById("canvas-main") });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(W, H);
renderer.setScissorTest(true);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#c6e2d0");

const camera = new THREE.PerspectiveCamera(120, W / 2 / H, 0.01, 100);
camera.position.set(1, SCENE_CENTER.y, 1);
camera.lookAt(SCENE_CENTER);
camera.up.set(0, 1, 0);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(10, 10, 10);
dirLight.target.position.copy(SCENE_CENTER);
dirLight.castShadow = true;
const SHADOW_RANGE = 0.6;
dirLight.shadow.camera.left = -SHADOW_RANGE;
dirLight.shadow.camera.right = SHADOW_RANGE;
dirLight.shadow.camera.top = SHADOW_RANGE;
dirLight.shadow.camera.bottom = -SHADOW_RANGE;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 100;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);
scene.add(dirLight.target);

const envLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(envLight);

const ballGeo = new THREE.SphereBufferGeometry(0.02, 30, 30);
const ballMtl = new THREE.MeshPhongMaterial({ color: "#CA8" });
const ballMesh = new THREE.Mesh(ballGeo, ballMtl);
ballMesh.castShadow = true;
ballMesh.position.set(-0.7, 0, -0.2);
scene.add(ballMesh);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(SCENE_CENTER);
controls.maxDistance = controls.minDistance = 0.01;
controls.enableZoom = false;
controls.update();

const loader = new THREE.GLTFLoader();
loader.load(
    './model.gltf',
    (gltf) => {
        gltf.scene.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        scene.add(gltf.scene);
    },
    null,
    (error) => { console.log(error); }
);

//

animate(0);

function animate(now) {
    requestAnimationFrame(animate);

    // Oscillate the sphere
    ballMesh.position.setY(0.1 * Math.cos(now * 0.002) + SCENE_CENTER.y);

    // Render real scene on the left
    renderer.setScissor(0, 0, W / 2, H);
    renderer.setViewport(0, 0, W / 2, H);
    renderer.render(scene, camera);

    // First, render to screen cubemap's six faces at the top on the right side.
    // The order of six faces are: +x, -x, +y, -y, +z, -z,
    // where x-y plane is on the screen.
    const cubeAxes = calcCubeAxes();
    const cubeUps = calcCubeUps();
    const cubeScreenAreas = calcCubeScreenAreas();
    const cubemapCamera = new THREE.PerspectiveCamera(90, 1, 0.01, 100);
    for (let i = 0; i < 6; i++) {
        renderer.setScissor(cubeScreenAreas[i]);
        renderer.setViewport(cubeScreenAreas[i]);
        cubemapCamera.position.copy(camera.position);
        cubemapCamera.up.copy(cubeUps[i]);
        cubemapCamera.lookAt(camera.position.clone().add(cubeAxes[i]));
        renderer.render(scene, cubemapCamera);
    }

    // Save cubemap's textures for later use
    const cubemapTextures = [];
    for (let i = 0; i < 6; i++) {
        const texSize = CUBE_SIZE * window.devicePixelRatio;
        const tex = new THREE.DataTexture(
            new Uint8Array(texSize * texSize * 3),
            texSize, texSize, THREE.RGBFormat
        );
        const fbScreenPos = new THREE.Vector2(
            cubeScreenAreas[i].x * window.devicePixelRatio,
            cubeScreenAreas[i].y * window.devicePixelRatio);
        renderer.copyFramebufferToTexture(fbScreenPos, tex);
        cubemapTextures.push(tex);
    }

    // Render lat-lon map from cubemap textures
    const latLonCamera = new THREE.OrthographicCamera(-2, 2, 1, -1, -1, 1);
    const latLonScene = new THREE.Scene();

    const latLonGeo = new THREE.PlaneBufferGeometry(4, 2);
    const latLonMtl = new THREE.ShaderMaterial({
        vertexShader: latLonVert,
        fragmentShader: latLonFrag,
        uniforms: {
            u_texPosX: { value: cubemapTextures[0] },
            u_texNegX: { value: cubemapTextures[1] },
            u_texPosY: { value: cubemapTextures[2] },
            u_texNegY: { value: cubemapTextures[3] },
            u_texPosZ: { value: cubemapTextures[4] },
            u_texNegZ: { value: cubemapTextures[5] },
        }
    });
    const latLonMesh = new THREE.Mesh(latLonGeo, latLonMtl);
    latLonScene.add(latLonMesh);

    renderer.setViewport(W / 2, W / 2, W / 2, W / 4);
    renderer.setScissor(W / 2, W / 2, W / 2, W / 4);
    renderer.render(latLonScene, latLonCamera);

    // Render sphere map from cubemap textures
    const sphereCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const sphereScene = new THREE.Scene();

    const sphereGeo = new THREE.PlaneBufferGeometry(4, 2);
    const sphereMtl = new THREE.ShaderMaterial({
        vertexShader: sphereVert,
        fragmentShader: sphereFrag,
        uniforms: {
            u_texPosX: { value: cubemapTextures[0] },
            u_texNegX: { value: cubemapTextures[1] },
            u_texPosY: { value: cubemapTextures[2] },
            u_texNegY: { value: cubemapTextures[3] },
            u_texPosZ: { value: cubemapTextures[4] },
            u_texNegZ: { value: cubemapTextures[5] },
        }
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMtl);
    sphereScene.add(sphereMesh);

    renderer.setViewport(W / 2, 0, W / 2, W / 2);
    renderer.setScissor(W / 2, 0, W / 2, W / 2);
    renderer.render(sphereScene, sphereCamera);
}

function calcCubeAxes() {
    const [x, y, z] = calcCubeBasis();
    return [
        x.clone(),
        x.clone().multiplyScalar(-1),
        y.clone(),
        y.clone().multiplyScalar(-1),
        z.clone(),
        z.clone().multiplyScalar(-1),
    ];
}

function calcCubeUps() {
    const [x, y, z] = calcCubeBasis();
    return [
        y.clone(),
        y.clone(),
        z.clone(),
        z.clone().multiplyScalar(-1),
        y.clone(),
        y.clone(),
    ];
}

function calcCubeBasis() {
    const z = camera.position.clone().sub(controls.target);
    z.normalize();
    const x = new THREE.Vector3(0, 1, 0).cross(z);
    x.normalize();
    const y = z.clone().cross(x);
    y.normalize();
    return [x, y, z];
}

function calcCubeScreenAreas() {
    return [
        new THREE.Vector4(W - 2 * CUBE_SIZE, H - 2 * CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
        new THREE.Vector4(W - 4 * CUBE_SIZE, H - 2 * CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
        new THREE.Vector4(W - 3 * CUBE_SIZE, H - 1 * CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
        new THREE.Vector4(W - 3 * CUBE_SIZE, H - 3 * CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
        new THREE.Vector4(W - 1 * CUBE_SIZE, H - 2 * CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
        new THREE.Vector4(W - 3 * CUBE_SIZE, H - 2 * CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
    ]
}
