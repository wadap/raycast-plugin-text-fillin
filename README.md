# Text Fillin (Raycast Extension)

Raycast上で一時的に文章を作成し、`Cmd + Enter`で直前にフォーカスしていたアプリへ貼り付ける拡張です。

## 使い方

1. 依存関係をインストール
   - `npm install`
2. 開発起動
   - `npm run dev`
3. Raycastで `Text Fillin` を実行
4. テキストを入力し、`Cmd + Enter`で確定

## 動作

- `Form.TextArea` で入力
- `Cmd + Enter` で送信
- Raycastを閉じて、元アプリへ `Clipboard.paste` で貼り付け

## 追加機能

- 入力中テキストの一時保存
  - `Text Fillin`で入力した内容を自動保存し、次回起動時に復元
- 送信履歴
  - `Text Fillin History`で送信済みテキストを一覧表示
  - 履歴から再ペースト
  - 個別削除 / 全削除
