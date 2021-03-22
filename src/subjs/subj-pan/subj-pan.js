import { PanView } from "./pan-view";
import * as THREE from "three";
import * as dat from 'dat.gui';

const W = 640;
const H = 360;

// 1
{
    let startX;
    let startY;
    let startCamPos;
    let guiOptions = { lambda: 0.001 };

    const gui = new dat.GUI({ autoPlace: false });
    gui.add(guiOptions, "lambda").min(0.0005).max(0.01);
    document.getElementById("gui-1").appendChild(gui.domElement);

    PanView("canvas-1", W, H,
        (x, y, camera) => {
            startX = x;
            startY = y;
            startCamPos = camera.position.clone();
        },
        (x, y, camera) => {
            const deltaX = x - startX;
            const deltaY = startY - y;

            const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
            const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
            const look = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).multiplyScalar(-1);

            const offset = right.clone().multiplyScalar(guiOptions.lambda * deltaX)
                .add(up.clone().multiplyScalar(guiOptions.lambda * deltaY));
            camera.position.copy(startCamPos.clone().sub(offset));
            camera.lookAt(camera.position.clone().add(look));
        },
    );
}

// 2
{
    let startX;
    let startY;
    let startCamPos;
    let lambda;


    PanView("canvas-2", W, H,
        (x, y, camera) => {
            startX = x;
            startY = y;
            startCamPos = camera.position.clone();

            const fov = camera.fov * Math.PI / 180;
            const target = _calcTargetOnGround(camera);
            const dist = target.clone().sub(camera.position).length();
            lambda = 2 * dist * Math.tan(fov / 2) / H;
        },
        (x, y, camera) => {
            const deltaX = x - startX;
            const deltaY = startY - y;

            const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
            const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
            const look = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).multiplyScalar(-1);

            const offset = right.clone().multiplyScalar(lambda * deltaX)
                .add(up.clone().multiplyScalar(lambda * deltaY));
            camera.position.copy(startCamPos.clone().sub(offset));
            camera.lookAt(camera.position.clone().add(look));
        },
    );
}

// 3
{
    let startX;
    let startY;
    let startCamPos;
    let lambda;
    let u;


    PanView("canvas-3", W, H,
        (x, y, camera) => {
            startX = x;
            startY = y;
            startCamPos = camera.position.clone();

            const fov = camera.fov * Math.PI / 180;
            const target = _calcTargetOnGround(camera);
            const dist = target.clone().sub(camera.position).length();
            lambda = 2 * dist * Math.tan(fov / 2) / H;
            u = 1 / camera.position.clone().normalize().dot(new THREE.Vector3(0, 0, 1));
        },
        (x, y, camera) => {
            const deltaX = x - startX;
            const deltaY = startY - y;

            const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
            const look = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).multiplyScalar(-1);
            const bearing = new THREE.Vector3(0, 0, 1).cross(right);

            const offset = right.clone().multiplyScalar(lambda * deltaX)
                .add(bearing.clone().multiplyScalar(lambda * u * deltaY));
            camera.position.copy(startCamPos.clone().sub(offset));
            camera.lookAt(camera.position.clone().add(look));
        },
    );
}

// 4
{
    let startWorldPos;

    PanView("canvas-4", W, H,
        (x, y, camera) => {
            startWorldPos = _calcTargetOnGroundWithScreenCoord(camera, x, y);
        },
        (x, y, camera) => {
            const curWorldPos = _calcTargetOnGroundWithScreenCoord(camera, x, y);
            const deltaWorldPos = startWorldPos.clone().sub(curWorldPos);
            camera.position.add(deltaWorldPos);

            const lookDir = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).multiplyScalar(-1);
            camera.lookAt(camera.position.clone().add(lookDir));
        },
    );
}

// 5
{
    let terrain;
    let startWorldPos;

    PanView("canvas-5", W, H,
        (x, y, camera) => {
            const target = _calcTargetOnObjectWithScreenCoord(camera, terrain, x, y);

            // Fallback to ground if not hit
            startWorldPos = target ? target.point : _calcTargetOnGroundWithScreenCoord(camera, x, y);
        },
        (x, y, camera) => {
            const curWorldPos = _calcTargetOnPlaneWithScreenCoord(camera, startWorldPos.z, x, y);
            const deltaWorldPos = startWorldPos.clone().sub(curWorldPos);
            camera.position.add(deltaWorldPos);

            const lookDir = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).multiplyScalar(-1);
            camera.lookAt(camera.position.clone().add(lookDir));
        },
        (scene) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                './terrain/CUPIC_HILL.gltf',
                (gltf) => {
                    terrain = gltf.scene;
                    terrain.rotateX(Math.PI / 2);
                    terrain.scale.set(0.001, 0.001, 0.001);

                    scene.add(terrain);
                },
                null,
                (error) => { console.log(error); }
            );
        },
    );
}

/**
 * @param {THREE.PerspectiveCamera} camera 
 */
function _calcTargetOnGround(camera) {
    const p = camera.position.clone();
    const r = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 2).multiplyScalar(-1);
    const s = -p.z / r.z;
    return p.add(r.multiplyScalar(s));
}

/**
 * @param {THREE.PerspectiveCamera} camera
 */
function _calcTargetOnGroundWithScreenCoord(camera, x, y) {
    // [-1, +1] for y
    y = (1 - y / H) * 2 - 1;
    x = (x - W / 2) / (H / 2);
    const z = -1 / Math.tan(camera.fov * Math.PI / 180 / 2);

    const p = camera.position.clone();
    const r = new THREE.Vector3(x, y, z).applyMatrix4(camera.matrix).sub(p);
    const s = -p.z / r.z;
    return p.add(r.multiplyScalar(s));
}

/**
 * @param {THREE.PerspectiveCamera} camera
 */
function _calcTargetOnObjectWithScreenCoord(camera, obj, x, y) {
    const ndc = new THREE.Vector2((x / W) * 2 - 1, (1 - y / H) * 2 - 1);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);

    const intersects = raycaster.intersectObject(obj, true);
    return intersects[0];
}

/**
 * @param {THREE.PerspectiveCamera} camera
 */
function _calcTargetOnPlaneWithScreenCoord(camera, planeZ, x, y) {
    const ndc = new THREE.Vector2((x / W) * 2 - 1, (1 - y / H) * 2 - 1);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -planeZ);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersect);
    return intersect;
}