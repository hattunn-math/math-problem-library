# 数学問題ライブラリ

Supabaseを使わず、できるだけ無料・学校側の特別設定なしで運用するための静的Webサイトです。

## 構成

- `index.html` … 生徒用。問題検索・PDF閲覧
- `teacher.html` … 先生用の問題データ編集ツール
- `data/problems.json` … 公開する問題情報
- `assets/` … CSS / JavaScript

## PDFの保存先

PDF本体はOneDriveに保存してください。

1. OneDriveへ問題PDF・解答PDFをアップロード
2. 生徒が閲覧できる共有リンクを作成
3. `teacher.html` で問題情報と共有リンクを登録
4. `problems.json` を書き出す
5. GitHub上の `data/problems.json` を置き換える

## 公開方法（GitHub Pages）

1. GitHubで新しいリポジトリを作成
2. このフォルダの中身をすべてアップロード
3. Repository Settings → Pages
4. Branch を `main` / root に設定して公開
5. 数分後、GitHub PagesのURLから閲覧

GitHubへのファイル編集権限を先生だけが持つ運用にすれば、
生徒は公開ページを閲覧できますが、公開中の問題データを登録・編集・削除できません。

## teacher.html の使い方

### GitHub Pages上で開く場合
`https://あなたのURL/teacher.html` を開きます。

### 最初に
「現在のJSONを読み込む」を押してください。

### 編集後
「problems.jsonを書き出す」を押し、
ダウンロードされた `problems.json` をGitHubの `data/problems.json` と置き換えます。

## 重要な制約

この構成では、学校のMicrosoft Entraアプリ登録などを行わないため、
WebサイトからOneDriveへPDFを自動アップロードする機能はありません。

PDFアップロードだけはOneDriveで行い、Webサイトには共有リンクを登録します。

これは「外部DBなし・無料中心・学校管理者への特別な依頼なし」を優先した設計です。

## OneDrive共有設定について

共有リンクの種類によっては、閲覧する生徒にもMicrosoft 365へのサインインが必要です。
実際の学校の共有ポリシーに合わせて設定してください。

## サンプルデータ

`data/problems.json` には表示確認用のサンプルが3問入っています。
`https://example.com/...` のURLは実際のPDFではありません。
運用開始前に削除または実際のOneDrive共有リンクへ置き換えてください。
