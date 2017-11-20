# appsapp-cli


## Install

Appsapp-cli is as an important dependency for https://www.npmjs.com/package/appsapp-module if you want to use the awesome backend services from appsapp.io. So install it by running: 

```bash
$ npm -g install appsapp-cli
```

You also need firebase-cli:

```bash
$ npm install -g firebase-cli
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

While deploying firebase functions it takes a while. After first run you can speed up it by watching changes. So start the following command whenever you are editing your apps source.

```bash
$ appsapp -w
```



