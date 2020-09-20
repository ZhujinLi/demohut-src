varying vec2 v_xy;

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    v_xy = gl_Position.xy / gl_Position.w;
}