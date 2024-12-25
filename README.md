# Podcast Generator

Note記事を音声コンテンツに自動変換するWebアプリケーションです。記事のURLを入力するだけで、AIがポッドキャスト形式の台本を生成し、自然な音声に変換します。

## 主な機能

- Note記事の自動スクレイピング
- AIによる台本生成（GPT使用）
- 高品質な音声合成（NijiVoice API使用）
- ダークモード対応
- レスポンシブデザイン

## 技術スタック

- **フロントエンド**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - React Hooks

- **バックエンド**
  - Next.js API Routes
  - OpenAI API (GPT-4)
  - NijiVoice API
  - Cheerio (Webスクレイピング)

## セットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/usagi917/podcast_app.git
cd podcast_app
```

2. 依存関係のインストール
```bash
npm install
# または
yarn install
```

3. 環境変数の設定
```bash
cp .env.example .env.local
```

以下の環境変数を設定してください：
```
OPENAI_API_KEY=your_openai_api_key
NIJIVOICE_API_KEY=your_nijivoice_api_key
NIJIVOICE_API_URL=your_nijivoice_api_url
```

4. 開発サーバーの起動
```bash
npm run dev
# または
yarn dev
```

## 使用方法

1. トップページでNote記事のURLを入力
2. AIが自動的に記事を要約し、ポッドキャスト形式の台本を生成
3. 必要に応じて台本を編集
4. 「音声を生成」ボタンをクリックして音声化
5. 生成された音声をプレビューまたはダウンロード

## 制限事項

- 記事の文字数制限: 800文字まで
- 対応言語: 日本語のみ


## ライセンス

MIT

## 開発者向け情報

### 開発モードでのモックデータ使用

音声合成APIの使用量を節約するため、開発時にはモックデータを使用できます：

```bash
USE_MOCK_VOICE_ACTORS=true npm run dev
```

### APIエンドポイント

- `/api/scrape-note`: Note記事のスクレイピング
- `/api/summarize`: AIによる台本生成
- `/api/generate-voice`: 音声合成
- `/api/voice-actors`: 音声キャラクター情報の取得

