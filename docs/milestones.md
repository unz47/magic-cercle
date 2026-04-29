# リリースマイルストーン・開発工数・パフォーマンス予算

## マイルストーン詳細

### v0.1 — MVP「Flat魔法陣」（4〜6週）

**ゴール:** ブラウザで開いて魔法陣が見える、最小レベルでカスタムできる、URLで共有できる。

**レイヤー（8種）:**
- Ring, Polygon, StarPolygon, Spokes（幾何構造の基礎4種）
- ConcentricRings（同心円の一括生成）
- VertexMarks, CoreSigil（シンボル基礎2種）
- AmbientParticles（最小限のエフェクト）

**実装:**
- Vite + React 19 + TypeScript プロジェクトセットアップ
- Three.js シーンセットアップ + 自前カメラ操作
- Flat配置のみ
- 主要パラメーター10個のスライダーUI（ベーシックモードのみ）
- 単色固定（カラーピッカー1個、Primary/Secondary手動）
- 詠唱アニメーション（簡易版、reveal: fade のみ）
- Bloom グロー
- URL hash で SigilConfig 圧縮シェア
- PNG書き出し（現在の解像度のみ）
- モバイル基本対応

**グリフセット（2種）:** elder-futhark, occult

**リリース戦略:** 静かに公開、Twitterで内輪向け告知のみ。フィードバック収集。

---

### v0.2 — 3D配置 + 装飾拡充（2〜3週）

**ゴール:** 「3D空間で動かせる魔法陣」+ 装飾バリエーション拡大。

**追加レイヤー（+6種 = 計14種）:**
- Crescent（幾何構造）
- ElementalTriangles（シンボル）
- RuneBand（テキスト）
- DotChain, WavePattern（装飾ボーダー）
- EnergyBeams 簡易版（エフェクト）

**実装:**
- 配置プリセット3種（Flat/Stack/Tilted）
- カメラインタラクション強化（タッチ対応・慣性）
- 詠唱演出のクオリティアップ（reveal: draw, scale 追加）
- blendMode 対応（add, screen）

**グリフセット追加（+3種）:** alchemical, elemental, geometric

**リリース戦略:** クリエイティブコーディング系SNSに投下（#dailycoding、#threejs、#generative）。

---

### v0.3 — レイヤーエディター + 神聖幾何学（3〜4週）

**ゴール:** アドバンスドユーザーが好きにレイヤーを積める + 神聖幾何学で一気に表現力アップ。

**追加レイヤー（+11種 = 計25種）:**
- VesicaPiscis, SpiralArm（幾何構造）
- FlowerOfLife（神聖幾何学）
- ZodiacRing, PlanetarySymbols, MoonPhases, CompassRose（シンボル4種）
- ThornChain（装飾ボーダー）
- FillPattern（フィルパターン）
- FloatingOrbs, PulseRings（エフェクト + 3D）

**実装:**
- アドバンスドモードUI（ドロワー展開）
- レイヤー一覧コンポーネント（dnd-kit でドラッグ&ドロップ並び替え）
- レイヤーカード（個別パラメーター編集）
- レイヤー追加/削除/コピー
- 個別レイヤーの transform 上書き
- revealEffect 全4種対応（fade/draw/scale/spiral）

**グリフセット追加（+4種）:** zodiac, planetary, theban, kanji

**リリース戦略:** Zennで技術記事公開（「Three.jsで3D魔法陣ジェネレーターを作る」）。

---

### v0.4 — シード + テーマ + テキスト系充実（3週）

**ゴール:** バイラル装置を仕込む + テキスト・文字系レイヤーの完全版。

**追加レイヤー（+6種 = 計31種）:**
- MetatronsCube, HexagramGrid（神聖幾何学）
- TextBand, SpiralText, PillarText（テキスト3種）
- GimbalRings（3D専用）
- EnergyBeams 完全版（エフェクト）

**実装:**
- 決定論シードジェネレート（generateFromSeed）
- テーマプリセット8種（twilight, moonlight追加）
- 高解像度PNG書き出し（4K対応、OffscreenCanvas）
- 共有ダイアログ（URL/シード/PNG/Twitter共有）
- Open Graph 対応（共有時にPNGプレビュー表示）
- 「あなた専用の魔法陣」モード（名前→シード）

