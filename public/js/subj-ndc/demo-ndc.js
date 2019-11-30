import '/three/build/three.min.js';
import '/three/examples/js/loaders/GLTFLoader.js';
import '/three/examples/js/loaders/OBJLoader.js';
import '/three/examples/js/controls/OrbitControls.js';

/* global Chart */

export function showDemoNdc() {
    const W = 900, H = 300;
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('view-ndc') });
    const scene = new THREE.Scene();
    const scene2 = new THREE.Scene();
    const mainCamera = new THREE.PerspectiveCamera(45, W / H / 3);
    const auxCamera = new THREE.PerspectiveCamera(45, W / H / 3);
    const auxCamera2 = new THREE.OrthographicCamera(-2, 2, 2, -2, -10, 10);
    let cameraHelper;
    let lineChart;
    const normalSpheres = new Array();
    const projSpheres = new Array();

    initView();
    initGUI();
    update();
    requestAnimationFrame(render);

    function initView() {
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setScissorTest(true);

        mainCamera.position.set(10, 10, 30);
        mainCamera.lookAt(0, 0, 0);
        mainCamera.updateProjectionMatrix();

        auxCamera.position.set(200, 200, 0);
        auxCamera.near = 0.1;
        auxCamera.far = 10000;
        auxCamera.lookAt(0, 0, 0);
        auxCamera.updateProjectionMatrix();

        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(0, 10, 0);
            light.target.position.set(-5, 0, 0);
            scene.add(light);
            scene.add(light.target);

            const light2 = new THREE.DirectionalLight().copy(light);
            scene2.add(light2);
            scene2.add(light2.target);
        }

        {
            const sphereRadius = 3;
            const sphereWidthDivisions = 32;
            const sphereHeightDivisions = 16;
            const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
            for (let i = 0; i < 20; ++i) {
                const sphereMat = new THREE.MeshPhongMaterial();
                sphereMat.color.setHSL(i * .73, 1, 0.5);
                const mesh = new THREE.Mesh(sphereGeo, sphereMat);
                mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
                mesh.updateMatrix();
                scene.add(mesh);
                normalSpheres.push(mesh);

                const projGeo = new THREE.SphereGeometry().copy(sphereGeo);
                const projMesh = new THREE.Mesh(projGeo, sphereMat);
                projSpheres.push(projMesh);
                scene2.add(projMesh);
            }
        }

        const loader = new THREE.TextureLoader();
        loader.load('/images/checker.png', (texture) => {
            const planeSize = 400;

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            const repeats = planeSize / 2;
            texture.repeat.set(repeats, repeats);

            const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
            const planeMat = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
            const mesh = new THREE.Mesh(planeGeo, planeMat);
            mesh.rotation.x = Math.PI * -.5;
            scene.add(mesh);

            requestAnimationFrame(render);
        });

        scene.add(new THREE.AxesHelper(100));

        cameraHelper = new THREE.CameraHelper(mainCamera);
        cameraHelper.material.depthTest = false;
        cameraHelper.renderOrder = 10;
        scene.add(cameraHelper);

        auxCamera2.position.set(1, 1.5, 0.5);
        auxCamera2.lookAt(0, 0, 0);
        auxCamera2.updateProjectionMatrix();

        scene2.add(new THREE.AxesHelper(2));

        const unitBoxGeo = new THREE.BoxBufferGeometry(2, 2, 2);
        const unitBoxMtl = new THREE.MeshBasicMaterial({ color: "#ff0", wireframe: true });
        const unitBox = new THREE.Mesh(unitBoxGeo, unitBoxMtl);
        scene2.add(unitBox);

        const domMid = document.getElementById("area-ndc-middle");
        new THREE.OrbitControls(auxCamera, domMid);
        domMid.onmousemove = domMid.onwheel = () => { requestAnimationFrame(render) };

        const domRight = document.getElementById("area-ndc-right");
        new THREE.OrbitControls(auxCamera2, domRight);
        domRight.onmousemove = domRight.onwheel = () => { requestAnimationFrame(render) };
    }

    function update() {
        const value = document.getElementById('slider-near').value;
        const near = 10 ** value;
        mainCamera.near = near;
        mainCamera.far = near + 100;
        mainCamera.updateProjectionMatrix();

        cameraHelper.update();

        document.getElementById('label-near').innerHTML = 'near: ' + near.toFixed(5);

        const points = [];
        const n = mainCamera.near;
        const f = mainCamera.far;
        const step = n < 1 ? 0.1 : 1;
        for (let z = mainCamera.near; z <= mainCamera.far; z += step)
            points.push({
                x: z - mainCamera.near,
                y: -(2 * f * n / (f - n)) * (1 / z) + (f + n) / (f - n)
            });
        lineChart.data.datasets[0].data = points;
        lineChart.update();

        const translateVec = new THREE.Vector3().copy(mainCamera.position).negate();
        const translateMat = new THREE.Matrix4().makeTranslation(translateVec.x, translateVec.y, translateVec.z);
        const lookAtMat = new THREE.Matrix4().makeRotationFromQuaternion(mainCamera.quaternion);
        lookAtMat.getInverse(lookAtMat);
        const viewMat = new THREE.Matrix4().copy(lookAtMat).multiply(translateMat);
        projSpheres.forEach((projSphere, i) => {
            const mvp = new THREE.Matrix4().copy(mainCamera.projectionMatrix)
                .multiply(viewMat)
                .multiply(normalSpheres[i].matrix);
            normalSpheres[i].geometry.vertices.forEach((v3, j) => {
                const v4 = new THREE.Vector4(v3.x, v3.y, v3.z, 1);
                v4.applyMatrix4(mvp);
                v4.multiplyScalar(1 / v4.w);
                projSphere.geometry.vertices[j].set(v4.x, v4.y, -v4.z);
            })
            projSphere.geometry.verticesNeedUpdate = true;
        });

        requestAnimationFrame(render);
    }

    function initGUI() {
        const sliderNear = document.getElementById('slider-near');
        sliderNear.min = -5;    // log
        sliderNear.max = 2;
        sliderNear.value = 0;
        sliderNear.step = 0.01;
        sliderNear.oninput = update;

        const dists = [];
        for (let i = 0; i <= 100; i += 10)
            dists.push(i);

        lineChart = new Chart('plot-ndc', {
            type: 'line',
            data: {
                labels: dists,
                datasets: [
                    { data: [], fill: false, pointRadius: 0 }
                ]
            },
            options: {
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: -1,
                            max: 1
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'z_ndc'
                        }
                    }],
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            min: 0,
                            max: 100,
                            stepSize: 10,
                            fixedStepSize: 1,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'z-near'
                        }
                    }]
                },
                legend: {
                    display: false
                }
            }
        });
    }

    function render() {
        const leftArea = new THREE.Vector4(0, 0, W / 3, H);
        cameraHelper.visible = false;
        renderer.setViewport(leftArea);
        renderer.setScissor(leftArea);
        renderer.render(scene, mainCamera);

        const middleArea = new THREE.Vector4(W / 3, 0, W / 3, H);
        cameraHelper.visible = true;
        renderer.setViewport(middleArea);
        renderer.setScissor(middleArea);
        renderer.render(scene, auxCamera);

        const rightArea = new THREE.Vector4(W * 2 / 3, 0, W / 3, H);
        renderer.setViewport(rightArea);
        renderer.setScissor(rightArea);
        renderer.render(scene2, auxCamera2);
    }
}