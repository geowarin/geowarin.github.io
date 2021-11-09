---
categories:
- react
date: 2016-02-18T00:00:00Z
description: We've heard a lot about Javascript fatigue but what if I showed you two simple
  ways to get started with React without a single line of configuration? Refresh!
tags:
- react
- fresh
title: React freshness
aliases:
    - /react-freshness.html
---

In the javascript community, some people have experienced [javascript fatigue](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4#.4ex2kn77n).

For me, this fatigue is two folds.
First, you need to keep up to date with the frantic pace
of redux, react-router and friends and make sure you will be able to migrate your
code to the new major versions.

Second, Webpack configuration is not always straight-forward.
I know a lot of people that really want to see what React is like and play with
it without having to cope with a lot of configuration up-front.

I have no solution for the first problem. To me, innovation in this community feels
like a fantastic thing. Watching the github repos and [following people](https://medium.com/@dan_abramov/my-react-list-862227952a8c#.l1p0093pk) on Twitter
is my way to keep up-to-date with the latest improvements.

I also want to point out that the most used tools seem to be more and more stable.
It is unlikely that redux or react-router will go through a full rewrite now. So
relax. If you're not able to update your dependencies every two days, it's
probably not the end of the world.

In this article, I will show you two ways to get started with React with **zero**
configuration. So you can start hacking right away when you're still fresh!

## Quick prototyping with babel browser transform

So you need to get some React code out of the door **now**.
You don't care about hot reloading and want to write some React and ES2015 code
in a web page.

Jim Sproch has [a very cool solution](http://www.jimsproch.com/react/) for us.

```html
<html>
  <head>
    <script src="http://www.jimsproch.com/react/future/react.js"></script>
    <script src="http://www.jimsproch.com/react/future/react-dom.js"></script>
    <script src="http://www.jimsproch.com/react/babel-browser.js"></script>
  </head>
  <body>
    <div id="container" />
    <script type="text/babel">
      ReactDOM.render(<div>Hello World!</div>, document.getElementById('container'));
    </script>
  </body>
</html>
```

And that's about it!
Every script tag with the `text/babel` type will be transformed with babel.
So you have support for destructuring, arrow functions and, of course, JSX.
It will even work for external scripts so you don't need to write all your
code in the page.

Now, Jim likes to work with the bleeding edge beta of React but you can easily
switch `react.js` and `react-dom` with production versions:

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react-dom.js"></script>
```

The downside of this solution, of course, is that the transform is executed by the
client's browser so this will be slower than pre-compiled Babel.
And you don't have hot reloading available.

But still, zero config.

## A true React project with nwb

[Nwb](https://github.com/insin/nwb) will take care of all the webpack and babel configuration.

Install it as a global package:

```
npm i -g nwb
```

You can then create a React project:

```
nwb new react-app my-nwb-app
```

And it will scaffold the application for you.
It is a very simple application:

```
nwb: new react-app
  create .gitignore
  create .travis.yml
  create README.md
  create nwb.config.js
  create package.json
  create public/index.html
  create src/App.js
  create src/index.js
  create tests/.eslintrc
  create tests/App-test.js
```

No configuration outside of `nwb.config.js`, which is almost empty.

Let's start the application:

```
npm start
```

Try to modify `App.js`... Hot reloading works!

Now let's run the tests:

```
$ nwb test

START:
18 02 2016 10:14:54.838:INFO [karma]: Karma v0.13.18 server started at http://localhost:9876/
18 02 2016 10:14:54.846:INFO [launcher]: Starting browser PhantomJS
18 02 2016 10:14:56.139:INFO [PhantomJS 1.9.8 (Mac OS X 0.0.0)]: Connected on socket IHNx80uh9I6VW9fjAAAA with id 617985
  App component
    ✔ displays a welcome message

Finished in 0.01 secs / 0.004 secs

SUMMARY:
✔ 1 test completed
```

We've got karma and coverage pre-configured so we can start TDDing right away.

And the best part, we can build the application and get an optimized version
of the scripts.

```
$ npm run build

> my-nwb-app@1.0.0 build /Users/geowarin/dev/react/my-nwb-app
> nwb build

nwb: clean-app
nwb: build-react-app
Hash: 81e127933ddb73bbdfb4
Version: webpack 1.12.11
Time: 3234ms
        Asset       Size  Chunks             Chunk Names
    vendor.js     131 kB       0  [emitted]  vendor
       app.js  971 bytes       1  [emitted]  app
vendor.js.map    1.54 MB       0  [emitted]  vendor
   app.js.map    4.13 kB       1  [emitted]  app
```

Nwb also has support for [sass](https://github.com/insin/nwb-sass), [stylus](https://github.com/insin/nwb-stylus) and [less](https://github.com/insin/nwb-less).

### Nwb gotchas

Nwb has opinions. And that's a good thing.
For example, you write tests with Karma and that's it.

Support for Babel 6 is not there yet so it's not completely bleeding edge.

But you can serenely leave the hard part of configuring your app to Nwb.
It's got a very impressive test suite and coverage. You're in good hands!

## Conclusion

Feeling fatigued? I do not!
I wish there were more projects like Nwb with strong opinions and one easy
way to do things.

But it is possible to get started with React and even have a production-ready
application with zero configuration.

Never used React? You have no more excuses. Get to work and help this community
improve!
