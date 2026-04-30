/**
 * GPU パーティクルシェーダー
 *
 * 各パーティクルが持つ属性:
 *   aRandom : vec4  — (seed, phaseOffset, colorVariation, sizeVariation)
 *
 * uniform:
 *   uTime, uSpeed, uSpread/uRadius, uBaseSize, uColor, uType(int)
 *
 * Type:
 *   0 = risingSparks   上昇火花
 *   1 = dust           浮遊塵
 *   2 = orbital        軌道粒子
 *   3 = fireflies      蛍
 *   4 = energyMist     エネルギー霧
 *   5 = fallingAsh     降灰
 */

export const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSpread;
  uniform float uRadius;
  uniform float uBaseSize;
  uniform int   uType;

  attribute vec4 aRandom;

  varying float vAlpha;
  varying float vColorMix;

  #define PI  3.14159265
  #define TAU 6.28318530

  // pseudo-random from seed
  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  void main() {
    float seed    = aRandom.x;
    float phase   = aRandom.y;
    float cVar    = aRandom.z;   // color variation -1..1
    float sVar    = aRandom.w;   // size variation  0.5..1.5

    vColorMix = cVar;

    vec3 pos = vec3(0.0);
    float alpha = 1.0;
    float size  = uBaseSize * sVar;

    float t = uTime * uSpeed;

    if (uType == 0) {
      // ── Rising Sparks ──
      float life = fract(phase + t * 0.25);
      float angle = seed * TAU;
      float r = hash(seed * 7.13) * uSpread * 0.5;
      // 螺旋状に上昇
      float spiralAngle = angle + life * 2.0;
      pos.x = cos(spiralAngle) * r * (1.0 - life * 0.5);
      pos.z = sin(spiralAngle) * r * (1.0 - life * 0.5);
      pos.y = life * uSpread * 1.5 - uSpread * 0.2;
      // 上でフェードアウト、下でフェードイン
      alpha = smoothstep(0.0, 0.1, life) * smoothstep(1.0, 0.7, life);
      // 上にいくほど小さく
      size *= (1.0 - life * 0.6);
    }

    else if (uType == 1) {
      // ── Dust ──
      float ox = hash(seed * 1.17) * 2.0 - 1.0;
      float oy = hash(seed * 2.31) * 2.0 - 1.0;
      float oz = hash(seed * 3.47) * 2.0 - 1.0;
      float drift = t * 0.08;
      pos.x = ox * uSpread + sin(drift + phase * TAU) * 0.4;
      pos.y = oy * uSpread * 0.4 + sin(drift * 0.7 + seed * TAU) * 0.25;
      pos.z = oz * uSpread + cos(drift + phase * TAU) * 0.4;
      // 呼吸するような明滅
      alpha = 0.3 + sin(t * 0.5 + phase * TAU) * 0.15;
      size *= 0.7 + sin(t * 0.3 + seed * TAU) * 0.3;
    }

    else if (uType == 2) {
      // ── Orbital ──
      float angle = seed * TAU + t * 0.4 * (0.8 + hash(seed * 5.0) * 0.4);
      float r = uRadius + (hash(seed * 3.0) - 0.5) * 0.5;
      float yOff = sin(t * 0.4 + phase * TAU) * 0.35;
      // 楕円軌道のゆらぎ
      float eccentricity = 1.0 + hash(seed * 9.0) * 0.15;
      pos.x = cos(angle) * r * eccentricity;
      pos.y = yOff;
      pos.z = sin(angle) * r;
      alpha = 0.5 + sin(t * 1.5 + phase * TAU) * 0.3;
    }

    else if (uType == 3) {
      // ── Fireflies ──
      float ox = hash(seed * 1.5) * 2.0 - 1.0;
      float oy = hash(seed * 2.5);
      float oz = hash(seed * 3.5) * 2.0 - 1.0;
      float wander = t * 0.15;
      pos.x = ox * uSpread + sin(wander + seed * 13.0) * 0.6;
      pos.y = oy * uSpread * 0.5 + abs(sin(wander * 1.3 + phase * TAU)) * 0.6;
      pos.z = oz * uSpread + cos(wander + seed * 17.0) * 0.6;
      // 鋭い明滅（蛍っぽく）
      float blink = pow(max(sin(t * 2.5 + phase * TAU), 0.0), 4.0);
      alpha = 0.05 + blink * 0.9;
      size *= 0.6 + blink * 0.8;
    }

    else if (uType == 4) {
      // ── Energy Mist ──
      float angle = seed * TAU + t * 0.06;
      float r = phase * uSpread;
      float layerY = (hash(seed * 11.0) - 0.5) * 0.3;
      pos.x = cos(angle) * r + sin(t * 0.2 + seed * 5.0) * 0.15;
      pos.y = layerY + sin(t * 0.15 + phase * TAU) * 0.1;
      pos.z = sin(angle) * r + cos(t * 0.2 + seed * 7.0) * 0.15;
      // 密度感のある半透明
      alpha = 0.15 + sin(t * 0.3 + seed * TAU) * 0.08;
      size *= 1.5 + sin(t * 0.2 + phase * 10.0) * 0.5;
    }

    else if (uType == 5) {
      // ── Falling Ash ──
      float life = fract(phase + t * 0.15);
      float ox = hash(seed * 1.7) * 2.0 - 1.0;
      float oz = hash(seed * 2.9) * 2.0 - 1.0;
      // 左右にゆらゆら揺れながら降下
      float sway = sin(t * 0.6 + seed * TAU) * 0.4 * (1.0 + sin(t * 1.5 + phase * 10.0) * 0.3);
      pos.x = ox * uSpread + sway;
      pos.y = (1.0 - life) * uSpread * 1.2 - uSpread * 0.3;
      pos.z = oz * uSpread + cos(t * 0.4 + seed * TAU) * 0.25;
      // ゆっくり回転するような挙動
      alpha = smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.75, life) * 0.7;
      size *= 0.6 + sin(t + seed * 5.0) * 0.2;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // サイズ: 距離に応じて減衰（perspective）
    gl_PointSize = size * 300.0 / -mvPosition.z;

    vAlpha = alpha;
  }
`

export const particleFragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform int   uType;

  varying float vAlpha;
  varying float vColorMix;

  void main() {
    // ポイントの中心からの距離（0〜1）
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);

    // 円形クリップ
    if (dist > 0.5) discard;

    // ソフトグロー: 中心が明るく、端が暗い
    float glow = exp(-dist * dist * 8.0);

    // 外周に微弱な光の縁取り（エネルギー感）
    float rim = smoothstep(0.45, 0.35, dist) * 0.3;

    float intensity = glow + rim;

    // 色の微妙なバリエーション
    vec3 col = uColor;
    // warm shift
    col += vColorMix * vec3(0.1, -0.05, -0.08);

    // Firefly / Spark はよりシャープなグロー
    if (uType == 0 || uType == 3) {
      intensity = pow(glow, 1.5) + rim;
    }

    // Energy Mist はソフトに
    if (uType == 4) {
      intensity = glow * 0.7;
    }

    gl_FragColor = vec4(col * intensity, vAlpha * intensity);
  }
`
