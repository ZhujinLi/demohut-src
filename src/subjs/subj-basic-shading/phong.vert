varying vec3 v_normal;
varying vec3 v_position;

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	v_normal = normalize(normal);
	v_position = position;
}