---
categories:
- spring-boot
date: 2016-02-02T00:00:00Z
Summary: The DateTime API in Java 8 is awesome but default Jackson serialization is
  not. Let's fix that!
tags:
- spring-boot
- jackson
- jsr-310
title: Correctly handle JSR-310 (java 8) dates with Jackson
aliases:
    - /jsr310-dates-with-jackson.html
---

If you are starting a Spring Boot project today, chances are that you want to use
Java 8.

One of the most awesome features in Java 8 is the [Date and Time API](http://www.mscharhag.com/java/java-8-date-time-api), also known as JSR-310.

By default, Jackson will treat the new dates as normal objects and serialize all the
fields that they contain, which will probably not suit your needs.

I will show you how to fix the problem with the [jackson-datatype-jsr310](https://github.com/FasterXML/jackson-datatype-jsr310) library,
within a Spring Boot project, but the concepts here are applicable to any application
using Jackson.

The code is [available on github](https://github.com/geowarin/boot-jsr310) if you want to take a look.

## The problem

Let's write a simple controller:

```java
@RestController
public class DateController {

    @RequestMapping("/localDate")
    public LocalDate todayLocalDate() {
        return LocalDate.now();
    }

    @RequestMapping("/offsetDateTime")
    public OffsetDateTime todayOffsetDateTime() {
        return OffsetDateTime.now();
    }
}
```

Simple, right? What could possibly go wrong?

![Oh boy what am I going to do with that?](/assets/images/articles/2016-02-localDate.png "Bad date time")

Well, it's probably not what you expected.
This output is not going to be easy to use in your client application.

More importantly, are you going to send this kind of format to your server
when you are targeting a Java date?

The output of `offsetDateTime` is pretty similar in terms of unusualness.

## The solution

Turns out that the solution is pretty straight-forward.
Just add the following dependency to your project:

```groovy
compile 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'
```

And the result, for `LocalDateTime`:

```
[
  2016,
  2,
  2
]
```

And for `OffsetDateTime`:

```
1454451664.708000000
```

Happy? No? Let's try improve the solution.

## Tweaking the output

If you look at how the library works internally, you will see that the output
depends on some features being activated or not.

To have a better default, we can override the default `ObjectMapper` and give
it a different config:

```java
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper objectMapper = builder.createXmlMapper(false).build();
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
//        objectMapper.configure(SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS, false);
        return objectMapper;
    }
}
```

This time the result is, for `LocalDateTime`:

```
2016-02-02
```

And for `OffsetDateTime`:

```
2016-02-02T23:24:08.255+01:00
```

If you uncomment the second line, dates will be written as timestamps without the nanoseconds
but unfortunately, it is mutually exclusive with the first option.

Nevertheless, those formats are a lot more sensible and understandable by client
libraries like [momentjs](http://momentjs.com/).

## Conclusion

It takes just a little configuration to make JSR-310 dates behave correctly with Jackson
and Spring Boot.

As always, check out the project [on github](https://github.com/geowarin/boot-jsr310) and tell if
this helped!
