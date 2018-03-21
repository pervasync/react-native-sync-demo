## react-native-sync-demo
Demo React Native App for [react-native-sync](https://github.com/pervasync/react-native-sync).

### Setup the source code
* Download and unpack the demo app zip file
* Work in app folder: ` cd react-native-sync-demo-master`
* Run  `yarn install`  to populate node_modules
* Run `react-native eject`  to -create `ios` and `android` folders
* Run `react-native link` to link native lib

### Run the app
Use Xcode to open the iOS project in the `react-native-sync-demo-master/ios`  folder. Run the app in simulator.

On the Settings tab, fill in the sync server and sync user info. Feel free to use our test server url:
`http://203.195.233.31:8080/pervasync/server`. Use user name `user1` or `user2`. Password is `password`.

After you save the server url and user credentials, navigate to the `Database` tab and do a pull-to-refresh to start a sync session. The initial sync may take 100 seconds to pull down around a set of tables with 10 thousand records and a handful of files from sync server. After that, incremental sync would only take a couple of seconds. Use the `Database` and `Files` tabs to examine the DB table contents and view the synod files.

|||
|:-------------:| :-------------:|
|![settings.png](https://github.com/pervasync/react-native-sync-demo/raw/master/docs/settings.png)|![pull_sync.png](https://github.com/pervasync/react-native-sync-demo/raw/master/docs/pull_sync.png)|
|![database.png](https://github.com/pervasync/react-native-sync-demo/raw/master/docs/database.png)|![record_editor.png](https://github.com/pervasync/react-native-sync-demo/raw/master/docs/record_editor.png)|
|![files.png](https://github.com/pervasync/react-native-sync-demo/raw/master/docs/files.png)|![doc_viewer.png](https://github.com/pervasync/react-native-sync-demo/raw/master/docs/doc_viewer.png)|

### Your own sync server and React Native app
If you like the sync tool, you can [setup your own sync server](https://docs.google.com/document/u/1/d/1Oioo0MxSArRgBdZ0wmLND-1AdzVLyolNd-yWw59tIC8/pub#h.mbk3tiu7nrjx) to [publish your database tables and OS folders](https://docs.google.com/document/u/1/d/1Oioo0MxSArRgBdZ0wmLND-1AdzVLyolNd-yWw59tIC8/pub#h.smru6um57rkf) to be synced to your mobile app. More info at [pervasync.com](http://www.pervasync.com/ ).

You can create your own app based on the demo or write it from scratch. Either way, check out [react-native-sync](https://github.com/pervasync/react-native-sync) for details of the sync API.

