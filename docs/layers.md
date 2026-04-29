# レイヤーカタログ・グリフ・テーマ・配置

## 設計方針

- 各レイヤーは**単機能・合成可能**にする（Unix哲学）
- 同カテゴリ内のレイヤーを組み合わせるだけでも魔法陣として成立する
- パラメーター名は全レイヤーで統一命名規則（count, thickness, size 等）

凡例:
- 難易度: ★=低 / ★★=中 / ★★★=高
- フェーズ: そのレイヤーが投入されるリリースバージョン

---

## A. 幾何構造（Geometric Structure）— 魔法陣の骨格

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 1 | **Ring** | 単一の円環。太さ・破線・二重線を制御 | thickness, dashed, dashGap, double | ★ | v0.1 |
| 2 | **Polygon** | 正N角形（三角〜十二角） | sides(3-12), thickness, rounded | ★ | v0.1 |
| 3 | **StarPolygon** | 星型多角形 {n/skip} | n(3-12), skip(1-n/2), thickness | ★ | v0.1 |
| 4 | **Spokes** | 中心から放射する直線群 | count(2-36), lengthInner, lengthOuter, thickness | ★ | v0.1 |
| 5 | **Crescent** | 三日月・弧月形を任意角度に配置 | phase(0-1), arc, thickness, count | ★ | v0.2 |
| 6 | **VesicaPiscis** | 2円の重なりで生まれるアーモンド形 | overlap(0-1), count, rotateStep | ★★ | v0.3 |
| 7 | **SpiralArm** | アルキメデス/対数螺旋の腕 | armCount(1-8), turns, tightness, direction | ★★ | v0.3 |
| 8 | **ConcentricRings** | 等間隔の多重同心円を一括生成 | ringCount(2-20), spacing, thicknessDecay | ★ | v0.1 |

## B. 神聖幾何学（Sacred Geometry）— 宗教・オカルト由来の幾何模様

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 9 | **FlowerOfLife** | 重なり合う円の幾何学模様 | depth(1-6), showSeed, showFruit | ★★ | v0.3 |
| 10 | **MetatronsCube** | メタトロンの立方体（13頂点フレーム） | showLines, showCircles, scale | ★★ | v0.4 |
| 11 | **SriYantra** | 9つの三角形が組み合うヒンドゥーの曼荼羅 | precision, showLotus, showGates | ★★★ | v0.5 |
| 12 | **HexagramGrid** | ダビデの星が繰り返すタイル模様 | cellCount, showOutline, fillAlternate | ★★ | v0.4 |

## C. テキスト・文字（Text & Script）— 呪文・銘・暗号

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 13 | **RuneBand** | 円周上に記号列を等間隔配置 | count(6-40), glyphSet, glyphSize, spacing | ★★ | v0.2 |
| 14 | **TextBand** | 円周上に任意テキストを描画 | text, font, fontSize, letterSpacing, reverse | ★★ | v0.4 |
| 15 | **SpiralText** | 中心に向かって螺旋状にテキストを配置 | text, turns, shrinkRate, startRadius | ★★ | v0.4 |
| 16 | **PillarText** | 東西南北（4/8方位）に縦書きテキスト列 | texts[], positions(4/8), font, fontSize | ★★ | v0.4 |
| 17 | **CipherWheel** | 内外2重リングの暗号解読盤表現 | innerAlphabet, outerAlphabet, shift, showArrow | ★★ | v0.5 |

## D. シンボル・アイコン（Symbolic Icons）— 神秘記号・紋章

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 18 | **VertexMarks** | 多角形の頂点に配置する装飾マーク | shape(dot/diamond/cross/star/custom), size, hostLayer | ★ | v0.1 |
| 19 | **CoreSigil** | 中心に置くメインシンボル | glyphSet, glyphIndex, size, rotation | ★★ | v0.1 |
| 20 | **ZodiacRing** | 黄道十二宮の記号を円周配置 | showAll(12), highlight[], size, style | ★ | v0.3 |
| 21 | **PlanetarySymbols** | 七惑星の錬金術記号を配置 | planets[], layout(circle/vertices/cardinal), size | ★ | v0.3 |
| 22 | **ElementalTriangles** | 四大元素（火水風土）の三角形記号 | elements[], size, style(filled/outline), positions | ★ | v0.2 |
| 23 | **MoonPhases** | 朔望月の月相アイコンを円周配置 | phaseCount(4/8/12), style, size | ★ | v0.3 |
| 24 | **CompassRose** | 方位盤（4/8/16方位）の装飾的表現 | directions(4/8/16), style(simple/ornate), size | ★★ | v0.3 |

