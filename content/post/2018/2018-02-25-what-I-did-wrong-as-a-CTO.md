---
title: "What I Did Wrong as a CTO"
date: 2018-02-25T11:33:45+01:00
description: I spent one year as a CTO for a startup. Here are some technical decisions I came to regret
    and those that I would make again in my next project
toc: true
tags:
 - kotlin
 - react
 - architecture
 - rest
categories:
 - architecture
---

Being a CTO in a startup is much more than the technical side.  

However, the technical decisions you make early with software, especially in a timed-constraint environment like a startup,
tend to stick with you for the rest of the project.
 
In this article, I will be listing a few of the technical decisions I made.

Some of them felt right at all time, some of them I hope not to make again.

# The stack

Our project was a SaaS management application. We wanted our users to have a great experience, to distinguish ourselves
from the competition, and improve their productivity. 

We used Kotlin and Spring Boot on the backend, React and Typescript on the frontend.

I'm really comfortable with those technologies and that's why I chose them.

Even if you're only using parts of our stack, I believe that some of the things I learned will be useful to you.

# It felt right (would do again in my next project)

## Kotlin

Kotlin is a fantastic language. It takes inspirations from scala, groovy, ruby, keeps the best parts, and has a top notch
IDE support.

There were a few rough edges at the start of the project (IDE performance regressions, erratic behavior on language updates)
but for the past few months I can say without reserve that Kotlin has been nothing but a joy to work with.

Kotlin is Java, had it been designed in the past few years instead of having 20 years of legacy.
Kotlin is Scala, had it been designed to be a productivity powerhouse instead of an academic language.

It is pragmatic, elegant, and with very few footguns. It would be really painful for me to start a new project with
Java instead of Kotlin.

## Postgres

Postgres is an awesome database. Don't listen to the bells and whistle of NoSQL. I'm completely sure that 90% of the
web applications built in 2018 will not require advanced partitioning and clustering and will fit nicely in a relational
database.

If you're building a social network, it's different of course, but otherwise, just take the best relational database.
Your team will probably be at-ease with SQL and you will have the peace of mind of a database schema.

## JOOQ and Flyway

