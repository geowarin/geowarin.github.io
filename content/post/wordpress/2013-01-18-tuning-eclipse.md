---
categories:
- eclipse
date: 2013-01-18T04:20:19Z
Summary: Tips and tricks, useful plugins and tuning for the eclipse IDE
redirect_from: 2013/01/18/tuning-eclipse/
tags:
- eclipse
title: Tuning eclipse
aliases:
    - /tuning-eclipse.html
---

This is a compilation of resources I use to configure eclipse.


## The Jvm options


Always a big headache, there is a good resource on [stack-overflow](http://stackoverflow.com/questions/142357/what-are-the-best-jvm-settings-for-eclipse/3275659#3275659).

For JVM noobs, I recommend the [following reading](http://avricot.com/blog/index.php?post/2010/05/03/Get-started-with-java-JVM-memory-(heap%2C-stack%2C-xss-xms-xmx-xmn...)).

If you are a JVM tuning maniac, you might also like [this post](http://blog.headius.com/2009/01/my-favorite-hotspot-jvm-flags.html) and to [read the man](http://www.oracle.com/technetwork/java/javase/tech/vmoptions-jsp-140102.html).

If you're interested, I am maintaining a gist with my up-to-date eclipse flags : [https://gist.github.com/4562291](https://gist.github.com/4562291)


## Must-have plugins

If you don't know them already, you should check out these plugins :

* [EasyShell](http://marketplace.eclipse.org/content/easyshell), which allows to open windows, terminal and copy path on any eclipse resource (and configure shortcuts for each of these actions - pretty awesome)
* [m2e](http://www.eclipse.org/m2e-wtp/) and [m2e-wtp](http://www.eclipse.org/m2e-wtp/) are must-haves if you use maven to build JEE apps. I often install the [build-helper](http://mojo.codehaus.org/build-helper-maven-plugin/usage.html) connector too.
* [GrepConsole](http://marketplace.eclipse.org/content/grep-console#.UPjHgieqmEc), which lets you use simple regexp to color your console, fancy !


## Copy workspace settings

If you want to have multiple workspaces sharing the same preferences check out [this article](http://eclipse.dzone.com/news/create-new-eclipse-workspace-w).

## File encoding in UTF-8 please

First thing is to go to General > Workspace and select UTF-8 in "Text File Encoding"
Second is General  > Content Types > Text. Then you can either type "UTF-8" for everything or at least for "Java Properties file"


## Bonus

Et pour nos amis francophones, une [superbe présentation](http://blog.tensin.org/public/presentations/eclipse/) sur la customisation d'eclipse !
