# Forbidden Sigil — プロジェクト概要

3D魔法陣ジェネレーター / Three.js × WebGL
ドラフト v0.2 — 2026年4月

## プロジェクト要旨

| | |
|---|---|
| **何を作るか** | ブラウザで動く3D魔法陣ジェネレーター。36種のレイヤーを自由に重ね、3D配置を切り替え、リアルタイム詠唱演出付き。URLとシードで共有可能。 |
| **なぜ作るか** | 既存の魔法陣ジェネレーター（Game Dev Goose、Roll for Fantasy 等）はすべて2D・ネイティブアプリ・もしくは低品質。**Web × 3D × ライセンス自由**のポジションが空いている。 |
| **どう収益化するか** | NFT化は狙わない。Web無料公開で認知獲得 → Etsy/Printify物販・Coconalaカスタム・商用ライセンス販売・YouTube技術解説の複数チャネル展開。 |

## スコープ

### MUST（v1.0で必須）

- 36種類のレイヤー（8カテゴリ → [layers.md](./layers.md)）
- レイヤーの追加・削除・順序入れ替え・個別パラメーター編集
- 3D配置プリセット5種 + Custom（Flat/Stack/Sphere/Cylinder/Tilted）
- テーマプリセット8種（業火/氷霜/虚空/蒼翠/聖光/血盟/黄昏/月白）
- 詠唱アニメーション（reveal）+ Bloom グロー
- URL共有 + シード生成
- PNG書き出し（ロゴなし、商用利用可）
- モバイル対応（タップ操作・縮小UI）

### SHOULD（v1.0であれば嬉しい）

- 高解像度PNG（4K）書き出し
- GIF/MP4 ループ書き出し
- ダーク/ライトテーマ切替（UI側）
- 多言語対応（日本語・英語）
- カスタムSVGインポート（ユーザー独自記号の取り込み）

### WON'T（v1.0では作らない）

- NFT化機能
- ユーザー登録・サーバー保存ギャラリー
- AI画像生成連携
- 複数魔法陣の同時表示
- VR/AR対応

## ドキュメント構成

| ファイル | 内容 |
|---------|------|
| [overview.md](./overview.md) | 本ファイル。プロジェクト要旨・スコープ |
| [layers.md](./layers.md) | レイヤーカタログ（全36種）・グリフセット・テーマ・配置プリセット |
| [data-model.md](./data-model.md) | TypeScript 型定義（SigilConfig, LayerConfig 等） |
| [tech-stack.md](./tech-stack.md) | 技術スタック・アーキテクチャ・ディレクトリ構成 |
| [milestones.md](./milestones.md) | リリースマイルストーン・開発工数・パフォーマンス予算 |
| [business.md](./business.md) | ローンチ戦略・収益化・リスク管理 |
| [decisions.md](./decisions.md) | オープン課題・設計議論ログ・参考リンク |
