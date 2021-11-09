---
categories:
- Master Spring MVC 4
date: 2015-06-13T00:00:00Z
description: In this chapter, we’ll take a tour of the different cloud providers, understand
  the challenges and benefits of a distributed architecture and we’ll deploy our web
  application on Heroku.
redirect_from: /spring/2015/06/13/chapter-9-deploying-to-the-cloud.html
tags:
- book
- spring mvc
title: Chapter 9 - Deploying to the cloud
url: /book/chapter-9-deploying-to-the-cloud.html
weight: 9
---

In this chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html), you will deploy your application on the cloud and invite the whole world to see!

We will see how to deploy our application on two popular PaaS: Cloud Foundry and
Heroku.

A big thank you to Wayne Lund at Pivotal who wrote the [Pivotal Web Services](https://run.pivotal.io/) part!

![Our login page on Heroku!](/assets/images/book/chap8-1.png "Login page")

## Know your options

We will have a look at the different PaaS providers, then I will guide you through the steps of deploying your application on Cloud Foundry and Heroku.

We will use Redis to distribute our sessions as well as our application cache
and prepare our application to handle thousands of requests without spending a single penny!

## I'm not bluffing

I already deployed my application on [Heroku](http://masterspringmvc.herokuapp.com/)!

It's a free Heroku instance so you might have to wait 30 seconds for it to go
out of sleep.

As always, I hope you will find the content of this chapter interesting, let me know your thoughts in the comments!
