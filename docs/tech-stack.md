# 技術スタック・アーキテクチャ・ディレクトリ構成

## フレームワーク選定

### 結論: React 19 + Vite

このプロジェクトの特性:
- SPA 1画面。ルーティング不要（URLハッシュのみ）
- Three.js が主役。UIは補助的なスライダー・パネル
- バンドルサイズ最小が望ましい（500KB gzip 目標）
- リアクティブなパラメーター操作がUXの肝

| 選択肢 | バンドル | リアクティビティ | Three.js相性 | 判定 |
|--------|---------|----------------|-------------|------|
| **React 19** | 中（40KB gzip） | hooks | 素のThree.jsを直接操作 | **採用** |
| Svelte 5 | 極小 | Runes | 良い | 学習コスト |
| Angular | 大 | Signals | 過剰 | 却下 |
| Vue 3 | 小〜中 | ref/reactive | 悪くない | 決め手なし |

**React を選ぶ理由:**
1. **開発者の習熟度** — 慣れたツールで副業プロジェクトの最大リスク「完成しない」を回避
2. **エコシステム** — UIライブラリ（radix-ui等）、ドラッグ&ドロップ（dnd-kit）等が豊富
3. **Three.js との統合** — R3F は使わず、`useRef` + `useEffect` で canvas を直接管理。Core/Pure 層は React 非依存なので抽象化の無駄がない
4. **Zustand** — 軽量状態管理（1.1KB gzip）。SigilConfig のグローバル状態をシンプルに管理

### R3F（React Three Fiber）を使わない理由

R3F は宣言的に3Dシーンを書けて便利だが、このプロジェクトでは:
- 各レイヤーが **自前の Three.js クラス** で Object3D を生成する設計
- レイヤーの動的追加/削除/並び替えが頻繁に発生
- カスタムシェーダー・ポストプロセスを多用

→ R3F の宣言的抽象がむしろ邪魔になる。素の Three.js を React の外側で管理し、`useEffect` で橋渡しする方がクリーン。

---

## 技術スタック一覧

| カテゴリ | 採用 | 理由 |
|---------|------|------|
| フレームワーク | React 19 | 習熟度、エコシステム |
| ビルド | Vite 6 | 高速HMR、React公式対応 |
| 言語 | TypeScript 5.x (strict) | 型安全 |
| 3Dライブラリ | Three.js r170+ | デファクト |
| 線描画 | Line2 (three/examples/jsm/lines) | 太線必須 |
| ポストプロセス | UnrealBloomPass | グロー演出の主役 |
| カメラ操作 | 自前実装 | モバイル対応のため（OrbitControlsは重い） |
| UIスタイル | Tailwind CSS v4 | 速い、軽い |
| 状態管理 | Zustand | 軽量（1.1KB）、ボイラープレート少 |
| UIコンポーネント | Radix UI (Primitives) | アクセシブル、unstyled |
| ドラッグ&ドロップ | dnd-kit | レイヤー並び替え用 |
| URL圧縮 | lz-string | 50KB→5KB圧縮 |
| ホスティング | Cloudflare Pages or Vercel | 静的サイトに最適、無料枠大 |
| ドメイン | Cloudflare | カスタムドメイン |
| アクセス計測 | Plausible Analytics | プライバシー配慮、軽量 |
| エラー追跡 | Sentry（無料枠） | 本番障害検知 |
| 画像書き出し | renderer.domElement.toBlob() + OffscreenCanvas | 高解像度時の負荷分散 |
| GIF書き出し | gif.js | クライアントサイドで完結 |
| フォント | UnifrakturMaguntia, Cinzel Decorative, Noto Serif JP | Google Fonts |
| テスト | Vitest + Playwright | 単体 + E2E |

---

## アーキテクチャ

3層分離（React 層を差し替えても Core/Pure は影響を受けない）:

```
┌─────────────────────────────────────────┐
│  App Layer (React Components)           │
│  - SigilCanvas, BasicPanel, LayerEditor │
│  - ShareDialog, ThemePicker             │
│  - Zustand Store で状態管理             │
└──────────────────┬──────────────────────┘
                   │ uses
┌──────────────────┴──────────────────────┐
│  Core Layer (Three.js Domain)           │
│  - Sigil (Object3D group)               │
│  - Layer classes (RingLayer, etc.)       │
│  - Arrangements, Themes, Renderer       │
└──────────────────┬──────────────────────┘
                   │ uses
┌──────────────────┴──────────────────────┐
│  Pure Layer (Framework-Free Logic)      │
│  - SigilConfig types                    │
│  - Seed RNG, Serialize/Deserialize      │
│  - Glyph definitions                    │
└─────────────────────────────────────────┘
```

**Pure Layer** はフレームワーク・Three.js 非依存にする。
ユニットテストが書きやすく、将来別フレームワーク版を作るときに再利用できる。

### React ↔ Three.js の接続パターン

