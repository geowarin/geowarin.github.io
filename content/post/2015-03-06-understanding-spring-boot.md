---
categories:
- spring
- spring-boot
date: 2015-03-06T00:00:00Z
Summary: Wonder how spring boot's magic operates behind the scenes? You've come to
  the right place!
redirect_from: spring/spring-boot/2015/03/06/understanding-spring-boot.html
tags:
- spring
- spring-boot
- code-review
- featured
title: Understanding Spring Boot
aliases:
    - /understanding-spring-boot.html
---

Spring boot is an opinionated library that allows to create executable Spring applications with a convention over configuration approach.

The magic behind this framework lies in the `@EnableAutoConfiguration` annotation,
which will automatically load all the beans the application requires depending
on what Spring Boot finds in the classpath.

## The `@Enable*` annotations

The `@Enable...` annotations are not new, they were first introduced in Spring 3 when the idea of replacing the XML files with java annotated classes is born.

A lot of Spring users already know `@EnableTransactionManagement`, which will enable declarative transaction management,
`@EnableWebMvc`, which enables Spring MVC, or `@EnableScheduling`, which will initialize a scheduler.

These annotations are in fact a simple configuration import with the `@Import` annotation.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import({ EnableAutoConfigurationImportSelector.class,
        AutoConfigurationPackages.Registrar.class })
public @interface EnableAutoConfiguration {

    /**
     * Exclude specific auto-configuration classes such that they will never be applied.
     */
    Class<?>[] exclude() default {};

}
```

The `EnableAutoConfigurationImportSelector` uses `SpringFactoriesLoader#loadFactoryNames` of Spring core.
SpringFactoriesLoader will look for jars containing a file with the path `META-INF/spring.factories`.

When it finds such a file, the `SpringFactoriesLoader` will look for the property named after our configuration file.
In our case, `org.springframework.boot.autoconfigure.EnableAutoConfiguration`.

Let's take a look at the `spring-boot-autoconfigure` jar, which indeed contains a `spring.factories` file copied below:

```properties
# Initializers
org.springframework.context.ApplicationContextInitializer=\
org.springframework.boot.autoconfigure.logging.AutoConfigurationReportLoggingInitializer

# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
org.springframework.boot.autoconfigure.MessageSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.PropertyPlaceholderAutoConfiguration,\
org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration,\
org.springframework.boot.autoconfigure.data.JpaRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.MongoRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.redis.RedisAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.JmsTemplateAutoConfiguration,\
org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration,\
org.springframework.boot.autoconfigure.mobile.DeviceResolverAutoConfiguration,\
org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration,\
org.springframework.boot.autoconfigure.mongo.MongoTemplateAutoConfiguration,\
org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
org.springframework.boot.autoconfigure.reactor.ReactorAutoConfiguration,\
org.springframework.boot.autoconfigure.security.SecurityAutoConfiguration,\
org.springframework.boot.autoconfigure.security.FallbackWebSecurityAutoConfiguration,\
org.springframework.boot.autoconfigure.thymeleaf.ThymeleafAutoConfiguration,\
org.springframework.boot.autoconfigure.web.EmbeddedServletContainerAutoConfiguration,\
org.springframework.boot.autoconfigure.web.DispatcherServletAutoConfiguration,\
org.springframework.boot.autoconfigure.web.ServerPropertiesAutoConfiguration,\
org.springframework.boot.autoconfigure.web.MultipartAutoConfiguration,\
org.springframework.boot.autoconfigure.web.HttpMessageConvertersAutoConfiguration,\
org.springframework.boot.autoconfigure.web.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.WebSocketAutoConfiguration
```

In this file, we can see a list of the Spring Boot auto-configurations.
Let's take a closer look at one of those configurations, `MongoAutoConfiguration` for instance:

```java
@Configuration
@ConditionalOnClass(Mongo.class)
@EnableConfigurationProperties(MongoProperties.class)
public class MongoAutoConfiguration {

    @Autowired
    private MongoProperties properties;

    private Mongo mongo;

    @PreDestroy
    public void close() throws UnknownHostException {
        if (this.mongo != null) {
            this.mongo.close();
        }
    }

    @Bean
    @ConditionalOnMissingBean
    public Mongo mongo() throws UnknownHostException {
        this.mongo = this.properties.createMongoClient();
        return this.mongo;
    }

}
```

This simple Spring configuration class declares typical beans needed to use mongoDb.

This classes, like a lot of others in Spring Boot relies heavily on Spring annotations:

* `@ConditionOnClass` activates a configuration only if one or several classes are present on the classpath
* `@EnableConfigurationProperties` automatically maps a POJO to a set of properties in the Spring Boot configuration file
(by default `application.properties`)
* `@ConditionalOnMissingBean` enables a bean definition only if the bean wasn't previously defined

You can also refine the order in which those configuration classes load with `@AutoConfigureBefore` et `@AutoConfigureAfter`.

## Properties Mapping

Let's look at `MongoProperties`, which is a classic example of Spring Boot properties mapping:

```java
@ConfigurationProperties(prefix = "spring.data.mongodb")
public class MongoProperties {

    private String host;
    private int port = DBPort.PORT;
    private String uri = "mongodb://localhost/test";
    private String database;

    // ... getters/ setters omitted
}
```

The `@ConfigurationProperties` will associate every properties with a particular prefix to the POJO.
For instance, the property `spring.data.mongodb.port` will be mapped to the port attribute of this class.

If you're a Spring Boot user, I strongly encourage you to use those capabilities to remove the boiler plate code
associated with configuration properties.

## The `@Conditional` annotations

The power of Spring Boot lies in one of Spring 4 new features: the `@Conditional` annotations,
which will enable some configuration only if a specific condition is met.

