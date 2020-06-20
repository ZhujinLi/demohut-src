uniform sampler2D u_diffTex;
uniform sampler2D u_normalTex;
uniform bool u_enableDiff;
uniform bool u_enableNormal;

varying vec2 v_uv;
varying vec3 v_lightDir;

vec3 calcDiffuse(vec3 c, vec3 normal, vec3 lightDir)
{
	return c * dot(lightDir, normal);
}

void main()
{
	vec3 lightDir = normalize(v_lightDir);

	vec3 normal;
	if (u_enableNormal)
		normal = normalize(texture2D(u_normalTex, v_uv).rgb);
	else
		normal = vec3(0., 0., 1.);

	vec3 diffuseColor;
	if (u_enableDiff)
		diffuseColor = texture2D(u_diffTex, v_uv).rgb;
	else
		diffuseColor = vec3(1., 1., 1.);
	diffuseColor = calcDiffuse(diffuseColor, normal, lightDir);

	gl_FragColor = vec4(diffuseColor, 1.0);
}
