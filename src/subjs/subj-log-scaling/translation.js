import * as THREE from "three";

export function showTranslation() {
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas-translation") });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setScissorTest(true);
    renderer.setSize(600, 300);
    renderer.autoClear = false; // As we render two times for each part here

    const cameraWrong = new THREE.PerspectiveCamera(90, 1, 0.001, 100);
    cameraWrong.position.set(0, 0, 0.5);
    cameraWrong.lookAt(0, 0, 0);

    const cameraRight = cameraWrong.clone();

    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("./gta_map.jpg") })));

    // The position where zooming is around
    const X = 0.25;
    const Y = 0.25;
    const circle = new THREE.Mesh(new THREE.CircleGeometry(0.01, 30),
        new THREE.MeshBasicMaterial({ color: "red" }));
    circle.position.set(X, Y, 0);
    scene.add(circle);

    // Add the cross reference
    //
    const sceneRef = new THREE.Scene();
    const lineH = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.005), new THREE.MeshBasicMaterial({ color: "black" }));
    const lineV = new THREE.Mesh(new THREE.PlaneGeometry(0.005, 10), new THREE.MeshBasicMaterial({ color: "black" }));
    lineH.position.x = lineV.position.x = X;
    lineH.position.y = lineV.position.y = Y;
    sceneRef.add(lineH);
    sceneRef.add(lineV);

    const cameraRef = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 100);
    cameraRef.position.set(0, 0, 0.5);

    // Perform zoom in/out animation
    let zoomTimer;
    let isZoomIn = false;
    function zoom() {
        if (zoomTimer) {
            return;
        }

        isZoomIn = !isZoomIn;

        // This is a simplified version of that formula
        const zoomFromHeight = (height) => Math.log(1 / height) / Math.log(2);
        const heightFromZoom = (zoom) => 1 / Math.pow(2, zoom);

        const lerp = (x, y, a) => x + (y - x) * a;

        const INTERVAL = 18;
        const FRAMES = 30;
        const SFACTOR = 4;
        const targetH = isZoomIn ? cameraRight.position.z / SFACTOR : cameraRight.position.z * SFACTOR;
        const translation = new THREE.Vector3();
        translation.z = targetH - cameraRight.position.z;
        translation.x = -translation.z / 2;
        translation.y = -translation.z / 2;
        const srcPos = cameraRight.position.clone();
        const targetPos = cameraRight.position.clone().add(translation);
        const srcZoom = zoomFromHeight(srcPos.z);
        const targetZoom = zoomFromHeight(targetPos.z);
        let i = 0;
        zoomTimer = setInterval(() => {
            if (i > FRAMES) {
                clearInterval(zoomTimer);
                zoomTimer = null;
            } else {
                cameraWrong.position.x = lerp(srcPos.x, targetPos.x, i / FRAMES);
                cameraWrong.position.y = lerp(srcPos.y, targetPos.y, i / FRAMES);
                // Simulate logarithmic form
                cameraWrong.position.z = heightFromZoom(lerp(srcZoom, targetZoom, i / FRAMES));

                cameraRight.position.x = lerp(srcPos.x, targetPos.x, i / FRAMES);
                cameraRight.position.y = lerp(srcPos.y, targetPos.y, i / FRAMES);
                cameraRight.position.z = lerp(srcPos.z, targetPos.z, i / FRAMES);

                i++;
            }
        }, INTERVAL);
    };

    document.getElementById("btn-translation").onclick = () => { zoom(true); };

    function render() {
        requestAnimationFrame(render);

        // Left
        renderer.setScissor(0, 0, 300, 300);
        renderer.setViewport(0, 0, 300, 300);
        renderer.clear();
        renderer.render(scene, cameraWrong);
        renderer.render(sceneRef, cameraRef);

        // Right
        renderer.setScissor(300, 0, 300, 300);
        renderer.setViewport(300, 0, 300, 300);
        renderer.clear();
        renderer.render(scene, cameraRight);
        renderer.render(sceneRef, cameraRef);
    };

    requestAnimationFrame(render);
}