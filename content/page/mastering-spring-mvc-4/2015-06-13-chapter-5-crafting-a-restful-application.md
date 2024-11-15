---
categories:
- Master Spring MVC 4
date: 2015-06-13T00:00:00Z
description: In this chapter, we will have a look a the principles of RESTful API and
  learn how to craft one using Spring MVC
redirect_from: /spring/2015/06/13/chapter-5-crafting-a-restful-application.html
tags:
- book
- spring mvc
title: Chapter 5 - Crafting a RESTful application
url: /book/chapter-5-crafting-a-restful-application.html
weight: 5
---

In this chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html), we’ll tackle main principles of a RESTful architecture. We’ll learn how to convert data to JSON and handle different media types in the application.

We will use the JSR-310 (Java DateTime) spec from the get-go and see how
to handle them properly in your MVC application.

## Forever RESTful

We will see how REST works in theory: HTTP codes and verbs, API versioning, HATEOAS, etc.

Then, we will design an API that uses both JSON and XML to do a twitter search
and manage users.

![API](/assets/images/book/chap4-1.png "API")

## Tooling

I will also show you some useful tools to debug REST API.
My favorite one is a little command line tool called [httpie](http://httpie.org/).

You will study the best practice like exceptions handling and custom
error pages.

We will also see how to set up Jackson serialization using mixins and Java 8 dates.

## Documentation

We will use [swagger](http://swagger.io/) to document our API.

![Swagger](/assets/images/book/chap4-2.png "Swagger")

I hope you will find the content of this chapter interesting, let me know your thoughts in the comments!
