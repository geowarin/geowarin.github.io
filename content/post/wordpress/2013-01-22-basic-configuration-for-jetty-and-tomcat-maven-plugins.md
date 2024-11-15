---
categories:
- maven
date: 2013-01-22T04:07:49Z
Summary: Cheatsheet for jetty and tomcat maven plugins
redirect_from: /2013/01/22/basic-configuration-for-jetty-and-tomcat-maven-plugins/
tags:
- jetty
- maven Plugin
- servlet 3.0
- tomcat
title: Basic configuration for Jetty and tomcat maven plugins
aliases:
    - /basic-configuration-for-jetty-and-tomcat-maven-plugins.html
---

This is a quick memento on how to set up [tomcat7-maven-plugin](http://tomcat.apache.org/maven-plugin-2.0/) and [jetty-maven plugin](http://wiki.eclipse.org/Jetty/Feature/Jetty_Maven_Plugin) (current version is 8).

It is interesting to note both of these servers are servlet 3.0 compatible.

Setting up Jetty :

{{< gist geowarin 4591942 >}}

Now your can run `mvn jetty:run`

To set up tomcat-7 plugin, you will have to add either the plugin to the pluginManagement section of your pom (more portable) - see below - or adding the pluginGroup to your settings.xml.

{{< gist geowarin 4591960 >}}

Now your can run `mvn tomcat7:run`

pluginGroup :

```xml
<pluginGroups>
    ....
    <pluginGroup>org.apache.tomcat.maven</pluginGroup>
    ....
</pluginGroups>
```
