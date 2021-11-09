---
categories:
- spring
- spring-boot
- jersey
- java
date: 2014-01-31T00:00:00Z
description: How to setup a simple spring-boot and jersey application
redirect_from: /spring/spring-boot/jersey/java/2014/01/31/a-simple-spring-boot-and-jersey-application.html
tags:
- spring
- spring-boot
- jersey
title: A simple Spring Boot and Jersey Application
aliases:
    - /a-simple-spring-boot-and-jersey-application.html
---

Spring boot RC1 [is available](https://spring.io/blog/2014/01/22/spring-boot-1-0-0-rc1-released).

_Update_ : [RC3 released](https://spring.io/blog/2014/02/12/spring-boot-1-0-0-rc2-released) I updated the project.

It takes spring development and fast prototyping to a whole new level by taking care of all the dependencies for you, auto-detecting your configuration, providing an executable jar (great for deploying in the cloud), and much more.

In this post we'll see how to integrate spring-boot with jersey, including testing of Jersey controllers with [jersey-test](https://jersey.java.net/documentation/latest/test-framework.html).

Of course, the source code is available [on my github](https://github.com/geowarin/springboot-jersey).

## Setting up spring-boot


[Spring boot](http://projects.spring.io/spring-boot/) aims towards simplicity and convention over configuration. First step is to include the necessary configuration in your pom.xml :

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.0.0.RC3</version>
</parent>
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
<repositories>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>http://repo.spring.io/milestone</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

One of the good ideas of spring boot is to provide all the 'boilerplate' configuration for you by letting you inherit their parent configuration.

Then, you'll select a starter, in this case, we are going to develop a web application, so starter-web is fine.

Now, we'll create a main function for our application :

```java
@EnableAutoConfiguration
public class Application {

    public static void main(String[] args) throws Exception {
        new SpringApplicationBuilder(Application.class)
                .showBanner(false)
                .run(args);
    }
}
```

We will just add an index.html file in the webapp directory and we should be ok.
With this configuration, you can run the main function and you'll see your index file.

Awesome.

## Runnable jar

Spring boot allows you to package your application as a runnable jar. Include the following in your `pom.xml` :

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>

<pluginRepositories>
    <pluginRepository>
        <id>spring-milestones</id>
        <url>http://repo.spring.io/milestone</url>
    </pluginRepository>
</pluginRepositories>
```

With this, when running `mvn package`, you will generate the runnable jar.
Just `java -jar` it to launch an embedded Tomcat containing your webapp!

## Integrating jersey

Jersey has a spring support project [jersey-spring-3](https://jersey.java.net/documentation/latest/spring.html). Despite what its name suggests, the project is (still?) compatible with spring 4.0 so we'll use it.

It basically allows you to inject spring beans in your jersey controllers.

To complete our configuration we'll add the jersey servlet to our application together with a small class to configure it.

In the Application :

```java
@Bean
public ServletRegistrationBean jerseyServlet() {
    ServletRegistrationBean registration = new ServletRegistrationBean(new ServletContainer(), "/rest/*");
    // our rest resources will be available in the path /rest/*
    registration.addInitParameter(ServletProperties.JAXRS_APPLICATION_CLASS, JerseyConfig.class.getName());
    return registration;
}
```

We also need to add the `@ComponentScan` annotation to find our spring services and components (including jersey)

Next, we'll create the JerseyConfig class :

```java
public class JerseyConfig extends ResourceConfig {

    public JerseyConfig() {
        register(RequestContextFilter.class);
        packages("com.geowarin.rest");
        register(LoggingFilter.class);
    }
}
```

Here we are providing the package(s) in which our rest resources are.

Speaking about our rest resources, we'll create a simple one :

```java
@Path("/")
@Component
public class RestResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/hello")
    public String hello() {
        return "Hello World";
    }
}
```

There you have it : the dreadful hello world !

In the [complete example](https://github.com/geowarin/springboot-jersey), I show you how to generate JSON from a domain class.

Basically all you have to do is provide classes with the `@XmlRootElement` annotation, add the getters and setters for the properties you want serialized and don't forget to provide a default constructor (see [here](https://github.com/geowarin/springboot-jersey/blob/master/src/main/java/com/geowarin/domain/Message.java)).

To show that dependency injection works, we'll add a simple service :

```java
@Singleton
@Service
public class MessageService {
    List<Message> messages = Collections.synchronizedList(new ArrayList<Message>());

    @PostConstruct
    public void init() {
        messages.add(new Message("Joe", "Hello"));
        messages.add(new Message("Jane", "Spring boot is cool !"));
    }

    public List<Message> getMessages() {
        return messages;
    }
}
```

We can now autowire it to our Jersey controller!

```java
@Path("/")
@Component
public class RestResource {

    @Autowired
    private MessageService messageService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/messages")
    public List<Message> message() {
        return messageService.getMessages();
    }
}
```

[Moxy](http://www.eclipse.org/eclipselink/moxy.php) will automatically convert
the returned result to JSON.

## Testing

Real programmers do tests. We want to test our controller right? There is a framework for that: [jersey-test](https://jersey.java.net/documentation/latest/test-framework.html).

*The Problem?* it does not (yet) support annotated configuration.

<del>
I'm providing a little hack of my own to override the `SpringComponentProvider` class of _jersey-spring3_ and allow this configuration. See the class on github. It is important to place it in the same package as the original one.
</del>


_Update_ : I submitted a [pull request](https://github.com/jersey/jersey/pull/59) which has been accepted by Jersey. I updated the project to use the 2.6 snapshot release of jersey which includes the modified `SpringComponentProvider`.

Now the test :

```java
public class RestResourceTest extends JerseyTest {

    @Override
    protected Application configure() {
        ApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class);
        return new JerseyConfig()
                .property("contextConfig", context);
    }

    @Test
    public void testHello() {
        final String hello = target("hello").request().get(String.class);
        assertThat(hello).isEqualTo("Hello World");
    }

    @Test
    public void testMessages() throws JSONException {
        final String messages = target("messages").request().get(String.class);
        String expected = "[ " +
                "{ 'author': 'Joe', 'contents': 'Hello'}," +
                "{ 'author': 'Jane', 'contents': 'Spring boot is cool !'}" +
                "]";
        JSONAssert.assertEquals(expected, messages, JSONCompareMode.LENIENT);
    }
}
```
Jersey Test will automatically select a provider from your classpath, in the example I'm using the in memory provider which I believe to be the fastest but you can also use [grizzly](https://grizzly.java.net/) and others instead.

I'm using [JSONassert](https://github.com/skyscreamer/JSONassert) to test json results.

In the example, we are providing a simple, lighter `TestConfig` :

```java
@Configuration
@ComponentScan(basePackageClasses = RestResource.class)
public class TestConfig {
}
```

## Conclusion

Testing with Jersey Test is fast and intuitive.

Spring boot is a nice addition to the spring ecosystem. Now that everything should be accessible from the cloud, so should be spring webapps !
