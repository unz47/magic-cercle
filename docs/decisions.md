# オープン課題・設計議論ログ・参考リンク

## オープン課題（v0.1着手時に決める必要あり）

| 課題 | 選択肢 | 現時点の傾向 |
|------|--------|------------|
| ルーン記号の表現方式 | シェーダー手描き / SVG / CanvasTexture / Bitmap atlas | SVG → CanvasTexture が有力 |
| TextBand のフォント | Google Fontsで動的読み込み or バンドル同梱 | 動的読み込み（バンドル節約） |
| PWA化するか | オフライン動作対応するなら必要 | v1.0では不要、将来検討 |
| 言語切替の実装方式 | i18nライブラリ vs 自前 | 軽量ライブラリ（paraglide等）検討 |
| 設定の永続化 | localStorage に最後の設定を保存するか | する（UX向上） |
| React の状態管理パターン | Zustand / Jotai / useContext | Zustand（軽量、subscribe で Three.js 側にも通知可能） |

これらはv0.1スパイク中に決めて、ADR (Architecture Decision Record) として `docs/adr/` に残す。

---

## 設計議論ログ要旨

これまでの議論で決まったこと：

1. **アーキテクチャ**: 各レイヤーを独立した Three.js オブジェクト（Shader1枚詰め込み案は却下）
2. **拡張性**: SigilConfig を JSON serializable に保つ → URL共有・シード生成・将来の拡張全てに対応
3. **ポジション**: Web × 3D × ライセンス自由で、Game Dev Goose と住み分け
4. **収益**: NFTは狙わない、Web2チャネルで多角化
5. **3D配置**: 5プリセット（Flat/Stack/Sphere/Cylinder/Tilted）+ Custom自由配置
6. **共有**: URL hash圧縮（即時）+ シード生成（バイラル）+ 将来ギャラリー（後回し）
7. **フレームワーク**: Angular → **React 19** に変更（開発者の習熟度を最優先。R3Fは使わず素のThree.jsをuseRef+useEffectで接続）
8. **レイヤー数**: 11種 → **36種**（8カテゴリに体系化）
9. **グリフセット**: 4種 → **14種**（自作SVG + CC0のみ）
10. **テーマ**: 6種 → **8種**（twilight, moonlight 追加）

---

## 今週のアクション（最初の1週）

実装着手前に固める：

### リポジトリ作成
- GitHub: forbidden-sigil（プライベートで開始、v0.4でパブリック化検討）
- README に本ドキュメントの要旨転記
- issue templates 設定

### 技術検証スパイク（合計4時間）
- Vite + React 19 + Three.js の統合パターン確認
- Three.js + Line2 で太線円を描画 → 1枚のplaneにレイヤーを重ねる動作確認
- UnrealBloomPass の負荷計測（モバイルで動くか）
- useRef + useEffect → Three.js パラメーター連動の実装パターン確認
- Zustand store → SigilConfig の状態管理パターン確認

### ドメイン取得
- 候補：forbidden-sigil.com / sigil.lol / mahojin.app
- 短く、覚えやすく、英語＆日本語両方の語源を持つもの

### デザインリファレンス収集
- FF14シジル / Doctor Strange / Demon Slayer / Diablo / Bloodborne など
- Pinterest にボード作成
- 自分が「これだ」と思うキービジュアルを3〜5枚決める

### MVP用の最小LayerConfig設計レビュー
- 8種類のレイヤーで「最低限の魔法陣」が成立するか紙の上で確認

---

## 参考リンク

### 競合・先行事例
- Game Dev Goose - Magic Circle Generator — 最強競合、ネイティブ
- Roll for Fantasy - Summoning Circle
- 5e Magic Shop - Teleportation Circle
- Yuanlong Dai - Shader Based Arcane Circle — UEシェーダー作品
- Generativemasks — p5.jsジェネラティブ仮面（先行成功事例）

### 技術参照
- Three.js Documentation
- The Book of Shaders
- Bruno Simon's Three.js Journey
- Svelte 5 Runes Documentation

### 設計参考
- Generativemasks Report #0 — Takawoのプロジェクト記録
