---
title: "Debugging Webflux with IntelliJ"
date: 2019-12-20T21:04:54+01:00
toc: false
tags:
 - spring
categories:
 - webflux
Summary: By default, it very difficult to read reactor stack traces. Make your life easier with this little tip!
---

By default, when you try to debug project reactor calls, you get something like this:

![No debug](/assets/images/articles/2019/2019-12-20-webflux-no-debug.png)

But if you add this dependency :

```kotlin
testImplementation("io.projectreactor:reactor-tools")
```

And click on this little funnel:

![Funnel](/assets/images/articles/2019/2019-12-20-funnel.png)

Also ensure that you have the reactor plugin and that its properly configured.

![Plugin config](/assets/images/articles/2019/2019-12-22-webflux-config.png)

You get this:

![Wow](/assets/images/articles/2019/2019-12-20-clean-stack.png)

Much better!

Sources: 

- [Intellij blog](https://blog.jetbrains.com/idea/2019/10/whats-new-in-intellij-idea-2019-3-eap6-improved-reactor-support-and-a-huge-pack-of-fixes/)
