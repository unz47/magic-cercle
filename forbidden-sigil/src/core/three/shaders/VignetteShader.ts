import type { IUniform } from 'three'

export const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null } as IUniform,
    intensity: { value: 0.8 } as IUniform,
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float vignette = 1.0 - smoothstep(0.3, 0.9, dist * intensity * 1.5);
      color.rgb *= vignette;
      gl_FragColor = color;
    }
  `,
}
