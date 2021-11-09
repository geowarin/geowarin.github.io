---
categories:
- Master Spring MVC 4
date: 2015-06-13T00:00:00Z
description: In this chapter we will be looking at different techniques to improve our
  application's performances using cache, gzipping, etags, async and websockets
redirect_from: /spring/2015/06/13/chapter-8-optimizing-your-requests.html
tags:
- book
- spring mvc
title: Chapter 8 - Optimizing your requests
url: /book/chapter-8-optimizing-your-requests.html
weight: 8
---

In this chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html), we will
implement classic ways of optimizing a web application: cache
control headers and Gzipping.

We will also use Spring's cache abstraction and [ETags](https://en.wikipedia.org/wiki/HTTP_ETag).

## More threads, please

You will learn how to create asynchronous services with Spring Async.

Spring Async is a nice part of Spring, if you want to dig deeper
see [this article]({% post_url 2015-06-12-completable-futures-with-spring-async %})
where we use Java 8 `CompletableFuture`s to create a multithreaded application.

## Websockets

To finish, we will enter the reactive stuff and learn how to use websockets with
[sockjs](http://sockjs.org).

I hope you will find the content of this chapter interesting, let me know your thoughts in the comments!
