---
categories:
- Master Spring MVC 4
date: 2015-06-13T00:00:00Z
description: In this chapter, we’ll learn how to secure our web application and also how
  to cope with the security challenges of modern, distributed web applications.
redirect_from: /spring/2015/06/13/chapter-6-securing-your-application.html
tags:
- book
- spring mvc
title: Chapter 6 - Securing your application
url: /book/chapter-6-securing-your-application.html
weight: 6
---

In this chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html), we’ll learn how to secure our web application and also how to cope with the security challenges of modern, distributed web applications.

This is a parts chapter:

1. First, we will set up basic HTTP authentication in a minute
2. Then, we will design a form-based authentication for the web pages, keeping
the basic authentication for the REST API
3. We will allow the users to signup via the Twitter OAuth API
4. Then, we will leverage Spring Session to make sure our application can scale
using a distributed session mechanism
5. Last, we will configure Tomcat to use secured connection through SSL

<center>
![BasicAuth](/assets/images/book/chap6-1.png "Basic Auth")
</center>

## Safe and sound

At the end of this chapter you will be a security expert.
We will protect our REST API with basic auth, which is secure as well as easy
to interact with.

We will also design a gorgeous login page for our web application:

<center>
![Login](/assets/images/book/chap6-2.png "Login page")
</center>

## Going social

My favorite part in this chapter is when we use [Spring Social](http://projects.spring.io/spring-social/) to allow users to log-in using
their twitter account!

<center>
![TwitterLogin](/assets/images/book/chap6-3.png "Twitter login")
</center>

## Infinite scaling

We will use [Spring Session](http://projects.spring.io/spring-session/)
to put our users' sessions into [Redis](http://redis.io/) with little configuration.

This will allow us to add more servers to handle high traffic without worrying
about sticky sessions.

## SSL

In the end, we will see how to use SSL with tomcat.

I hope you will find the content of this chapter interesting, let me know your thoughts in the comments!
