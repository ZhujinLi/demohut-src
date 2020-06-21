uniform sampler2D u_diffTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_heightfieldTex;

uniform float u_depth;
uniform float u_ratioTexPerWorld;

uniform bool u_enableDiff;
uniform bool u_enableNormal;
uniform bool u_enableParallax;

// params of each method
uniform bool u_offsetLimiting;

varying vec2 v_uv;
varying vec3 v_lightDir;
varying vec3 v_viewDir;

vec3 calcDiffuse(vec3 c, vec3 normal, vec3 lightDir)
{
	return c * dot(lightDir, normal);
}

vec2 parallaxMapping(vec2 uv, vec3 viewDir)
{ 
    float height =  texture2D(u_heightfieldTex, uv).r;    
    vec2 p = viewDir.xy * (height * u_depth) * u_ratioTexPerWorld;
	if (!u_offsetLimiting)
		p /= viewDir.z;
    return uv - p;    
}

void main()
{
	vec3 lightDir = normalize(v_lightDir);
	vec3 viewDir = normalize(v_viewDir);

	vec2 uv = v_uv;
	if (u_enableParallax)
		uv = parallaxMapping(uv, viewDir);

	vec3 normal;
	if (u_enableNormal)
		normal = normalize(texture2D(u_normalTex, uv).rgb);
	else
		normal = vec3(0., 0., 1.);

	vec3 diffuseColor;
	if (u_enableDiff)
		diffuseColor = texture2D(u_diffTex, uv).rgb;
	else
		diffuseColor = vec3(1., 1., 1.);
	diffuseColor = calcDiffuse(diffuseColor, normal, lightDir);

	gl_FragColor = vec4(diffuseColor, 1.0);
}
