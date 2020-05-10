import * as THREE from "three";
import 'three/examples/js/lines/LineSegments2';
import 'three/examples/js/lines/Line2';
import 'three/examples/js/lines/LineMaterial';
import 'three/examples/js/lines/LineSegmentsGeometry';
import 'three/examples/js/lines/LineGeometry';

export function showScreen() {
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas-screen") });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setScissorTest(true);
    renderer.setSize(600, 300);
    renderer.autoClear = false; // As we render two times for each part here

    const cameraWorld = new THREE.PerspectiveCamera(90, 1, 0.001, 100);
    cameraWorld.position.set(0, 0, 0.5);
    cameraWorld.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("./gta_map.jpg") })));

    // Add the route and camera in screen space
    //
    const routeGeo = new THREE.LineGeometry();
    routeGeo.setPositions(_routeShape());

    const sceneScreenWrong = new THREE.Scene();
    const routeWrong = new THREE.Line2(routeGeo, new THREE.LineMaterial({ color: 0xff0000, linewidth: 0.01, vertexColors: false }));
    sceneScreenWrong.add(routeWrong);

    const sceneScreenRight = new THREE.Scene();
    const routeRight = new THREE.Line2(routeGeo, new THREE.LineMaterial({ color: 0xff0000, linewidth: 0.01, vertexColors: false }));
    sceneScreenRight.add(routeRight);

    const cameraScreen = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 100);
    cameraScreen.position.set(0, 0, 0.5);

    // Perform zoom in/out animation
    let zoomTimer;
    let isZoomIn = false;
    function zoom() {
        if (zoomTimer) {
            return;
        }

        isZoomIn = !isZoomIn;

        const lerp = (x, y, a) => x + (y - x) * a;
        const zoomFromHeight = (height) => Math.log(1 / height) / Math.log(2);
        const heightFromZoom = (zoom) => 1 / Math.pow(2, zoom);

        const INTERVAL = 18;
        const FRAMES = 30;
        const SFACTOR = 2.5;
        const sourceH = cameraWorld.position.z;
        const targetH = isZoomIn ? sourceH / SFACTOR : sourceH * SFACTOR;
        const srcZoom = zoomFromHeight(sourceH);
        const targetZoom = zoomFromHeight(targetH);
        const srcScale = isZoomIn ? 1 : SFACTOR;
        const targetScale = isZoomIn ? SFACTOR : 1;
        let i = 0;
        zoomTimer = setInterval(() => {
            if (i > FRAMES) {
                clearInterval(zoomTimer);
                zoomTimer = null;
            } else {
                // World is non-linear
                cameraWorld.position.z = heightFromZoom(lerp(srcZoom, targetZoom, i / FRAMES));

                // Linear is wrong
                routeWrong.scale.setScalar(lerp(srcScale, targetScale, i / FRAMES));

                // Correct it with non-linear height
                routeRight.scale.setScalar(srcScale * sourceH / cameraWorld.position.z);

                i++;
            }
        }, INTERVAL);
    };

    document.getElementById("btn-screen").onclick = () => { zoom(true); };

    function render() {
        requestAnimationFrame(render);

        // Left
        renderer.setScissor(0, 0, 300, 300);
        renderer.setViewport(0, 0, 300, 300);
        renderer.clear();
        renderer.render(scene, cameraWorld);
        renderer.render(sceneScreenWrong, cameraScreen);

        // Right
        renderer.setScissor(300, 0, 300, 300);
        renderer.setViewport(300, 0, 300, 300);
        renderer.clear();
        renderer.render(scene, cameraWorld);
        renderer.render(sceneScreenRight, cameraScreen);
    };

    requestAnimationFrame(render);
}

function _routeShape() {
    const shape = [
        425, 720, 0,
        590, 720, 0,
        613, 711, 0,
        662, 684, 0,
        703, 651, 0,
        740, 609, 0,
        762, 541, 0,
        756, 500, 0,
        700, 425, 0,
        677, 345, 0,
    ];

    const pointCount = shape.length / 3;
    for (let i = 0; i < pointCount; i++) {
        shape[i * 3 + 0] = shape[i * 3 + 0] / 1024 - 0.5;
        shape[i * 3 + 1] = -shape[i * 3 + 1] / 1024 + 0.5;
    }

    return shape;
}