```tsx
// SigilCanvas.tsx — React と Three.js の橋渡し
function SigilCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sigilRef = useRef<SigilEngine | null>(null)
  const config = useSigilStore((s) => s.config)

  // 初期化（マウント時に1回だけ）
  useEffect(() => {
    const engine = new SigilEngine(canvasRef.current!)
    sigilRef.current = engine
    return () => engine.dispose()
  }, [])

  // config 変更時に Three.js 側を更新
  useEffect(() => {
    sigilRef.current?.updateConfig(config)
  }, [config])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
```

---

## ディレクトリ構成

```
forbidden-sigil/
├── public/
│   ├── glyphs/                        # グリフSVGアセット（14セット）
│   │   ├── elder-futhark/
│   │   ├── younger-futhark/
│   │   ├── anglo-saxon/
│   │   ├── theban/
│   │   ├── enochian/
│   │   ├── alchemical/
│   │   ├── planetary/
│   │   ├── zodiac/
│   │   ├── elemental/
│   │   ├── occult/
│   │   ├── kanji/
│   │   ├── astro/
│   │   └── geometric/
│   └── og-image.png
├── src/
│   ├── pure/                          # フレームワーク非依存
│   │   ├── config/
│   │   │   ├── SigilConfig.ts
│   │   │   ├── LayerConfig.ts         # 全36種のレイヤー型定義
│   │   │   ├── LayerTransform.ts
│   │   │   ├── GlyphSetId.ts
│   │   │   └── defaults.ts            # 各レイヤーのデフォルト値
│   │   ├── seed/
│   │   │   ├── rng.ts                 # mulberry32
│   │   │   ├── hash.ts                # cyrb53
│   │   │   └── generateFromSeed.ts
│   │   ├── serialize/
│   │   │   ├── toUrlHash.ts
│   │   │   └── fromUrlHash.ts
│   │   ├── arrangements/
│   │   │   ├── flat.ts
│   │   │   ├── stack.ts
│   │   │   ├── sphere.ts
│   │   │   ├── cylinder.ts
│   │   │   └── tilted.ts
│   │   ├── themes/
│   │   │   ├── hellfire.ts
│   │   │   ├── frost.ts
│   │   │   ├── void.ts
│   │   │   ├── verdant.ts
│   │   │   ├── holy.ts
│   │   │   ├── blood.ts
│   │   │   ├── twilight.ts
│   │   │   └── moonlight.ts
│   │   └── glyphs/
│   │       ├── glyphSets.ts
│   │       └── glyphRegistry.ts
│   │
│   ├── core/                          # Three.js 統合
│   │   ├── SigilEngine.ts             # メインエンジン（init/update/dispose）
│   │   ├── Sigil.ts                   # Object3D グループ
│   │   ├── layers/
│   │   │   ├── Layer.ts               # 抽象基底クラス
│   │   │   ├── createLayer.ts         # ファクトリー
│   │   │   ├── geometric/             # A. 幾何構造 (8種)
│   │   │   ├── sacred/                # B. 神聖幾何学 (4種)
│   │   │   ├── text/                  # C. テキスト・文字 (5種)
│   │   │   ├── symbols/               # D. シンボル・アイコン (7種)
│   │   │   ├── borders/               # E. 装飾・ボーダー (4種)
│   │   │   ├── fill/                  # F. フィル・テクスチャ (2種)
│   │   │   ├── effects/               # G. エフェクト・パーティクル (4種)
│   │   │   └── spatial/               # H. 3D専用 (2種)
│   │   ├── three/
│   │   │   ├── Renderer.ts
│   │   │   ├── CameraController.ts
│   │   │   └── PostProcessing.ts
│   │   └── exporters/
│   │       ├── PngExporter.ts
│   │       └── GifExporter.ts
│   │
│   ├── ui/                            # React UI
│   │   ├── components/
│   │   │   ├── SigilCanvas.tsx        # Three.js canvas ラッパー
│   │   │   ├── BasicPanel.tsx         # スライダー群
│   │   │   ├── LayerList.tsx          # ドラッグ可能レイヤー一覧
│   │   │   ├── LayerCard.tsx          # 個別レイヤー編集
│   │   │   ├── LayerAddDialog.tsx
│   │   │   ├── ShareDialog.tsx
│   │   │   ├── ThemePicker.tsx
│   │   │   ├── ArrangementPicker.tsx
│   │   │   ├── GlyphPicker.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/
│   │   │   ├── useSigilEngine.ts      # Three.js エンジンのライフサイクル管理
│   │   │   └── useUrlSync.ts          # URLハッシュ ↔ config 同期
│   │   ├── stores/
│   │   │   └── sigilStore.ts          # Zustand store
│   │   └── App.tsx
│   │
│   ├── index.css                      # Tailwind
│   ├── main.tsx
│   └── index.html
├── tests/
│   ├── pure/                          # Vitest 単体テスト
│   └── e2e/                           # Playwright E2E
├── vite.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```
