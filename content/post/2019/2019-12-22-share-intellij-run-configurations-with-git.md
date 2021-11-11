---
title: "Share IntelliJ run configurations with git"
date: 2019-12-22T01:47:32+01:00
toc: false
tags:
 - intellij
 - git
categories:
 - dev
Summary: Isn't it great when you checkout a project and have everything at hand to run it? 
---

This is a short note on how to share your intelliJ run configurations with git.

First your `.gitignore` must whitelist the `.idea/runConfigurations` folder but not the rest of the `.idea` folder.

You probably don't want to commit the entire folder because it can contain personal settings and plugin configurations.

```gitignore
!.idea

.idea/*
!.idea/runConfigurations
```

Here is a compound run configuration. It's awesome. It launches multiple run configurations at once. 
 
![Run configuration](/assets/images/articles/2019/2019-12-22-run-config.png)

Then you want to check the **Share throught VCS** checkbox on the top right corner, this will add an xml file to the
`.idea/runConfigurations` file that you can commit and push.  

![Xml configuration file](/assets/images/articles/2019/2019-12-22-share-config.png)




