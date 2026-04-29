# Forbidden Sigil — 実装計画

3D魔法陣ジェネレーター / Three.js × WebGL
ドラフト v0.2 — 2026年4月

---

## ドキュメント一覧

| ファイル | 内容 |
|---------|------|
| [docs/overview.md](./docs/overview.md) | プロジェクト要旨・スコープ（MUST/SHOULD/WON'T） |
| [docs/layers.md](./docs/layers.md) | レイヤーカタログ（全36種/8カテゴリ）・グリフセット（14種）・テーマ（8種）・3D配置（6種） |
| [docs/data-model.md](./docs/data-model.md) | TypeScript 型定義（SigilConfig, LayerConfig 全36種, LayerTransform 等） |
| [docs/tech-stack.md](./docs/tech-stack.md) | 技術スタック（React 19 + Vite + Three.js + Zustand）・3層アーキテクチャ・ディレクトリ構成 |
| [docs/milestones.md](./docs/milestones.md) | リリースマイルストーン（v0.1〜v1.0）・開発工数（21週）・パフォーマンス予算 |
| [docs/business.md](./docs/business.md) | ローンチ戦略・収益チャネル5種・リスク管理 |
| [docs/decisions.md](./docs/decisions.md) | オープン課題・設計議論ログ（10項目）・参考リンク |

---

## クイックサマリー

- **何を作るか**: ブラウザで動く3D魔法陣ジェネレーター
- **技術**: React 19 + Three.js + Vite + Zustand + Tailwind CSS
- **レイヤー**: 36種（幾何構造/神聖幾何学/テキスト/シンボル/装飾/フィル/エフェクト/3D専用）
- **グリフ**: 14セット（ルーン文字/錬金術/黄道十二宮/漢字 等）
- **テーマ**: 8種（業火/氷霜/虚空/蒼翠/聖光/血盟/黄昏/月白）
- **工期**: 約21週（週10h、並行で7〜9ヶ月）
- **収益目標**: 月3〜5万円（Etsy物販/Coconalaカスタム/アセット販売/YouTube/商用ライセンス）
