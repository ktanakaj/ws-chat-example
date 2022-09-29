# WebSocketサンプルChatアプリ

WebSocketサンプルとして作成した単純なChatアプリです。
サーバー側はWS、クライアント側はAngularで実装。  
（電文形式には[JSON-RPC2](http://www.jsonrpc.org/specification)を使用。）

## 環境
* CentOS 7
* Node.js v16.x
* nginx 1.12.x
* TypeScript 3.x
* WS 6.x
    * Node-config 2.x
    * Log4js 3.x
    * [json-rpc2-implementer](https://github.com/ktanakaj/json-rpc2-implementer) 0.4.x
* Angular 14.x
    * ngx-translate 14.x
    * [simple-ng-websocket](https://github.com/ktanakaj/simple-ng-websocket) 0.3.x
* Mocha 5.x
    * Power-assert 1.x

### 動作確認ブラウザ
* Google Chrome Ver106

※ 他は未確認

### 開発環境
* Vagrant 2.2.x - 仮想環境管理
    * Hyper-V - 仮想環境
* Visual Studio Code - アプリ開発用エディター

## フォルダ構成
* VMルートフォルダ
    * chat-svr - Node.js Webサーバーソース
        * config - アプリ設定
    * chat-web - Angular Webアプリソース
    * ansible - Ansible関連ファイル

## 環境構築手順
1. Vagrantをインストールした後、ファイル一式をVMのフォルダとする場所に展開。
2. `vagrant up` でVM環境を構築（アプリの初回ビルド等も自動実行）。

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
    * `npm start` - アプリのデバッグ起動
    * `npm run watch` - アプリのビルド（ファイル更新監視）
    * `npm test` - アプリのユニットテスト実行
    * `npm run lint` - アプリの静的解析ツールの実行

## その他
各種ログは `/var/log/local/ws-chat-example` 下に出力されます。
アクセスログ、デバッグログ、エラーログを出力します。

## ライセンス
[MIT](https://github.com/ktanakaj/ws-chat-example/blob/master/LICENSE)
