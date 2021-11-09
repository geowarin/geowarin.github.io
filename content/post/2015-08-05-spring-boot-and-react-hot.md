---
categories:
- spring
- react
date: 2015-08-05T00:00:00Z
description: The perfect setup for Spring boot and React hot loader
redirect_from: spring/react/2015/08/05/spring-boot-and-react-hot.html
tags:
- spring
- spring-boot
- react
- javascript
- hot-reload
- groovy
- featured
title: Spring Boot and React hot loader
aliases:
    - /spring-boot-and-react-hot.html
---

When I develop web applications, I love using React.
I'm also a Spring and groovy addict.

Those two stacks make me more productive.
Can we have the best of both worlds?

I will show you step by step how I created
[this project](https://github.com/geowarin/boot-react).
Feel free to fiddle with it and give me your feedback.

## Goal

My perfect stack on the backend is to use Spring boot and groovy.
With the latest version of Spring boot, there is a new tool called
[dev-tools](https://spring.io/blog/2015/06/17/devtools-in-spring-boot-1-3) that
will automatically reload the embedded server when you recompile your project.

On the frontend, most React developers use [webpack](http://webpack.github.io/).
React has awesome support for hot reloading with [react-hot-loader](https://github.com/gaearon/react-hot-loader).
It will magically update your views without requiring you to refresh your browser.
Because React encourages your to have a unidirectional data flow, your whole
application can use hot reloading every time you save.
For this to work, we have to launch a [webpack dev server](http://webpack.github.io/docs/webpack-dev-server.html).

The problem when you launch your Spring boot server on the port 8080 and the
dev server on the port 3000 is that you will get cross origin requests preventing
the two servers from interacting.

We also want to isolate the two projects and make separate gradle modules.

This blog post will show a solution to this problem and will provide an
enjoyable dev environment.

This might not be the perfect solution and I'd love any feedback from
both communities to help me improve it.

## The backend

We will generate the backend. To do that, you can go on http://start.spring.io/
and create a **gradle project** using **groovy**, **java 8** and the latest Spring boot
(**1.3.0 M2** at the time of writing).

For the dependencies tick **DevTools** and **Web**.

If you want to do it command line style just type the following in your console:

```
curl https://start.spring.io/starter.tgz \
-d name=boot-react  \
-d bootVersion=1.3.0.M2 \
-d dependencies=devtools,web \
-d language=groovy \
-d JavaVersion=1.8 \
-d type=gradle-project \
-d packageName=react \
-d packaging=jar \
-d artifactId=boot-react \
-d baseDir=boot-react | tar -xzvf -
```

This will create a base project with the latest spring boot, the devtools, groovy
and gradle.

Don't forget to generate the gradle wrapper:

```
gradle wrapper
```

See the [commit](https://github.com/geowarin/boot-react/commit/c290269a9e105688b38dcc6cc0b3293ec85199e6)

Great so now we have tomcat embedded, hot reloading and supernatural groovy
strength. The usual.

We will create a simple REST resource that we would like our frontend to consume:

```groovy
@RestController
class SimpleResource {

    @RequestMapping('/api/simple')
    Map resource() {
        [simple: 'resource']
    }
}
```

## The frontend

As mentioned before, we want the frontend to be a separated project.
We will create a gradle module for that.

At the root of your project add a `settings.gradle` file with the following
content:

```
include 'frontend'
```

Now, create a `frontend` directory under the project root and add a build.gradle
file in it:

```groovy
plugins {
    id "com.moowork.node" version "0.10"
}

version '0.0.1'

task bundle(type: NpmTask) {
    args = ['run', 'bundle']
}

task start(type: NpmTask) {
    args = ['start']
}

start.dependsOn(npm_install)
bundle.dependsOn(npm_install)
```

See the [commit](https://github.com/geowarin/boot-react/commit/6788e068c9071d0368879bee8188b7aeb194388e)

We will use the [gradle node plugin](https://github.com/srs/gradle-node-plugin)
to call the two main tasks in our application:

* `npm run bundle` will create the minified app in the `dist` directory
* `npm start` will start our dev server

We can call them from the gradle build with `./gradlew frontend:start` and
`./gradlew frontend:bundle`

The content of the project will basically be the same as
[react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate)

Let's get the sources of this project as a zip file from github and unzip them into the
frontend directory.
With bash, type the following command at the root of your project:

```
wget -qO- -O tmp.zip https://github.com/gaearon/react-hot-boilerplate/archive/master.zip && unzip tmp.zip && mv react-hot-boilerplate-master/* frontend && rm -rf react-hot-boilerplate-master && rm tmp.zip
```

See the [commit](https://github.com/geowarin/boot-react/commit/a3de637d0d94f48d1cdd0379038115e5b98b79d3)

If everything goes well, typing `./gradlew fronted:start`, will start the react
application at `http://localhost:3000`.

The first problem arises when you `ctrl+c` out of the gradle build,
the server will still hang. You can kill it with `killall node`.
This is a problem I'd like help solving, if you have a solution, please tell me.

In the rest of the article I will use `npm start` directly, which presupposes that
you have `npm` available on your development machine.
The whole build will only require Java.

We will use the [webpack-html-plugin](https://github.com/ampedandwired/html-webpack-plugin)
to automatically generate the index.html page.

```
npm install --save-dev html-webpack-plugin
```

Since using the document body as a root for our application is a bad practice,
we need to tweak the default html template.

I created a file called `index-template.html` in a newly created `assets` directory.
It will serve as a template to generate our `index.html` file:

<code data-gist-id="4e6089bc670d753f2453" data-gist-highlight-line="14"></code>

As you can see, it contains a div with the id `root`.

Let's tweak the dev server a little bit to [combine it with another server](http://webpack.github.io/docs/webpack-dev-server.html#combining-with-an-existing-server).

Let's change `webpack.config.js`:

```javascript
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:3000/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      title: 'Boot React',
      template: path.join(__dirname, 'assets/index-template.html')
    })
  ],
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src')
    }]
  }
};
```

We changed the `publicPath` to point directly at our dev server and included the
`HtmlWebpackPlugin`.

Now we can get rid of the old index.html and start our dev server with `npm start`.
The index will be automatically generated for us.

See the [commit](https://github.com/geowarin/boot-react/commit/10e3fdae8ac53bea40c585076363a4cc54ed9d9e)

## Include the frontend in the boot jar

We have to create the npm `bundle` task, which will generate an optimized
web application in the `dist` directory.

In the `package.json` file, update the `scripts`:

```
"scripts": {
  "start": "node server.js",
  "bundle": "webpack --optimize-minimize --optimize-dedupe --output-public-path ''"
}
```

Now if you launch `./gradlew frontend:bundle`, it will generate an optimized
`bundle.js` file and the `index.html` in the `dist` directory.

The last step is to include this `dist` directory in our application's jar as
static assets.
Add the following task to our main gradle build:

```groovy
jar {
  from('frontend/dist') {
    into 'static'
  }
}

processResources.dependsOn('frontend:bundle')
```

If you generate your jar with `./gradlew assemble`, you will see that the
built jar includes the frontend resources.

If you run the jar (`java -jar build/libs/boot-react-0.0.1-SNAPSHOT.jar`), you should
see the React hello world on `localhost:8080`

See the [commit](https://github.com/geowarin/boot-react/commit/99b89a19200fe847bc0740346a0c4e5668b4e3c2)

## Launch it in dev

When working on our application, it would be nice if:

1. Launching the spring boot server in dev launched the webpack dev server
2. Our dev-server proxied the request to `localhost:8080` so we can access
the application on `localhost:3000` and not get cross-origin requests

Add the following `WebpackLauncher` to the project:

```groovy
@Configuration
@Profile('dev')
class WebpackLauncher {

  @Bean
  WebpackRunner frontRunner() {
    new WebpackRunner()
  }

  class WebpackRunner implements InitializingBean {
    static final String WEBPACK_SERVER_PROPERTY = 'webpack-server-loaded'

    static boolean isWindows() {
      System.getProperty('os.name').toLowerCase().contains('windows')
    }

    @Override
    void afterPropertiesSet() throws Exception {
      if (!System.getProperty(WEBPACK_SERVER_PROPERTY)) {
        startWebpackDevServer()
      }
    }

    private void startWebpackDevServer() {
      String cmd = isWindows() ? 'cmd /c npm start' : 'npm start'
      cmd.execute(null, new File('frontend')).consumeProcessOutput(System.out, System.err)
      System.setProperty(WEBPACK_SERVER_PROPERTY, 'true')
    }
  }
}
```

This will take care of the first task by launching `npm start` when our server starts.
I used a system property to make sure the dev-tools will not reload the frontend
when we make a change in the backend code.
This class will be available when we start the application with the `dev`
[profile](http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-profiles.html)

We can make a simple proxy with webpack-dev-server.
Change the `server.js` file:

```javascript
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  proxy: {
    "*": "http://localhost:8080"
  }
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3000');
});
```

Launch your application with the `--spring.profiles.active=dev` flag.

You should be able see the react hello world on [http://localhost:3000](http://localhost:3000). If you make some changes to it,
it will automatically reload.

See the old commit [commit](https://github.com/geowarin/boot-react/commit/af66c4b2f9798ad50f4e6be30ba5fb6c5f56f79f)

And the new [commit](https://github.com/geowarin/boot-react/commit/2eb6460812c2f2022b49e04f8ed4034dda402c2c)

## Fetch the resource

We can check that we do not get cross-origin errors using [axios](https://github.com/mzabriskie/axios),
a simple library to do http requests. It supports promises and automatically
handles json.

```
npm i -S axios
```

Let's amend our `App.js`:

```javascript
import React, { Component } from 'react';
import axios from 'axios';

export default class App extends Component {

  componentDidMount() {
    axios.get('/api/simple')
      .then(res => console.log(res.data))
      .catch(err => console.error(err))
  }

  render() {
    return (
      <h1>Hello, guys.</h1>
    );
  }
}
```

See the [commit](https://github.com/geowarin/boot-react/blob/079f0c8afcd8266355b77a094941c8cdbe1349fd/frontend/src/App.js)

## Better optimization of the javascript assets

We can further improve the compression of the javascript assets by separating our dev
webpack configuration from our production configuration.

In the production configuration, we can use the DefinePlugin to set the NODE_ENV
variable to production. This will allow webpack to automatically remove all the
code intended for development purposes in our libraries:

```javascript
new webpack.DefinePlugin({
  "process.env": {
    NODE_ENV: JSON.stringify("production")
  }
})
```

See the [commit](https://github.com/geowarin/boot-react/commit/a095ebca7672d2f12bb559e37e01784984a6abc1)

## Feedback needed

Well, this works pretty well!

![Hot hot reload](/assets/images/articles/2015-08-hot-reload.gif "Hot reload")

What do you think? Care to comment and help me make something better?
Your feedback is welcome!

The project is available [on github](https://github.com/geowarin/boot-react).
Pull requests and issues are gladly accepted.
