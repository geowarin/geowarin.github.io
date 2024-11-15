---
categories:
- Master Spring MVC 4
date: 2015-06-13T00:00:00Z
description: In this chapter we will learn how to test our application with spring test
  and fluentlenium as well as with geb and spock.
redirect_from: /spring/2015/06/13/chapter-7-unit-and-acceptance-tests.html
tags:
- book
- spring mvc
title: Chapter 7 - Leaving nothing to luck with unit and acceptance tests
url: /book/chapter-7-unit-and-acceptance-tests.html
weight: 7
---

In this chapter, we will make sure our application never regresses thanks to a
handful of unit tests.

## To test or not to test?

Chapter 5 is by far my favorite chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html)!

In this uplifting piece of literature, you will learn more about testing best
practices: TDD, the pyramid of tests, unit tests and end-to-end tests.

![RedGreen](/assets/images/book/chap5-1.png "Red green refactor")

We will see the difference behind mocking and stubbing and use mockito and
the power of Spring's IOC to study both options.

With `spring-mvc-test` we will create unit test for our web controllers as well
as our REST controllers.

## Acceptance tests

Using [fluentlenium](https://github.com/FluentLenium/FluentLenium), we will create
simple yet powerful end-to-end tests leveraging Selenium.

I will tell you what the Page Object pattern is and how to use it with fluentlenium.

You will see how to configure Gradle to create a task for our acceptance tests
and generate reports for this task.

## Making it groovy

At the end of the chapter I will show you how to make your tests even better and
more readable with [Spock](https://github.com/spockframework/spock).

Then we will use [Geb](http://www.gebish.org/), a wonderful library used by the grails
community to design acceptance tests on top of WebDriver.

I hope you will find the content of this chapter interesting, let me know your thoughts in the comments!
