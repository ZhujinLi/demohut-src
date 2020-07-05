uniform vec3 u_lightIntensity;
uniform vec3 u_lightPos;
uniform vec3 u_diffColor;
uniform vec3 u_specColor;
uniform vec3 u_cameraPos;
uniform float u_smoothness;

varying vec3 v_normal;
varying vec3 v_position;

void main() {
	vec3 l = normalize(u_lightPos - v_position);
	vec3 n = normalize(v_normal);
	float cosln = clamp(dot(l, n), 0.0, 1.0);

	vec3 diff = u_diffColor * u_lightIntensity * cosln;

	vec3 v = normalize(u_cameraPos - v_position);
	vec3 h = normalize(l + v);
	float coshn = clamp(dot(h, n), 0.0, 1.0);
	float m = u_smoothness;
	vec3 spec = (m + 8.0) / 8.0 * pow(coshn, m) * u_specColor * u_lightIntensity * cosln;

	gl_FragColor = vec4(diff + spec, 1.0);
}