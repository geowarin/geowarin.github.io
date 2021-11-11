---
categories:
- other
date: 2015-12-28T00:00:00Z
Summary: What to learn in 2016 to be a top notch Java dev?
tags:
- modern
- java
- developer
title: The modern java developer
aliases:
    - /modern-java-developer.html
---

My dear colleague Fruzenshtein asked me what
I think a modern Java developer should know or learn in 2016.

This is a mix of techniques and tools I've learned and found useful
the past year and the one that I wish to learn in the coming year.

## Practices

Kent Beck once said he was "just a good programmer with great habits".
As professional developers, we should all strive to cultivate better habits.

### TDD

Java developers are lucky to work in a very rich ecosystem with extremely good
testing libraries.
If you do not have the healthy habit of writing [tests first](http://martinfowler.com/bliki/TestDrivenDevelopment.html),
you should at least make an effort to learn the tools that will help you craft quality software.

In no particular order, here is a curated list of the frameworks and tools I use
to write better tests:

* [Spock](http://spockframework.github.io/spock/docs/1.0/index.html)
* [Geb](http://www.gebish.org/) / [Fluentlenium](https://github.com/FluentLenium/FluentLenium)
* [Fake Mongo](https://github.com/fakemongo/fongo)
* [AssertJ](http://joel-costigliola.github.io/assertj/)
* [DbUnit](http://dbunit.sourceforge.net/) / [NoSqlUnit](https://github.com/lordofthejars/nosql-unit)
* [Junit lambda](http://junit.org/junit-lambda.html)

I find that writing tests in groovy is particularly awesome, if you do not know groovy
yet, give it a try this year!

### Modern build and CI

Maven is great, fast and well integrated with IDEs.
However, I have definitely switched to [gradle](http://gradle.org/) for all
my projects.

Gradle is synonym of less boilerplate, custom tasks, polyglot and truly incremental
builds.

You should also look at a modern Continuous integration setup.
I have been using
[travis](https://docs.travis-ci.com/user/languages/java/) for my open source
projects.

At work, I've been very happy to use [gitlab](https://about.gitlab.com/). It
has a very cool CI environment called [gitlab CI](https://about.gitlab.com/gitlab-ci/),
which borrows a lot of concepts from travis.

Better yet, deploying Gitlab with docker should take you [5 minutes!](http://www.damagehead.com/docker-gitlab-ci/).

In the Continuous deployment world, [Spinnaker]( http://techblog.netflix.com/2015/11/global-continuous-delivery-with.html) looks
very promising.

### Good tools

If your are stuck with svn do yourself a favor and learn git as soon as possible.

Here are some resources I found useful while learning git:

* [Learn git in 15 minutes](https://try.github.io/)
* [Learn git branching](http://pcottle.github.io/learnGitBranching/)

And of course, a [great IDE](https://www.jetbrains.com/idea/) will change your life.


## Infrastructure: Docker and cloud

The past two years have been all about docker.
For a good reason in my opinion!

I've had tons of fun and success using [docker-compose](https://docs.docker.com/compose/)
to set up development and QA environments.

If you never deployed one of your pet projects to the cloud, it has never been easier.
Give a try at pivotal Web Services, Heroku or Digital Ocean if you are running docker
containers.

If you are looking to deploy Spring applications at scale, be sure to take a look at [netflix OSS](http://cloud.spring.io/spring-cloud-netflix/).
With great projects like Ribbon, Eureka and Hystrix, you've got everything to
run your own cloud!

## Web and JS

Javascript has evolved a lot this year and you should definitely look at
[React](https://facebook.github.io/react/) or follow [angular 2](http://www.infoq.com/news/2015/10/angular-connect-keynote-summary)'s progress

The main problem with those libraries is the setup of a good development environment.
Webpack, JSPM or Browserify? How to properly setup hot reloading?
How to design your build pipeline? Those question are still difficult to answer
but I'm confident 2016 will solve those problems.

If you want to get started with Spring boot and react, have a look at my
[boot-react](https://github.com/geowarin/boot-react) project.

## Functional programming

With lambdas in Java 8, I think the java community has begun to look more and
more at the functional programming paradigms.

Personally, my gateway to FP has been javascript.
With react and redux borrowing a lot of concepts from the [elm architecture](https://github.com/evancz/elm-architecture-tutorial/) to the
excellent course I am taking called ["Hardcore functional programming in javascript"](https://frontendmasters.com/courses/functional-javascript/),
it seems that this community has a lot of interest for FP.

I will also have a look at [livescript](http://livescript.net/), an Haskell-like
language that compiles to javascript.

Naturally, I will also try to use those functional paradigms on
the backend.
I'm not a big fan of Scala yet so I think I will look more closely at [kotlin](https://kotlinlang.org/), which is now in beta with top tier IDE support and [compatible with spring](https://kotlinlang.org/docs/tutorials/spring-boot-restful.html)

## Conclusion

What do you think of this list? Would you add something?
Do not forget to check out the [profile of successful Java developer in 2016
](http://fruzenshtein.com/successful-java-developer-2016) on Fruzenshtein's notes!
