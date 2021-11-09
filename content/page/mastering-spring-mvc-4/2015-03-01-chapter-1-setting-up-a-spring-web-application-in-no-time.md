---
categories:
- Master Spring MVC 4
date: 2015-03-01T00:00:00Z
description: In the first chapter, you will learn how to bootstrap your application effectively
  and how to leverage spring boot to get started with spring MVC in a couple of minutes
redirect_from: /spring/2015/03/01/chapter-1-setting-up-a-spring-web-application-in-no-time.html
tags:
- book
- spring mvc
title: Chapter 1 - Setting up a Spring web application in no time
url: /book/chapter-1-setting-up-a-spring-web-application-in-no-time.html
weight: 1
---

I just finished writing the first chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html).
That was a lot of fun. I enjoyed sharing the tips and tricks that I use when I bootstrap a Spring application.

In this first chapter, you will learn how to get started with spring MVC in a snap.

## Know thy tools

Have you heard of [Spring Tool Suite](https://spring.io/tools/sts)? Do you know [start.spring.io](http://start.spring.io/)?
Did you know you could actually *curl* [start.spring.io](http://start.spring.io/)?

You will learn all that and much more in this action-packed first chapter!

## The power of Spring Boot

Did you know spring boot actually does a **lot** of things for us?

1. Initializing the *DispatcherServlet* of Spring MVC
2. Setting up an encoding filter, which will enforce correct encoding of clients' requests
3. Setting up a view resolver to tell Spring where to find our views
4. Configuring static resources locations (css, js)
5. Configuring supported locales and resource bundles
6. Configuring a multipart resolver for file uploads to work
7. Including tomcat or jetty to run our application on a web server
8. Setting up error pages (404, etc)

The first chapter walks you through Spring Boot's code to explain how it works and how to customize the default configurations.

A big thank you to [Phillip Webb](https://twitter.com/phillip_webb), co-lead of Spring Boot for helping me and my editor sort
out potential licensing issues when quoting Spring Boot's code. If you're interested, the code is under [Apache license](http://www.apache.org/licenses/LICENSE-2.0)
and allows reproduction under the conditions listed in paragraph 4.

Well guys, good talking to you but I'd better get back to writing chapter two, which is about the MVC architecture and Spring MVC views and navigation.
