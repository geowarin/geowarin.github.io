---
categories:
- docker
date: 2016-01-12T00:00:00Z
description: With Gradle, you can create a Docker image of your Spring Boot application
  and ship it instead of shipping a jar
tags:
- spring-boot
title: Build a Docker image of your Spring Boot app
aliases:
    - /spring-boot-app-in-docker-image.html
---

If you like having a self-contained application as a deliverable
for your project, the idea of putting your Spring applications in a Docker
container might be appealing to you.

In this article, I will show you a simple way to make a docker image the output
of your Gradle build, thanks to the [gradle-docker](https://github.com/Transmode/gradle-docker) plugin.

The code that we will build is a simple console application powered by Spring Boot
that will periodically write Chuck Norris facts to the standard output.
It is [available on github](https://github.com/geowarin/sout-chuck-norris) and on [Docker Hub](https://hub.docker.com/r/geowarin/sout-chuck-norris/).

## Take a Spring boot application

You can easily generate a starter project with [start.spring.io](http://start.spring.io/)
or with [IntelliJ](https://www.jetbrains.com/idea/help/creating-spring-boot-projects.html).
We will create a gradle/groovy application with no Spring Boot starter to keep the code very simple.

Click on [this link](https://start.spring.io/#!type=gradle-project&language=groovy&groupId=com.github.geowarin&artifactId=sout-chuck-norris) to generate the project!

Unzip it and open it in your favorite IDE.
Since the application is going to loop forever, you can remove the generated test, which
would loop forever too.

Add the following dependency to your `build.gradle`:

```groovy
compile 'org.codehaus.groovy.modules.http-builder:http-builder:0.7.1'
```

Since we will use the JSONSlurper, the idiomatic way to parse JSON in groovy, we will need
to the change the groovy dependency to `groovy-all`:

```groovy
compile 'org.codehaus.groovy:groovy-all'
```

## The code

The code is really simple:

```groovy
package com.github.geowarin

import groovy.util.logging.Log4j
import groovyx.net.http.RESTClient
import org.apache.log4j.Level
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
@Log4j
class MainRunner implements CommandLineRunner {

    private static Random random = new Random();

    @Override
    void run(String... args) throws Exception {
        while (true) {
            log.log(randomLevel(), randomMessage())
            sleep 3000
        }
    }

    private Level randomLevel() {
        switch (random.nextInt(3)) {
            case 0:
                return Level.DEBUG;
            case 1:
                return Level.INFO;
            case 2:
                return Level.ERROR;
            default:
                return Level.INFO;
        }
    }

    private String randomMessage() {
        def client = new RESTClient('http://api.icndb.com/jokes/')
        def response = client.get(path: 'random')
        response.data.value.joke
    }
}
```

## Build the docker image

Add the plugin repository to find the Docker plugin:

```groovy
buildscript {
  ext {
    springBootVersion = '1.3.0.RELEASE'
  }
  repositories {
    mavenCentral()
  }
  dependencies {
    classpath("org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}")
    classpath "se.transmode.gradle:gradle-docker:1.2" // <- Here
  }
}
```

Apply the Docker plugin:

```groovy
apply plugin: 'docker'
```

Finally, add the buildDocker task:

```groovy
task buildDocker(type: Docker) {
  baseImage = 'develar/java:latest'
  push = project.hasProperty('push')
  tag = 'geowarin/sout-chuck-norris'
  addFile {
    from jar
    rename {'app.jar'}
  }
  entryPoint(['java', '-Djava.security.egd=file:/dev/./urandom', '-jar', '/app.jar'])
  // exposePort(8080)
}

buildDocker.dependsOn(build)
```

With this Docker plugin, every Docker instruction is available in the Gradle build
so you don't even have to write a Dockerfile.

In this task, we create an image called `geowarin/sout-chuck-norris` (change geowarin to
your user name).
It will contain only the jar produced by our build, which will be renamed to `app.jar`.
Then, the entry point of the container is simply `java -jar app.jar`.

The advantage of using an entry point instead of a `CMD` is that we can append command
line arguments to the `docker run ...` command and those will be passed to our application.

The downside is you cannot use `docker exec ... bash` to attach to the container.

We use Develar's java 8 image. It is built on top of Alpine and weights less than
120MB.

You can now run `./gradlew buildDocker` to create the docker image containing
our project.

```
REPOSITORY                   TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
geowarin/sout-chuck-norris   latest              85ff1a728670        4 seconds ago       135.9 MB

```

## Publish the image to the Docker hub

Create an account on [the docker hub](https://hub.docker.com/) then use
`docker login` to authenticate your client.

You can now run `./gradlew buildDocker -Ppush` to publish your image to docker
hub.

Once it is published, anyone can run you application.
If the image is not available on their machine, it will be pulled from the docker hub.

```
$> docker run geowarin/sout-chuck-norris
Unable to find image 'geowarin/sout-chuck-norris:latest' locally
latest: Pulling from geowarin/sout-chuck-norris
09ef480f93cc: Verifying Checksum
a6fb0a3c9260: Download complete
Pulling repository docker.io/geowarin/sout-chuck-norris
914b85281644: Pulling dependent layers
914b85281644: Download complete
Status: Downloaded newer image for geowarin/sout-chuck-norris:latest

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.3.1.RELEASE)

2016-01-12 16:54:19.089  INFO 1 --- [           main] c.g.geowarin.SoutChuckNorrisApplication  : Starting SoutChuckNorrisApplication on 05d1fedaba4d with PID 1 (/app.jar started by root in /)
2016-01-12 16:54:19.093  INFO 1 --- [           main] c.g.geowarin.SoutChuckNorrisApplication  : No active profile set, falling back to default profiles: default
2016-01-12 16:54:19.205  INFO 1 --- [           main] s.c.a.AnnotationConfigApplicationContext : Refreshing org.springframework.context.annotation.AnnotationConfigApplicationContext@4533542a: startup date [Tue Jan 12 16:54:19 GMT 2016]; root of context hierarchy
2016-01-12 16:54:20.609  INFO 1 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2016-01-12 16:54:21.456  INFO 1 --- [           main] com.github.geowarin.MainRunner           : Chuck Norris can download emails with his pick-up.
```

## Conclusion

Spring boot producing runnable jars, it is fairly easy to embed them inside
of a container.

As usual, do not hesitate to give me your feedback and to checkout the code
[on github](https://github.com/geowarin/sout-chuck-norris)!