[JooQ](https://www.jooq.org/) is a java library which allows you to write type-safe SQL queries in Java.

[Flyway](https://flywaydb.org/) is a very simple tool that handles your database migrations using simple SQL files 
(there is a bit more to it, but the concepts are very easy to grasp).

Both are very well designed and it felt liberating to be in control of the SQL of the application.
I came to realize how powerful SQL really is. 
All of a sudden it was a world with window functions, views, schemas, users, and more, that was open to us. 

I feel like I was never really in control of my schema when using JPA or other ORM tools in the past.

## Typescript and React

For most of my career, I've worked with type-safe languages. I am 100% certain that they make me more productive.
I can refactor my code and I have tremendous tools that empower me.

On the other hand, I have worked on a JS project without types for 2 years. 
It was a successful project with a lot of javascript and a great UX, but it was hard to crank up new features or 
change old code.

I will never start a new project without typescript or flow. My heart tells me typescript is the right tool for me, but
choosing any of the type-safe languages that compile to JS will make you more productive.

The only downside with typescript is finding type definitions for some libraries. There are not always of the best quality
and you might have to copy, paste, and modify some locally to get the job done.

I tend to have a bias towards libraries written in typescript: they come with type definitions and often have a better design.

React is a good library. I feel at ease with its API surface and I found that teaching React to newer developers is never
too much of a burden.

## Using a PaaS

Don't waste time setting up docker containers and a Kubernetes cluster. You just started your project, it does not have
to handle billions of requests. You just need to publish your project in one command without headaches.

We used [Pivotal Cloud Foundry](https://pivotal.io/platform) and we would type `cf push theApplication.jar` and be done 
with our deployment.

## No micro-services

A good old monolith is all you want for the exact same reasons as the above.

Always strive for simplicity. You can create services later on when your startup is widely successful.

Martin Fowler wrote a wonderful article called [Monolith First](https://www.martinfowler.com/bliki/MonolithFirst.html)
that I encourage you to read.   

## Not using webpack

I have a lot of respect for the folks maintaining webpack. It is a good tool with unprecedented possibilities.
That being said, when I set up the project, and despite my two years of webpack experience, I always felt like I was 
struggling with legacy software, and weird edge cases.
I had to use or write custom plugins just to overcome the shortcomings of the tool.

Webpack is getting better day after day but, for the sake of the project, I took a look at the competition.

For my JS build, I don't want fancy configuration and a ton of plugins.
I want something like spring-boot, with good defaults, and I want it to be fast out-of-the-box.

We used [fuse-box](https://fuse-box.org/), a very good bundler with an efficient cache. 
It is written in typescript and readily supports this language. Two decisive reasons for me.

I never regretted trusting the fuse-box team, they're doing a awesome job and they really listen to their community.   

The other tool I am following closely is [parcel](https://parceljs.org/).
It auto-detects the features you need and provide an all-around pleasurable developer experience with no configuration. 
And it's faster than Webpack.

Parcel is still in its infancy and I expect a few rough edges in the next months but I would probably give it a shot for my
next project. 

# It felt weird (would probably not do again)

## Mobx and mobx-state-tree

I love [mobx](https://mobx.js.org/). That's why I'm a reluctant to list it in this category.

It feels simple and powerful and it is written in typescript.

Those were compelling reasons for the choice of this library when I started the project.

I have been working with Redux intensively on a past project and I found it required a lot of design and tools (boilerplate)
to get the simplest features working.

On the other side of the spectrum, we have Mobx. You feel really strong when you design your first stores, because
it just works.

On the other hand, edge cases are rough. Some libraries like react-table would just not behave.

After using it for a year, I can probably list a few rules of thumbs:

- Create wrappers using `<Observer />` for libraries using `shouldComponentUpdate` aggressively, because they will mess up
with the expectations of the developers
- Come up with strategies for serialization and deserialization early in the project with libraries like [seriliazr](https://github.com/mobxjs/serializr).

But all of this has a cost in terms of code and mobx has a somewhat hidden learning curve that makes it difficult to grasp for junior
developers. 

We also tried [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree/) and I love the ideas behind the library.
It comes at a cost, though and this cost, at least for now, [is performance](https://github.com/mobxjs/mobx-state-tree/issues/440).

All in all, choosing a state library for React is hard.

Things to watch for in this area are [immer](https://github.com/mweststrate/immer) and [unstated](https://github.com/jamiebuilds/unstated). 

I still do not have the definitive answer to the question of state management in a React application.
Remember there are no silver bullets and be careful when you design your frontend architecture early on. 

## REST

I have an idea of what a good rest API looks like. 

I think it involves a lot of design and bikeshedding.  

When a developer is in charge of a new feature, they always have a lot of choices to make:

- Should I add attributes to an existing REST resource? (overfetching)
- Should I add a new REST resource? (duplication)
- Should aggregate resources on the backend or the frontend? (inconsistency)

And I did not even talk about HATEOAS or documentation.

Creating a good REST API is definitely something you should strive for and take the time to get right, if your business
model requires it.

Otherwise, I would consider [GraphQL](http://graphql.org/) very seriously.

In our case, our model looked like a tree and not like small separated entities. That's also something to consider.

I feel that thinking your API in terms of a cluster of objects comes more naturally to developers.
It favors emergent design and it encourages your developers and your business to get together and figure out the 
[aggregates](https://www.martinfowler.com/bliki/DDD_Aggregate.html) in your model.

If you want to go down this road early on and not even bother writing a fully-fledged backend server, I would review
[postgraphile](https://github.com/graphile/postgraphile) and [graphcool](https://www.graph.cool) as great starting points.


## Not using "strict: true" with typescript 

Typescript is awesome, but you have to enable [strict null checks](https://basarat.gitbooks.io/typescript/docs/options/strictNullChecks.html)
to make the most of it.
We started the project without strict checks and it was a significant endeavor to change it, so we never had the time
to do it.

Every time we got an "X is undefined" error in the frontend, I regretted not adding `strict: true` to the typescript 
configuration at the start of the project. 

# It felt wrong (would never do again)

## Using an in memory database for tests and development

We used Postgres in production and H2 (an in-memory database) for development and tests.

We had too many errors that we could only see after deploying the product to production.

Fortunately, most of them were easy to fix.
The errors we saw the most were differences in ordering and grouping between the two DBMS.

Hence the rule: "every SQL query shall have an ORDER BY clause".

> As Lukas Eder pointed out in the comments:
> If you don't need ordering, you should always avoid it, as ordering mostly incurs an O(N log N) operations
> (apart from those rather rare cases where you can pull the data directly from an index).

You can probably overcome those inconsistencies by setting up a CI build where your tests run against Postgres.

But more importantly, we were not able to take full advantage of features like 
[window functions](https://blog.jooq.org/2013/11/03/probably-the-coolest-sql-feature-window-functions/) or 
[JSON data types](https://www.compose.com/articles/is-postgresql-your-next-json-database/), to name a few.

The next time I'm starting a project I will use the same DBMS in development and in production.

I feel that having a little `docker-compose.yml` at the root of your project, loose a little time (1 second) at the
start of the day to boot it, and having a slightly worst developer experience is well worth the investment. 

## Server-Side Rendering

When building a Single Page App, you depend on your javascript to create the HTML that the user will interact with.

With Server-Side Rendering (SSR), you ask the server to run the javascript for the page that was requested, and then, send the resulting
HTML directly to your clients.

It is believed that your users will have a better experience with this technique, especially on lower-end devices that
will struggle to process big javascript files.

It is also believed that this wields better SEO results, as it easier for crawlers to parse HTML than to execute javascript.

At the beginning of the project, I was sure I could take advantage of SSR.
I had set up a few projects in JS that leveraged SSR in the past, and studied libraries like 
[nextjs](https://zeit.co/blog/next) carefully.

On the JVM, it is a bit less common, but I managed to pull something off using [J2V8](https://github.com/eclipsesource/J2V8/).

The truth is SSR is a trade-off and I think most web applications don't need to invest time in server-rendered
javascript.

Besides, measuring the benefits of SSR is really tricky. You have to consider different metrics than the "time to render".
Take, for example, [time to interactive](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive).

It is a fascinating subject but it was foolish to spend time on this matter as SEO and slow processors were clearly
not a priority for the business. 

Removing Server-Side Rendering was a good call, and reduced the overall complexity of the server code.

That being said, there is room for a tool that would simplify SSR on the JVM. It would be a amazing side project if you're
interested in the challenge.

## Service layer

Not spending enough time on the simplest aspect of the architecture was something I came to regret a few months into
the project with multiple people working on the code.

Make sure that every layer has clear boundaries and do not hesitate to split your project in small modules early on.

For example, these modules can be a good starting point:

- `model`: mapping with your database and helpers
- `services`: fetching and updating your database, only exports higher-level functions like Graphql endpoints
- `web-backend`: things that depend on HTTP libraries
- `web-frontend`: JS stuff

Modules are a great way to enforce architectural decisions. 
Moreover, you can only use the `internal` [keyword](https://kotlinlang.org/docs/reference/visibility-modifiers.html) 
in Kotlin by splitting your code into modules.

Later in the project, when you figure out cluster of domain objects that work together well, you should also split the service 
layer into smaller modules.

Good examples might be the "order module", the "transaction module", or the "security module" depending on your domain.
 
I like to thing of this approach as a stepping stone towards "micro-services", without the complexity of deploying them
as separate network entities.

There is actually a continuum between an integrated system and a distributed system and you probably won't have to
cross the line.

For more insights, I recommend watching the [Majestic Modular Monoliths](https://speakerdeck.com/axelfontaine/majestic-modular-monoliths)
talk by Axel Fontaine.

# Conclusion

Your time is precious, you don't want to be spending it unwisely or come to regret too many engineering decisions later.

Only experience can make you aware of the tradeoffs you will make in the early stages of a product. I hope that
mine will help you avoid some traps and make better choices when designing a greenfield project.