## E. 装飾・ボーダー（Decorative Borders）— 縁取り・鎖・紋様帯

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 25 | **DotChain** | 大小のドットが連なる数珠状ボーダー | dotCount, sizePattern(uniform/alternating/decay), gap | ★ | v0.2 |
| 26 | **WavePattern** | 正弦波・鋸歯波・三角波の円環ボーダー | waveType(sine/sawtooth/triangle), frequency, amplitude | ★ | v0.2 |
| 27 | **ThornChain** | 棘・突起が並ぶ防御的ボーダー | thornCount, thornLength, style(sharp/curved), bilateral | ★★ | v0.3 |
| 28 | **KnotworkBorder** | ケルト風の組紐ボーダー | complexity(1-5), bandWidth, crossings | ★★★ | v0.5 |

## F. フィル・テクスチャ（Fill & Texture）— 面を埋めるパターン

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 29 | **FillPattern** | 円内を埋める模様（格子/放射/同心円/蜂の巣） | pattern(grid/radial/concentric/honeycomb), density, clip | ★★ | v0.3 |
| 30 | **Crack** | ひび割れテクスチャ（封印の解放感） | crackCount, depth, branchFactor, spread | ★★ | v0.5 |

## G. エフェクト・パーティクル（Effects & Particles）— 動的演出

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 31 | **AmbientParticles** | 浮遊する光の粒子 | count(10-500), speed, sizeRange, drift | ★★ | v0.2 |
| 32 | **EnergyBeams** | 中心または頂点から放射するビーム | beamCount, length, flickerSpeed, taper | ★★ | v0.4 |
| 33 | **PulseRings** | 中心から周期的に拡大する衝撃波リング | pulseSpeed, interval, fadeDistance, maxRings | ★★ | v0.3 |
| 34 | **LightningArcs** | 頂点間を走る稲妻（プロシージャル） | arcCount, jaggedness, branchProb, flickerRate | ★★★ | v0.5 |

## H. 3D専用要素（3D-Specific）— 奥行きを活かす立体演出

| # | レイヤー名 | 概要 | 主要パラメーター | 難易度 | フェーズ |
|---|-----------|------|-----------------|--------|---------|
| 35 | **FloatingOrbs** | 頂点上空に浮遊する光球 | count, height, size, pulseSpeed, trailLength | ★★ | v0.3 |
| 36 | **GimbalRings** | ジンバル状に交差する回転リング | ringCount(2-4), tiltAngles[], spinSpeeds[], thickness | ★★ | v0.4 |

---

## レイヤー投入ロードマップ

| フェーズ | レイヤー数 | 追加レイヤー |
|---------|-----------|------------|
| **v0.1** MVP | 8種 | Ring, Polygon, StarPolygon, Spokes, ConcentricRings, VertexMarks, CoreSigil, AmbientParticles |
| **v0.2** 3D配置 | +6 = 14種 | Crescent, ElementalTriangles, DotChain, WavePattern, RuneBand, EnergyBeams（簡易版） |
| **v0.3** エディター | +11 = 25種 | VesicaPiscis, SpiralArm, FlowerOfLife, ZodiacRing, PlanetarySymbols, MoonPhases, CompassRose, ThornChain, FillPattern, FloatingOrbs, PulseRings |
| **v0.4** シード | +6 = 31種 | TextBand, SpiralText, PillarText, MetatronsCube, HexagramGrid, GimbalRings, EnergyBeams |
| **v0.5** 拡張 | +5 = 36種 | SriYantra, CipherWheel, KnotworkBorder, Crack, LightningArcs |

