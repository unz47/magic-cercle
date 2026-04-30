import type { IUniform } from 'three'

export const ScanLinesShader = {
  uniforms: {
    tDiffuse: { value: null } as IUniform,
    density: { value: 1.5 } as IUniform,
    opacity: { value: 0.15 } as IUniform,
    resolution: { value: 1080.0 } as IUniform,
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
    uniform float density;
    uniform float opacity;
    uniform float resolution;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float scanLine = sin(vUv.y * resolution * density) * 0.5 + 0.5;
      color.rgb -= scanLine * opacity;
      gl_FragColor = color;
    }
  `,
}
