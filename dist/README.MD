# appsapp-cli


## Install

Appsapp-cli is an important dependency for https://www.npmjs.com/package/appsapp-module if you want to use the awesome backend services. Install the package by running: 

```bash
$ npm -g install appsapp-cli
```

You also need firebase-tools:

```bash
$ npm install -g firebase-tools
```

Then go to your project root and run:

```bash
$ firebase init
```
Choose `◯ Functions: Configure and deploy Cloud Functions` and select one of your previously created firebase project as the `default project` for this project root.

Now you are ready to run `appsapp-cli` first time:

```bash
$ appsapp
```

While deploying firebase functions it takes a while. After first run you can speed up it by watching for any changes in your typescript sources.

```bash
$ appsapp -w
```



