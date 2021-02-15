import * as THREE from "three";
import 'three/examples/js/loaders/GLTFLoader.js';

/**
 * @param {function(number, number, THREE.PerspectiveCamera)} onPanStart
 * @param {function(number, number, THREE.PerspectiveCamera)} onPanMove
 * @param {function(THREE.Scene)} onSceneCreated
 */
export function PanView(canvasId, w, h, onPanStart, onPanMove, onSceneCreated) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById(canvasId) });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.domElement.onpointerdown = onPointerDown;
    renderer.domElement.onpointerup = onPointerUp;
    renderer.domElement.style.touchAction = "none";

    const camera = new THREE.PerspectiveCamera(45, w / h);
    camera.position.set(1, 0.3, 0.5);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    if (onSceneCreated) {
        onSceneCreated(scene);
    }

    const gridHelper = new THREE.GridHelper(100, 1000, "#f00");
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    animate(0);

    //

    function animate(now) {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    /**
     * @param {PointerEvent} ev 
     */
    function onPointerDown(ev) {
        renderer.domElement.onpointermove = onPointerMove;
        onPanStart(ev.offsetX, ev.offsetY, camera);
    }

    /**
     * @param {PointerEvent} ev 
     */
    function onPointerMove(ev) {
        onPanMove(ev.offsetX, ev.offsetY, camera);
    }

    /**
     * @param {PointerEvent} ev 
     */
    function onPointerUp(ev) {
        renderer.domElement.onpointermove = null;
    }
}