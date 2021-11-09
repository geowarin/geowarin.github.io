---
date: 2015-03-27T00:00:00Z
description: In this chapter, we will create a beautiful profile form with server and
  client side validation
redirect_from: /spring/2015/04/10/chapter-3-handling-forms-and-complex-url-mapping.html
tags:
- book
- spring mvc
title: Chapter 3 - Handling forms and complex URL mapping
url: /book/chapter-3-handling-forms-and-complex-url-mapping.html
weight: 3
---

The third chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html) is about the cornerstone of web application: forms.
Oh boy, what a chapter.

In this epic piece of literature, we will create a complete profile form like this one:

![A beautiful profile form](/assets/images/book/chap3-1.png "Profile form")

We will discuss forms, validation, conversion and formatting.

See the birth date field up there? That's a `java.time.LocalDate`.
Do you wonder how to make it work with Spring MVC?

Our application will be available in different languages and it will be easy to
switch between them.

We will also be looking at a simple way to validate the form on the client side
thanks to the available [HTML 5 specification](http://diveintohtml5.info/forms.html#validation).

That's not all, you might have noticed that we ask the user to fill out a list of tastes, things that interest him.
That's because we will allow searches on multiple keywords with [matrix variables](http://docs.spring.io/spring-framework/docs/current/spring-framework-reference/html/mvc.html#mvc-ann-matrix-variables).

Sounds good? I hope it does and can't wait for the moment when you will be able to get your hands on the book!
