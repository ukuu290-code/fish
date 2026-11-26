FISH STRIKER Android app
========================

ゲーム本体をアプリに同梱しているため、公開サイトやアカウントは不要です。
インストール後はインターネット接続なしで遊べます。

APK の作成方法
--------------
ゲーム本体を更新した場合は、APK を作成する前に android-app フォルダーで
次のコマンドを実行し、最新のゲームファイルを assets に反映してください。

  Copy-Item ..\code.js .\app\src\main\assets\game\code.js -Force
  Copy-Item ..\index.html .\app\src\main\assets\game\index.html -Force

Windows では、プロジェクトのパスに日本語が含まれると Gradle が失敗する
場合があります。その場合は ASCII の一時パスからビルドしてください。

  New-Item -ItemType Directory C:\Temp\FishStriker\android-app -Force
  Copy-Item .\* C:\Temp\FishStriker\android-app -Recurse -Force

1. パソコンに Android Studio をインストールします。
2. Android Studio で android-app フォルダー（必要なら上記の一時コピー）を開きます。
3. 初回同期時に Gradle や Android SDK のダウンロードを許可します。
4. メニューから Build > Build Bundle(s) / APK(s) > Build APK(s) を選びます。
5. 次の場所に作成された APK を Android スマートフォンにコピーします。
   app/build/outputs/apk/debug/app-debug.apk
   一時コピーからビルドした場合は、この APK を元の android-app フォルダーにも
   コピーして保管できます。
6. スマートフォンで APK を開いてインストールします。

インストールがブロックされた場合は、APK を開いたアプリ（ファイル、
ブラウザーなど）に「不明なアプリのインストール」を許可してください。

初回の APK 作成時は Android Studio が開発用ファイルをダウンロードする
ため、パソコンにインターネット接続が必要です。インストール後のゲーム
実行には通信権限を使用しません。このアプリは公開されていません。
