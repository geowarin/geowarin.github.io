---
categories:
- react
- redux
date: 2016-04-12T00:00:00Z
Summary: Connecting your REST API to Redux used to be hard... But that was before
  Shasta!
tags:
- react
- redux
- shasta
title: Consuming APIs with Redux, the Shasta way
aliases: 
 - /redux-data-with-shasta.html
---

Since React is just the view layer of your front-end stack, the community had to
provide the solutions for the remaining problems.

Right now there seems to be a consensus for the best libraries. The recommended stack is:

* Building: `Webpack` and `babel`
* Managing your UI state: `Redux` and `ImmutableJS`
* Routing: `React-router` ([ahem!](https://github.com/taion/rrtr))

But there seems to be [lots of options](https://blog.boldlisting.com/connecting-redux-to-your-api-eac51ad9ff89#.s83cs4um8)
to connect Redux to your API.

Yesterday, I decided to see what [Shasta](http://shasta.tools/) had in store for
us. I have to say that I was more than happy with what I saw!

Check out my demo project [on github](https://github.com/geowarin/shasta-preview).

## What is Shasta?

Shasta is the latest project of [@Contra (Eric Schoffstall)](https://github.com/contra),
previously known for Gulp.

The idea is to take the best practices and libraries used by the React community
and stitch them together with nice helpers.

It is an [opinionated library](http://shasta.tools/shasta/docs/Opinions.html).

Without surprise, you will find support for all the libraries cited above.

Shasta is very ambitious and aims to help you solve Server Side Rendering, manage
security and user sessions, etc.

Check the [shasta-boilerplate](https://github.com/shastajs/boilerplate) for a more comprehensive example.

In this article I will focus on [Tahoe](https://github.com/shastajs/tahoe) and
the [shasta data view](https://github.com/shastajs/shasta-data-view).

I think that those two things alone are well worth a blog post!

## A word of warning!

Shasta is under development. All the dependencies in the demo are pointing to the
github repositories. There are no npm releases yet!

Likewise, the documentation [is very sparse](http://shasta.tools/shasta/index.html) at
the moment.

Thinks are likely to change or break. You have been warned.

Your best bet to learn more about Shasta right now is to listen to the Javascript Jabber podcast
[episode on Shasta](https://devchat.tv/js-jabber/205-jsj-shasta-with-eric-schoffstall).

## The store

The central element in Shasta is the store.
It is very similar to Redux's store but it adds the notion of plugins.

To get started quickly, I created a project [using nwb]({% post_url 2016-02-18-react-freshness %}).

Here is what the project looks like after setting up Shasta with the router and
Tahoe:

<img src="/assets/images/articles/2016-04-shasta-layout.png" width="280" >

Let's dig into the core package.

`store.js` allows you to reference the store as a singleton. This is also where
you register the plugins you use:

```js
import { createStore, createReducer } from 'shasta';
import localReducers from '../reducers/.lookup';
import plugins from './plugins';

export default createStore({
  plugins: plugins,
  reducers: [
    createReducer(localReducers)
  ]
})
```

`plugins.js` is very simple. In this example, I use two plugins, Tahoe and shasta-router:

```js
import * as router from 'shasta-router'
import * as api from 'tahoe';

export default [
  api,
  router
]
```

Finally, the `actions.js`:

```js
import { actions as routeActions } from 'shasta-router'
import { createActions, createReducerActions } from 'shasta';
import store from './store'
import localActions from '../api/.lookup'
import localReducers from '../reducers/.lookup';

export default createActions({
  ...localActions,
  ...routeActions,
  ...createReducerActions(localReducers)
}, store.dispatch)
```

### Plugins

What are those plugins? Shasta defines multiple extension points.
Most notably, your plugin can export reducers and middlewares which dramatically
help reducing the boilerplate.

With the example above, you will get your routes stored in Redux with `react-router-redux`,
and the setup for the [Redux Devtools chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en).

Tahoe also adds a bunch of reducers to handle our API calls.

### What about the .lookup file?

The `.lookup` files are a really nice idea, they use the [glob-loader](https://github.com/contra/glob-loader) to re-export all the js files
according to a glob expression.

This avoids writing repetitive and error prone-code like:

```js
import * as reducer1 from './reducer1'
import * as reducer2 from './reducer2'

export default {
  reducer1,
  reducer2
}
```

## The Root Component

Here is a quick glance at the Root component of our application.
It is very classic, just note that Shasta adds support for additional PropTypes
like routes or immutable types.  

```jsx harmony
import React from "react";
import {Provider, Component, PropTypes} from "shasta";
import {Router} from "shasta-router";

export default class RootView extends Component {
  static displayName = 'RootView';
  static propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    routes: PropTypes.node.isRequired
  };

  render () {
    const {store, history, routes} = this.props;
    return (
      <Provider store={store}>
        <Router history={history}>
          {routes}
        </Router>
      </Provider>
    )
  }
}
```

## Our first reducer: the counter!

This one took you by surprise, didn't it?
Just to show the ideas behind Shasta, here is the reducer for our sacred counter example.

`reducers/counter.js`:

```js
import { Map } from 'immutable';

export const initialState = Map({ count: 1 });

export const increment = (state, { payload = 1 }) =>
  state.update('count', c => c + payload);

export const decrement = (state, { payload = 1 }) =>
  state.update('count', c => c - payload);

export const reset = () => initialState;
```

Here, you see a very straightforward implementation of a reducer.
It leverages the ImmutableJS API to create those nice little one-liners.

Here is how to use those reducers as actions in your views:

```jsx harmony
import React from "react";
import {connect, Component} from "shasta";
import actions from "../core/actions";

@connect({
  count: 'counter.count'
})
export default class Counter extends Component {

  render() {
    return <div>
      <h2>Counter</h2>

      <p>{this.props.count}</p>

      <button onClick={() => actions.counter.increment()}>
        Increment
      </button>
      <button onClick={() => actions.counter.decrement()}>
        Decrement
      </button>
      <button onClick={() => actions.counter.reset()}>
        Reset
      </button>
    </div>
  }
}
```

With our lookup file setup, there is nothing else to do.
Your actions will automatically be available from all components in the
`actions.counter` namespace.

The `@connect` annotation reminds a lot of Redux but it has been modified to
work seamlessly with immutable data types.

## Let's fetch data!

Let's create a `api/chuck.js` file:

```js
import { createAction } from 'tahoe';
import { Schema } from 'normalizr';

const response = new Schema('some-response');

export const getRandomFact = createAction({
  endpoint: () => `http://api.icndb.com/jokes/random`,
  method: 'GET',
  model: response
});
```

Shasta has direct support for [normalizr](https://github.com/gaearon/normalizr).
This will help us store our entities in a normalized way as we will see in a moment.

Under the hood, Tahoe uses superagent to make HTTP requests.

Let's see how to use this in a view:

```jsx harmony
import React from "react";
import {connect} from "shasta";
import actions from "../core/actions";
import DataComponent from "shasta-data-view";

@connect({
  joke: 'api.subsets.joke'
})
export default class ChuckFact extends DataComponent {

  resolveData () {
    actions.chuck.getRandomFact({
      subset: 'joke'
    });
  }

  renderLoader () {
    return (
      <div>
        Loading...
      </div>
    )
  }

  renderData ({joke}) {
    return <div>
      <h2>Chuck Norris Fact</h2>

      <p>{joke.getIn(['value', 'joke'])}</p>
    </div>
  }

  renderErrors (errors) {
    console.error(errors);
    return (
      <div>
        There was an error fetching Chuck Norris facts
      </div>
    )
  }
}
```

Shasta has a `DataComponent` class that will help you manage the pattern of displaying
a loading message while fetching the data, and errors if the request fail.

When using a Tahoe action, you can optionally specify a subset in which the fetched
data will end up.

This is great to scope your fetch requests to a component.
Here, our request ends up in the `api.subsets.joke` namespace.

Here is the JSON returned by our API so you can understand the `getIn` call:

```json
{
  "type": "success",
  "value": {
    "id": 459,
    "joke": "Chuck Norris can solve the Towers of Hanoi in one move.",
    "categories": [
        "nerdy"
    ]
  }
}
```

## Using normalizr

If we use a schema for the API call, we can tell normalizr that the `value` field
in our JSON response is actually an entity.

As such, we will be able to retrieve it in the `api.entities` namespace.

```js
const response = new Schema('response');
const joke = new Schema('jokes');

response.define({
  value: joke
});
```

Normalizr will create a map of jokes indexed by ids and store it in `api.entities.jokes`.
Which allows us to write something like so:

```jsx harmony
@connect({
  jokes: 'api.entities.jokes'
})
export default class ChuckFact extends DataComponent {

  renderData ({jokes}) {
    const jokesEl = jokes.valueSeq().map((joke, id) => {
      return <div key={id}>{joke.get('joke')}</div>
    });

    return <div>
      <h2>Chuck Norris Fact</h2>

      {jokesEl}
    </div>
  }
}
```

We can also use a function in the `@connect` decorator:

```jsx harmony
const getFirstJoke = (store) => {
  return store.getIn(['api', 'subsets', 'myJoke', 'data', 'value', 'joke']);
};

@connect({
  joke: getFirstJoke
})
export default class ChuckFact extends DataComponent {

  resolveData () {
    actions.chuck.getRandomFact({
      subset: 'myJoke'
    });
  }

  renderData ({joke}) {
    return <div>
      <h2>Chuck Norris Fact</h2>

      {joke}
    </div>
  }
}
```

## Conclusion

I'm very excited about Shasta.
It solves a long-standing problem in the React community with an unmatched elegance.

It might be that piece that a lot of us have been missing in our projects.
