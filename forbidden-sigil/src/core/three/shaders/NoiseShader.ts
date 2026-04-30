import type { IUniform } from 'three'

export const NoiseShader = {
  uniforms: {
    tDiffuse: { value: null } as IUniform,
    intensity: { value: 0.08 } as IUniform,
    time: { value: 0.0 } as IUniform,
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
    uniform float time;
    varying vec2 vUv;

    // Simple hash-based noise
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float n = rand(vUv + fract(time)) * 2.0 - 1.0;
      color.rgb += n * intensity;
      gl_FragColor = color;
    }
  `,
}
