# WebSocketサンプルChatアプリ

WebSocketサンプルとして作成した単純なChatアプリです。
サーバー側はWS、クライアント側はAngularで実装。  
（電文形式には[JSON-RPC2](http://www.jsonrpc.org/specification)を使用。）

## 環境
* CentOS 7
* Node.js v6.x
* nginx 1.10.x
* TypeScript 2.x
* WS 2.x
    * Node-config 1.x
    * Log4js 1.x
    * [json-rpc2-implementer](https://github.com/ktanakaj/json-rpc2-implementer) 0.3.x
* Angular 4.x
    * webpack 2.x
    * ngx-translate 6.x
    * [simple-ng-websocket](https://github.com/ktanakaj/simple-ng-websocket) 0.1.x
* Mocha 3.x
    * Power-assert 1.x

### 対応ブラウザ
* &gt;= Google Chrome Ver51.0.2704.106

※ 他は未確認

### 開発環境
* Vagrant 1.9.x - 仮想環境管理
    * VirtualBox 5.1.x - 仮想環境
    * vagrant-vbguest - Vagrantプラグイン
* Visual Studio Code - アプリ開発用エディター

## フォルダ構成
* VMルートフォルダ
    * chat-svr - Node.js Webサーバーソース
        * config - アプリ設定
    * chat-web - Angular Webアプリソース
    * vagrant-conf - Vagrant関連ファイル

## 環境構築手順
1. Vagrantをインストールした後、ファイル一式をVMのフォルダとする場所に展開。
* `vagrant up` でVM環境を構築（アプリの初回ビルド等も自動実行）。

※ `npm install` でエラーになる場合は `vagrant provision` でもう一度実行してみてください。

## 実行方法
WebアプリはVM起動時に自動的に立ち上がります。

デフォルトのVMでは http://[DHCPで振られたIP]/ でアクセス可能です。

※ Microsoft EdgeだとプライベートIPはアクセスできない場合あり。  
※ 自動起動に失敗する場合は、後述の `npm start` コマンドを実行してください。

### サーバーコマンド
Webアプリの操作用に、以下のようなサーバーコマンドを用意しています。
アプリのビルドや再起動などを行う場合は、VMにログインして `chat-svr`, `chat-web` ディレクトリでコマンドを実行してください。

* `chat-svr`
    * `npm start` - アプリの起動
        * `npm run production` アプリの起動（運用モード）
    * `npm restart` - アプリの再起動
    * `npm stop` - アプリの停止
* `chat-svr/chat-web`共通
    * `npm run build` - アプリのビルド
    * `npm run watch` - アプリのビルド（ファイル更新監視）
    * `npm run doc` - アプリのAPIドキュメント生成
    * `npm test` - アプリのユニットテスト実行
    * `npm run tslint` - アプリの静的解析ツールの実行
    * `npm run clean` - 全ビルド生成物の削除

## その他
各種ログは `/var/log/local/ws-chat-sample` 下に出力されます。
アクセスログ、デバッグログ、エラーログを出力します。

## ライセンス
[MIT](https://github.com/ktanakaj/ws-chat-sample/blob/master/LICENSE)
