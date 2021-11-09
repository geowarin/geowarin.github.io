---
categories:
- Master Spring MVC 4
date: 2015-03-27T00:00:00Z
description: In this chapter, we will implement file upload and see how to handle errors
  in Spring MVC
redirect_from: /spring/2015/04/10/chapter-4-file-upload-error-handling.html
tags:
- book
- spring mvc
title: Chapter 4 - File Upload and Error Handling
url: /book/chapter-4-file-upload-error-handling.html
weight: 4
---

In the fourth chapter of [Mastering Spring MVC 4](/mastering-spring-mvc4.html)
We will allow the user to upload his profile picture.

![Woah, such file upload!](/assets/images/book/chap3-1.png "File upload")

The file upload component implies handling errors at two levels:
I/O exceptions at the controller level and multipart exception (a file too big, for instance) at the container level.

If your curious about this part take a look at this [stackoverflow question](http://stackoverflow.com/questions/29363705/handling-multipartexception-with-spring-boot-and-display-error-page).

This will give us the opportunity to discuss error handling in Spring MVC and Spring boot.

![A beautiful 404 page](/assets/images/book/chap4-3.png "Not found")

Can't wait to hear what you think about this chapter!