---

## グリフセット（記号ライブラリ）

レイヤー（RuneBand, CoreSigil, VertexMarks 等）で使える記号セット。
各セットは**自作SVGまたはCC0ライセンスのみ**で構成する。

| セットID | 名称 | 記号数 | 内容 | 投入 |
|---------|------|--------|------|------|
| `elder-futhark` | エルダー・フサルク | 24 | 古ノルド語ルーン文字（ᚠᚢᚦ...） | v0.1 |
| `occult` | オカルト汎用 | 20+ | ペンタクル・ヘキサグラム・目・蛇・十字 | v0.1 |
| `alchemical` | 錬金術記号 | 30+ | 元素・プロセス・金属記号 | v0.2 |
| `elemental` | 四大元素 | 8 | 火/水/風/土の三角形 + 錬金四元素 | v0.2 |
| `geometric` | 幾何プリミティブ | 12 | 丸・三角・四角・十字・菱形 等 | v0.2 |
| `zodiac` | 黄道十二宮 | 12 | ♈♉♊♋♌♍♎♏♐♑♒♓ | v0.3 |
| `planetary` | 惑星記号 | 10 | ☉☽♂♃♄♅♆ + ☊☋ | v0.3 |
| `theban` | テーバン文字 | 26 | 魔女のアルファベット | v0.3 |
| `kanji` | 漢字（魔法系） | 30+ | 魔・封・炎・氷・雷・光・闇・陣・禁・呪… | v0.3 |
| `enochian` | エノク文字 | 21 | ジョン・ディー / エドワード・ケリー | v0.4 |
| `anglo-saxon` | アングロサクソン | 33 | 拡張ルーン文字 | v0.4 |
| `younger-futhark` | ヤンガー・フサルク | 16 | 後期ノルドルーン | v0.4 |
| `astro` | 天文記号 | 15+ | 恒星・星座・小惑星記号 | v0.5 |
| `custom` | ユーザーカスタム | 任意 | SVGインポートで追加可能（SHOULD） | v0.5 |

---

## テーマプリセット（全8種）

| テーマID | 名称 | Primary | Secondary | Glow | イメージ |
|---------|------|---------|-----------|------|---------|
| `hellfire` | 業火 | #FF4400 | #FFD700 | 1.5 | 地獄の炎、ダークファンタジー |
| `frost` | 氷霜 | #00CCFF | #FFFFFF | 1.2 | 凍てつく氷、北欧神話 |
| `void` | 虚空 | #8B00FF | #1A0033 | 1.8 | 深淵、ラヴクラフト的恐怖 |
| `verdant` | 蒼翠 | #00FF88 | #004422 | 1.0 | 森の魔法、ドルイド |
| `holy` | 聖光 | #FFD700 | #FFFFF0 | 2.0 | 天使の輝き、聖なる力 |
| `blood` | 血盟 | #CC0000 | #330000 | 1.3 | 血の契約、禁術 |
| `twilight` | 黄昏 | #FF6B9D | #2D1B69 | 1.1 | 薄暮、境界の時間 |
| `moonlight` | 月白 | #C0C0FF | #1A1A2E | 0.9 | 月光、静謐な魔法 |

---

## 3D配置プリセット（全5種 + Custom）

| 配置ID | 名称 | 概要 |
|--------|------|------|
| `flat` | 平面 | 全レイヤーをY=0の同一平面に配置。古典的な2D魔法陣の見た目 |
| `stack` | 積層 | レイヤーをY軸方向に等間隔で積み上げ。召喚塔のイメージ |
| `sphere` | 球面 | レイヤーを球面上に分散配置。結界・防御魔法のイメージ |
| `cylinder` | 円筒 | レイヤーを円筒面に沿って配置。封印柱のイメージ |
| `tilted` | 傾斜 | 各レイヤーを少しずつ傾けて配置。ドクター・ストレンジ的な演出 |
| `custom` | 自由 | レイヤーごとに個別にtransformを設定。上級者向け |
