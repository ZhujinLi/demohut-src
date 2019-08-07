import * as three from 'three'

var scene = new three.Scene();
var camera = new three.PerspectiveCamera(45, window.innerWidth / 
	window.innerHeight, 0.1, 1000);

var renderer = new three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new three.BoxGeometry(1, 1, 1);
var material = new three.MeshBasicMaterial({color: 0x00ff00});
var cube = new three.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
	cube.rotation.x += 0.05;
	cube.rotation.y += 0.05;
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}
animate();
