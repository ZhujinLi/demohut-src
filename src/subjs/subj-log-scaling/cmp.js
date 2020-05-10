import * as THREE from "three";

export function showCmp() {
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas-cmp") });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setScissorTest(true);
    renderer.setSize(600, 300);
    renderer.setClearColor("white");

    const cameraScale = new THREE.PerspectiveCamera(50, 1, 0.001, 100);
    cameraScale.position.set(0, 0, 0.5);
    cameraScale.lookAt(0, 0, 0);

    const cameraZoom = cameraScale.clone();

    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("./gta_map.jpg") })));

    let zoomTimer;
    function zoom(zoomIn) {
        if (zoomTimer) {
            clearInterval(zoomTimer);
            zoomTimer = null;
        }

        const INTERVAL = 18;
        const FRAME = 10;
        const stepScale = zoomIn ? -0.01 : 0.01;
        const stepZoom = zoomIn ? 0.98 : 1 / (0.98);
        let i = 0;
        zoomTimer = setInterval(() => {
            if (i > FRAME || cameraScale.position.z + stepScale < 0) {
                clearInterval(zoomTimer);
                zoomTimer = null;
            } else {
                cameraScale.position.z += stepScale;
                cameraZoom.position.z *= stepZoom;
                i++;
            }
        }, INTERVAL);
    };

    document.getElementById("btn-cmp-zoom-in").onclick = () => { zoom(true); };
    document.getElementById("btn-cmp-zoom-out").onclick = () => { zoom(false); };

    function render() {
        requestAnimationFrame(render);

        // Left (scale)
        renderer.setScissor(0, 0, 300, 300);
        renderer.setViewport(0, 0, 300, 300);
        renderer.render(scene, cameraScale);

        // Right (zoom)
        renderer.setScissor(300, 0, 300, 300);
        renderer.setViewport(300, 0, 300, 300);
        renderer.render(scene, cameraZoom);
    };

    requestAnimationFrame(render);
}