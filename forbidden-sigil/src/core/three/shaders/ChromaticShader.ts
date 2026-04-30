import type { IUniform } from 'three'

export const ChromaticShader = {
  uniforms: {
    tDiffuse: { value: null } as IUniform,
    offset: { value: 0.003 } as IUniform,
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
    uniform float offset;
    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - 0.5;
      float r = texture2D(tDiffuse, vUv + dir * offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * offset).b;
      float a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `,
}
