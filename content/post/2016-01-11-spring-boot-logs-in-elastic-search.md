---
categories:
- 12-factors
- logging
date: 2016-01-11T00:00:00Z
description: Redirect your Spring boot logs to Elastic Search with a simple logback appender
tags:
- 12-factors
- logs
- elasticsearch
title: Spring boot logs in Elastic Search with fluentd
aliases:
    - /spring-boot-logs-in-elastic-search.html
---

If you deploy a lot of micro-services with Spring Boot (or any other technology),
you will have a hard time collecting and making sense of the all logs of your different
applications.

In this article, I will show you a simple way to redirect your logs to Elastic Search
with a Logback appender.

The demo project is [available on github](https://github.com/geowarin/fluentd-boot).

While this approach requires very little configuration, the [12 factors app manifesto](http://12factor.net/logs) actually recommends logging to stdout.

We will see how we can leverage docker to do that in the conclusion.

## The EFK stack

A lot of people refer to the triptych Elastic Search + Logstash + Kibana as the ELK
stack.

In this stack, [Logstash](https://www.elastic.co/products/logstash) is the log collector. Its role will be to redirect our
logs to Elastic Search.
Your app can either send its logs directly to Logstash/Fluentd as we will see in this example,
or write them to a file that Logstash will regularly process.

[Elastic Search](https://www.elastic.co/products/elasticsearch) is used to store and process a large amount of logs.

We can then use [Kibana](https://www.elastic.co/products/kibana) as a dashboard to analyze them:

![Kibana](/assets/images/articles/2016-01-kibana.png "Kibana")

Instead of Logstash, we will use [Fluentd](http://www.fluentd.org/), an alternative log collector which is really
easy to set up.

## Docker compose to run your EFK

With docker-compose, setting up the EFK stack is really straightforward:

```yaml
es:
  image: elasticsearch:2
# The following will store es data in your boot2docker vm
  volumes:
    - /srv/docker/es:/usr/share/elasticsearch/data
  ports:
    - 9200:9200
    - 9300:9300

kibana:
  image: kibana
  ports:
    - 5601:5601
  links:
    - es:elasticsearch

fluentd:
  build: fluent-es/
  ports:
    - 24224:24224
  links:
    - es:es
```

If you are running docker inside a VM, like me on my Mac, you cannot easily use volumes to
persist Elastic Search data because the owner of the directory must be `elasticsearch`.
So above is a little trick to easily overcome this.

To delete this directory, connect to your boot2docker vm with `docker-machine ssh default`.

The fluentd part points to a custom docker image in which I installed the Elastic
Search plugin as well as redefined the fluentd config to look like this:

```
<source>
type forward
port 24224
bind 0.0.0.0
</source>


<match **>
type elasticsearch
logstash_format true
host "#{ENV['ES_PORT_9200_TCP_ADDR']}" # dynamically configured to use Docker's link feature
port 9200
flush_interval 5s
</match>
```

In this config, we use the environment variable that docker-compose [automatically
sets](https://docs.docker.com/compose/env/) when we use links to find the Elastic
Search host.

## Configure logback to send logs to fluentd

Add the following dependencies to you build configuration:

```groovy
compile 'org.fluentd:fluent-logger:0.3.2'
compile 'com.sndyuk:logback-more-appenders:1.1.1'
```

We use [logback-more-appenders](https://github.com/sndyuk/logback-more-appenders), which
includes a fluentd appender.
It's not available on central so you will have to add the follwing maven repo:

```
repositories {
    mavenCentral()
    maven { url 'http://sndyuk.github.com/maven' }
}
```

Here is the logback configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/base.xml"/>
    <property name="FLUENTD_HOST" value="${FLUENTD_HOST:-${DOCKER_HOST:-localhost}}"/>
    <property name="FLUENTD_PORT" value="${FLUENTD_PORT:-24224}"/>
    <appender name="FLUENT" class="ch.qos.logback.more.appenders.DataFluentAppender">
        <tag>dab</tag>
        <label>normal</label>
        <remoteHost>${FLUENTD_HOST}</remoteHost>
        <port>${FLUENTD_PORT}</port>
        <maxQueueSize>20</maxQueueSize>
    </appender>

    <logger name="fluentd" level="debug" additivity="false">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
        <appender-ref ref="FLUENT" />
    </logger>
</configuration>
```

Note that we use the `FLUENTD_HOST` and `FLUENTD_PORT` environment variables
to connect to Fluentd so this can be overridden in production.

## Use docker to natively redirect logs to Fluentd

Redirecting to fluentd directly is kind of cool but, the [12 factors app manifesto](http://12factor.net/logs)
says we should write our logs to stdout instead.

If you use docker to deploy your services, you can use a native docker feature called
log drivers to redirect your standard output to fluentd!

```
docker run --log-driver=fluentd --log-opt fluentd-address=192.168.2.4:24225 ubuntu echo "Hello world"
```

See [the manual](http://www.fluentd.org/guides/recipes/docker-logging) for more information.

## Conclusion

In a cloud environment, redirecting your app's logs to a file is not practical.
Sometimes, it is not even an option (no persistent filesystem available on your host).

Elastic Search tends to become the de-facto standard logging solution for the
cloud era.

Don't forget to checkout the project [on github](https://github.com/geowarin/fluentd-boot)
and tell me what you think!
