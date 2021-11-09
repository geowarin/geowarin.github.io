---
categories:
- testing
date: 2016-01-06T00:00:00Z
description: Docker can help you write better tests with a simple JUnit rule
tags:
- featured
- test
- junit
- junit-rule
title: Integration tests with a Docker JUnit Rule
aliases:
    - /docker-junit-rule.html
---

When writing integration tests, you might have to run a third party server
or middleware.
Your tests should remain fast to run and you should be able to run them
from your IDE.

Docker seems a good choice for this task!

I just published a [small library](https://github.com/geowarin/docker-junit-rule) that contains a [JUnit rule](https://github.com/junit-team/junit/wiki/Rules) allowing you
to start Docker containers before your unit tests.

If that sounds of interest to you, you should give it a try and tell me what
you think!

## JUnit rules

JUnit rules allow us to do some sort of [AOP](https://en.wikipedia.org/wiki/Aspect-oriented_programming) applied to JUnit test.
Within a rule you are given the handle of the test to run.

You can decide what to do with it. Should we skip it? Should we run it?
Should we wrap it in a try catch? Should we add some behavior before or after
the test?

You can use the `@Rule` annotation to run the rule before each test or the
`@ClassRule` annotation to run it once in your test class.

You can have has many rules as you need in your any of your tests.

It is much more powerful than creating an abstract test class from which
test will inherit.
This is the application of the [composition over inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) principle.

Here is an example of a JUnit rule:

```java
import com.rabbitmq.client.ConnectionFactory;
import org.junit.ClassRule;
import org.junit.Test;
import rules.RabbitContainerRule;

public class RabbitIntegrationTest {

    @ClassRule
    public static RabbitContainerRule rabbitContainerRule = new RabbitContainerRule();

    @Test
    public void testConnectsToDocker() throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(rabbitContainerRule.getDockerHost());
        factory.setPort(rabbitContainerRule.getRabbitServicePort());
        factory.newConnection();
    }
}
```

## Behind the scene

Did you know that the Docker daemon is accessible via a [REST API](https://docs.docker.com/engine/reference/api/docker_remote_api/)?
In fact when you use the docker client, it sends HTTP requests to
the daemon.

That also means that we can create other docker clients in any programming language.
In Java, Spotify has open-sourced a great [docker client](https://github.com/spotify/docker-client).

We will use this library to create our JUnit rule.
Here is a simplified version of what we will be doing:

```java
public class DockerContainerRule extends ExternalResource {
  public DockerContainerRule(String imageName, String[] ports, String cmd) {
    dockerClient = createDockerClient();
    ContainerConfig containerConfig = createContainerConfig(imageName, ports, cmd);
    dockerClient.pull(imageName);
    container = dockerClient.createContainer(containerConfig);
  }

  @Override
  protected void before() throws Throwable {
    super.before();
    dockerClient.startContainer(container.id());
  }

  @Override
  protected void after() {
    super.after();
    dockerClient.killContainer(container.id());
    dockerClient.removeContainer(container.id(), true);
    dockerClient.close();
  }
}
```

Simple, isn't it?
You can check out the full code [here](https://github.com/geowarin/docker-junit-rule/blob/master/src/main/java/com/github/geowarin/junit/DockerContainerRule.java)

This class will allow users to create their own rules, extending this one:

```java
public class RabbitContainerRule extends DockerContainerRule {
    public static final String RABBIT_CONTAINER_IMAGE_NAME = "rabbitmq:management";

    public RabbitContainerRule() {
        // List the ports to open on the container.
        // They will automatically be bound to random unused ports on your host
        super(RABBIT_CONTAINER_IMAGE_NAME, new String[]{"5672", "15672"});
    }

    @Override
    protected void before() throws Throwable {
        super.before();
        // wait for container to boot
        waitForPort(getRabbitServicePort());
    }

    public int getRabbitServicePort() {
        return getHostPort("5672/tcp");
    }

    public int getRabbitManagementPort() {
        return getHostPort("15672/tcp");
    }
}
```

## Bonus

There is an annoying thing with docker containers: you cannot tell if the
process running inside is in a ready state and waiting for your to use
it or if it is still booting.

Most people use [`netcat`](https://en.wikipedia.org/wiki/Netcat) on a specific
port to [wait for a container](https://github.com/aanand/docker-wait).

In Java, we can do the same thing with good old sockets!

```java
public void waitForPort(int port, long timeoutInMillis) {
  SocketAddress address = new InetSocketAddress(getDockerHost(), port);
  long totalWait = 0;
  while (true) {
    try {
      SocketChannel.open(address);
      return;
    } catch (IOException e) {
      try {
        Thread.sleep(100);
        totalWait += 100;
        if (totalWait > timeoutInMillis) {
          throw new IllegalStateException("Timeout while waiting for port " + port);
        }
      } catch (InterruptedException ie) {
        throw new IllegalStateException(ie);
      }
    }
  }
}
```

## Conclusion

JUnit rules are a very cool way to improve the readability and the expressiveness of our tests.
Check out the [system rules](http://stefanbirkner.github.io/system-rules/) for
a good example.

Don't forget to give a try to the project, which is available [on github](https://github.com/geowarin/docker-junit-rule) and give me your feedback.