**グリフセット追加（+3種）:** enochian, anglo-saxon, younger-futhark

**リリース戦略:**
- 「あなたの名前から生成された魔法陣」のキャンペーン投下
- TikTok/Reels用の縦動画化
- Etsy/Printifyに「Sigil Sticker」シリーズの最初のSKUを追加

---

### v0.5 — 拡張配置 + 高難度レイヤー + 収益化（3〜4週）

**ゴール:** 残り配置パターン完成 + 高難度レイヤーの実装 + 収益チャネル稼働。

**追加レイヤー（+5種 = 計36種）:**
- SriYantra（神聖幾何学の最高難度）
- CipherWheel（テキスト）
- KnotworkBorder（装飾ボーダーの最高難度）
- Crack（フィルテクスチャ）
- LightningArcs（エフェクトの最高難度）

**実装:**
- Sphere/Cylinder配置
- GIF/MP4ループ書き出し
- 商用ライセンス購入動線（Stripe Checkout）
- カスタムSVGインポート（customグリフセット対応）
- Coconalaから誘導するためのカスタム制作モード

**グリフセット追加（+1種）:** astro + customインポート機能

**リリース戦略:**
- YouTube技術解説動画公開
- BOOTH/Gumroadで「Sigil Asset Pack」販売開始
- Coconalaに「あなた専用の魔法陣をオーダーメイド」出品

---

### v1.0 — 安定版（2週）

**実装:**
- バグ潰し
- パフォーマンスチューニング
- 多言語対応（日英）
- ドキュメント整備
- アナリティクス整備

**リリース戦略:**
- プレスリリース（Zenn記事まとめ・YouTube動画）
- Product Hunt投稿
- ジェネラティブアート系コミュニティ（Are.na等）

---

## 開発工数（週10時間想定）

| フェーズ | 期間 | 累計 | レイヤー数 | 主要タスク |
|---------|------|------|-----------|-----------|
| v0.1 MVP | 5週 | 5週 | 8種 | React+Three.jsスケルトン、幾何基礎+シンボル基礎、Flat、URL共有 |
| v0.2 3D | 3週 | 8週 | 14種 | Stack/Tilted、装飾ボーダー、blendMode対応 |
| v0.3 Editor | 4週 | 12週 | 25種 | レイヤーエディターUI、神聖幾何学、シンボル拡充 |
| v0.4 Seed | 3週 | 15週 | 31種 | シード生成、テーマ8種、テキスト系、4Kエクスポート |
| v0.5 拡張 | 4週 | 19週 | 36種 | Sphere/Cylinder、高難度レイヤー、GIF、収益化 |
| v1.0 仕上げ | 2週 | 21週 | 36種 | バグ・パフォ・i18n |

**合計: 約21週 ≈ 5ヶ月**

実際は副業他案件と並行になるので、**7〜9ヶ月**見るのが現実的。
短縮したいなら v0.5 の高難度レイヤー（SriYantra, KnotworkBorder, LightningArcs）を v1.1 に回す手もある。

---

## パフォーマンス予算

| 項目 | 目標 | 計測方法 |
|------|------|---------|
| フレームレート（PC） | 60fps固定 | Chrome DevTools Performance |
| フレームレート（モバイル） | 30fps以上 | iPhone 12 / Pixel 6で実機 |
| 最大レイヤー数（PC） | 25レイヤー | 手動テスト |
| 最大レイヤー数（モバイル） | 15レイヤー | 手動テスト |
| 初期ロード時間（4G） | 3秒以内 | WebPageTest |
| バンドルサイズ（gzip） | 500KB以下 | rollup-plugin-visualizer |
| Lighthouse Performance | 85以上 | Lighthouse CI |
| メモリ使用量 | 200MB以下 | Chrome Memory tab |

### モバイル劣化対応

- `prefers-reduced-motion`: 詠唱アニメ無効化
- 端末検出で自動的に低品質モード（Bloom OFF、ParticleCount 半分）
- ユーザー設定で「品質」を下げられる
