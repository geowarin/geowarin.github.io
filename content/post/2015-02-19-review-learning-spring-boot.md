---
categories:
- spring-boot
date: 2015-02-19T00:00:00Z
description: Review of the book Learning Spring Boot by Greg L. Turnquist
tags:
- spring-boot
- book
- review
title: Review of Learning Spring Boot
aliases:
    - /review-learning-spring-boot.html
---

Today, I'll be reviewing the first book ever written on Spring Boot, [Learning Spring Boot](https://www.packtpub.com/application-development/learning-spring-boot), by Greg L. Turnquist.
Packt Publishing, the editor, contacted me to review it during its writing but I'll remain as unbiased as possible.

It's a good book, well worth reading if you want to learn how spring boot works but more globally, it will
give you good insights and tips on the capabilities of Spring and its integration with other technologies.

## Summary

The book has five chapters:

1. Quick Start with Groovy
2. Quick Start with java
3. Debugging and Managing Your App
4. Data Access with Spring boot
5. Securing your App with Spring Boot

Each chapter is one big tutorial that you can follow along by coding. I guess you will be better off with the e-book version
for copy-paste even if the entire code is [available on github](https://github.com/learning-spring-boot/learning-spring-boot-code).

It will be a better experience for mac users, as the author gives some instructions on how to install the dependencies (like Active MQ)
with brew. I guess you can achieve the same results with a small effort on other platforms as well.

## The topics

### Quick Start with Groovy

In the first chapter you will get started fast, using [Spring Boot's CLI](http://docs.spring.io/spring-boot/docs/current/reference/html/cli-using-the-cli.html) and groovy.
I dig groovy so it's a nice start.

You will get some basic notions of testing with [spock](https://code.google.com/p/spock/), manage javascript dependencies
with WebJars and bower and learn how to use [CRaSH](http://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-remote-shell.html) to consult and monitor
your app through a remote shell which is amazing.

### Quick Start with java

In this chapter, you will build a classic java application with Spring Boot.
But you'll also use the [Spring Social Github](https://github.com/spring-projects/spring-social-github), consume its API and leverage [Spring Mobile](http://projects.spring.io/spring-mobile/) and jQuery mobile to
develop a simple application working on mobile devices.

### Debugging and Managing Your App

This chapter is about [JMS integration](http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-messaging.html) with either an in memory broker or with ActiveMQ.
You will also add health checks, custom CRaSH commands and connect to your app with JMX to monitor your queue.

### Data Access with Spring Boot

In this chapter, you will use Spring Data and [Spring Data Rest](http://projects.spring.io/spring-data-rest/) with either H2 and MySQL or Mongo
and produce a RESTful, discoverable json API.
You will use profiles to use different configuration in development and in production.

### Securing Your App with Spring Boot

In this chapter you will get dig into [Spring Security](http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-security.html)
with basic http auth, in memory authentication and create a real in database security model.
You will also learn how to configure your Tomcat to be more secure [using SSL](http://docs.spring.io/spring-boot/docs/current/reference/html/howto-embedded-servlet-containers.html#howto-configure-ssl).

## Conclusion

Whatever are your current skills with Spring, you will undoubtedly learn some new things reading the book.
I did and I enjoyed the experience. The topics addressed by Greg L. Turnquist are diverse and interesting
and the book is easy to follow.

If you work with Spring often, you have to understand how Spring Boot works.
It's an amazing tool for fast prototyping and a wonderful way to dig deeper into the framework by small increments.