A sneak peek in the `org.springframework.boot.autoconfigure.condition` package in Spring Boot will give us an overview of what
we can do with those annotations:

* `@ConditionalOnBean`
* `@ConditionalOnClass`
* `@ConditionalOnExpression`
* `@ConditionalOnMissingBean`
* `@ConditionalOnMissingClass`
* `@ConditionalOnNotWebApplication`
* `@ConditionalOnResource`
* `@ConditionalOnWebApplication`

Let's take a closer look at `@ConditionalOnExpression`, which allows you to write a condition in the [Spring Expression language](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/expressions.html).

```java
@Conditional(OnExpressionCondition.class)
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE, ElementType.METHOD })
public @interface ConditionalOnExpression {

    /**
     * The SpEL expression to evaluate. Expression should return {@code true} if the
     * condition passes or {@code false} if it fails.
     */
    String value() default "true";

}
```

In this class, we indeed make use of the `@Conditional` annotation. The condition is defined in the `OnExpressionCondition` class:

```java
public class OnExpressionCondition extends SpringBootCondition {

    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // ...
        // we first get a handle on the EL context via the ConditionContext

        boolean result = (Boolean) resolver.evaluate(expression, expressionContext);

        // ...
        // here we create a message the user will see when debugging

        return new ConditionOutcome(result, message.toString());
    }
}
```

In the end, the `@Conditional` are resolved to simple booleans, via the `ConditionOutcome.isMatch` method.

## The `ApplicationContextInitializer`s

The second possibility that the `spring.factories` file offers, is to define application initializers.
They allow us to manipulate Spring's `applicationContext` before the application is loaded.

In particular, they can create listeners on the context thanks to the `ConfigurableApplicationContext#addApplicationListener`
method.

Spring Boot does that in the `AutoConfigurationReportLoggingInitializer` which listens to system events, like context refresh or the application's failure to start.
This will help create the auto-configuration report when you start your application
in debug mode.

You can start your application in debug mode with either the `-Ddebug` flag or add the property `debug=true` to `application.properties`.

## Debug Spring Boot Auto-Configuration

The documentation gives us [some advice](http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#howto-troubleshoot-auto-configuration) to
understand what happened during the auto-configuration.

When launched in debug mode, Spring Boot will generate a report that looks like this one:

```
Positive matches:
-----------------

   MessageSourceAutoConfiguration
      - @ConditionalOnMissingBean (types: org.springframework.context.MessageSource; SearchStrategy: all) found no beans (OnBeanCondition)

   JmxAutoConfiguration
      - @ConditionalOnClass classes found: org.springframework.jmx.export.MBeanExporter (OnClassCondition)
      - SpEL expression on org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration: ${spring.jmx.enabled:true} (OnExpressionCondition)
      - @ConditionalOnMissingBean (types: org.springframework.jmx.export.MBeanExporter; SearchStrategy: all) found no beans (OnBeanCondition)

   DispatcherServletAutoConfiguration
      - found web application StandardServletEnvironment (OnWebApplicationCondition)
      - @ConditionalOnClass classes found: org.springframework.web.servlet.DispatcherServlet (OnClassCondition)


Negative matches:
-----------------

   DataSourceAutoConfiguration
      - required @ConditionalOnClass classes not found: org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType (OnClassCondition)

   DataSourceTransactionManagerAutoConfiguration
      - required @ConditionalOnClass classes not found: org.springframework.jdbc.core.JdbcTemplate,org.springframework.transaction.PlatformTransactionManager (OnClassCondition)

   MongoAutoConfiguration
      - required @ConditionalOnClass classes not found: com.mongodb.Mongo (OnClassCondition)

   FallbackWebSecurityAutoConfiguration
      - SpEL expression on org.springframework.boot.autoconfigure.security.FallbackWebSecurityAutoConfiguration: !${security.basic.enabled:true} (OnExpressionCondition)

   SecurityAutoConfiguration
      - required @ConditionalOnClass classes not found: org.springframework.security.authentication.AuthenticationManager (OnClassCondition)

   EmbeddedServletContainerAutoConfiguration.EmbeddedJetty
      - required @ConditionalOnClass classes not found: org.eclipse.jetty.server.Server,org.eclipse.jetty.util.Loader (OnClassCondition)

   WebMvcAutoConfiguration.WebMvcAutoConfigurationAdapter#localeResolver
      - @ConditionalOnMissingBean (types: org.springframework.web.servlet.LocaleResolver; SearchStrategy: all) found no beans (OnBeanCondition)
      - SpEL expression: '${spring.mvc.locale:}' != '' (OnExpressionCondition)

   WebSocketAutoConfiguration
      - required @ConditionalOnClass classes not found: org.springframework.web.socket.WebSocketHandler,org.apache.tomcat.websocket.server.WsSci (OnClassCondition)
```

For each auto-configuration, we can see why it was initiated or why it failed.

## Conclusion

Spring Boot's approach leverages the possibilities of Spring 4 and allows to create an auto-configured
[executable jar](http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#getting-started-first-application-executable-jar).

Don't forget that, as [the documentation states](http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using-boot-replacing-auto-configuration), you can gradually replace the auto-configuration by declaring your own beans.

What I love about Spring Boot is that it allows you to prototype an application very quickly but also to learn with its
source. Auto-configurations are neat pieces of code that can teach you a thing or two about Spring.

As Josh Long, developer advocate at Pivotal, said:

<blockquote>Boot lets you pair-program w/ the [Spring team](http://spring.io/team)</blockquote>[(Link to the tweet)](https://twitter.com/starbuxman/status/458266170861158401)
