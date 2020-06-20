uniform sampler2D u_heightfieldTex;
uniform bool u_enableDisplacement;

varying vec2 v_uv;
varying vec3 v_lightDir;

const vec3 LIGHT_POS = vec3(-1., 1., 1.);

void main() {
	vec4 pos = vec4(position, 1.0);
	if (u_enableDisplacement)
		pos.z = -texture2D(u_heightfieldTex, uv).r * 0.1;

	gl_Position = projectionMatrix * modelViewMatrix * pos;

	v_uv = uv;

	v_lightDir = LIGHT_POS - position;
}