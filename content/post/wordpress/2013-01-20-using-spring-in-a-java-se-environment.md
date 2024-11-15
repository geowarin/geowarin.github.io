---
categories:
- spring
date: 2013-01-20T19:31:56Z
Summary: Demonstration of how to set up spring in java SE and inject several implementations
  of the same interface
redirect_from: /2013/01/20/using-spring-in-a-java-se-environment-and-implementing-the-chain-of-responsibility-pattern/
tags:
- design pattern
- java SE
- spring
- spring-java-config
- spring-test
title: Using spring in a Java SE environment and implementing the chain of responsibility
  pattern
aliases:
    - /using-spring-in-a-java-se-environment.html
---

In this post I will show you how to use spring 3.0 [Java based configuration](http://www.springsource.org/javaconfig) in a Java SE environment, taking advantage of spring autowiring to implement the [chain of responsibility ](http://en.wikipedia.org/wiki/Chain-of-responsibility_pattern)design pattern with components and services in a simple project. We will also use spring's [PropertySourcesPlaceholderConfigurer](http://static.springsource.org/spring/docs/3.2.x/javadoc-api/org/springframework/context/support/PropertySourcesPlaceholderConfigurer.html) to inject custom properties into our beans with the [@Value](http://static.springsource.org/spring/docs/3.2.x/javadoc-api/org/springframework/beans/factory/annotation/Value.html) annotation and test our application with spring-test.

Some fun in perspective ! Tag along.

The source code of this application is available on my github : [https://github.com/geowarin/spring-examples/tree/master/spring-standalone-chain](https://github.com/geowarin/spring-examples/tree/master/spring-standalone-chain)

## Java configuration

Starting from spring 3.0, it is possible to get rid of any XML configuration by providing a pure Java configuration. This is done by annotating your configuration classes with the **@Configuration** annotation and annotating your beans with **@Bean**:

```java
@Configuration
@ComponentScan(basePackages = {"com.geowarin.spring.service", "com.geowarin.spring.component"})
@PropertySource(value = "classpath:chain.properties")
public class SpringStandalonChainConfig {

	@Bean
	public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
		PropertySourcesPlaceholderConfigurer pspc = new PropertySourcesPlaceholderConfigurer();
		pspc.setPlaceholderPrefix("#{");
		return pspc;
	}

	@Bean
	public MainBean mainBean() {
		return new MainBean();
	}
}
```

Additional annotation for java configuration include **@ComponentScan** to specify packages in which your **@Component**, **@Service**, etc. beans are included and **@PropertySource** to include property files in your configuration.

Two thing here :

  1. I declare a **MainBean** which will act as an entry point for our application. This bean will benefit of spring autowiring
  2. I declare a custom **PropertySourcesPlaceholderConfigurer** to enable the injection of properties annotated with @Value. I am customizing the prefix for usage of [spring Expression Language](http://static.springsource.org/spring/docs/3.0.x/reference/expressions.html) to be able to use #{} expressions instead of default ${}


Injection with **@Value** property is a very interesting alternative to the use of spring's Environment as it provides natural type inference.

For some people, the use of java configuration can be confusing because one cannot see at first glance where the config is located. What I usually do is keeping my configuration in a separate source folder. This can be achieved with maven and its build-helper plugin :

{{< gist geowarin 4581500 >}}

This approach is compatible with eclipse if you have m2e installed. In that case when you import a project using this plugin, eclipse will prompt you for the install of the build-helper connector.


## Our application entry point : the MainBean


Here is the code of our **MainBean** :

```java
public class MainBean {

	@Autowired
	@Qualifier("doChain")
	private ChainService service;

	@Value("#{chain.compatibleWithFirst}") boolean compatibleWithFirst;
	@Value("#{chain.compatibleWithSecond}") boolean compatibleWithSecond;

	private static Logger log = LoggerFactory.getLogger(MainBean.class);

	public void start() {

		log.info("property compatibleWithFirst=" + compatibleWithFirst);
		log.info("property compatibleWithSecond=" + compatibleWithSecond);

		ChainContext chainContext = new ChainContext(compatibleWithFirst, compatibleWithSecond);
		service.executeChain(chainContext);
	}

}
```

We are injecting our service into the bean with a custom qualifier which will enable us to provide several implementations of our service if we need it.

Note that the **@Value** annotation, our properties will automatically be casted to booleans, which is pretty cool. Here is our chain.properties file :

```bash
chain.compatibleWithFirst=false
chain.compatibleWithSecond=true
```




## The Chain : Two components and a service



The **ChainContext** class is a simple pojo we pass to our service to be handled by the chain of responsibility and enable us to test if our service successfully handled our case :

```java
public class ChainContext {

	private final boolean compatibleWithFirstElement;
	private final boolean compatibleWithSecondElement;

	private boolean handledByFirst;
	private boolean handledBySecond;

	public ChainContext(boolean compatibleWithFirstElement, boolean compatibleWithSecondElement) {
		this.compatibleWithFirstElement = compatibleWithFirstElement;
		this.compatibleWithSecondElement = compatibleWithSecondElement;
	}

	// Getters and setters ommited
}
```

**ChainElement** is a simple interface which will be implemented by two components : **FirstChainElement** and **SecondChainElement**.

```java
public interface ChainElement {

	public boolean doChain(ChainContext context);
}
```

Here is the first element, the second one is essentially the same thing :

```java
@Component
@Order(1)
public class FirstChainElement implements ChainElement {

	private static Logger log = LoggerFactory.getLogger(FirstChainElement.class);

	@Override
	public boolean doChain(ChainContext context) {

		if (context.isCompatibleWithFirstElement()) {
			log.info("Handled by first");
			context.setHandledByFirst(true);
			return true;
		}

		return false;
	}
}
```

The thing to note here is the use of the spring annotation [@Order](http://static.springsource.org/spring/docs/3.0.x/javadoc-api/org/springframework/core/annotation/Order.html) which will enable us to sort our list using spring's [AnnotationAwareOrderComparator](http://static.springsource.org/spring/docs/3.0.x/api/org/springframework/core/annotation/AnnotationAwareOrderComparator.html). Neat :)

And now the service :

```java
@Service
@Qualifier("doChain")
public class DoChainService implements ChainService {

	@Autowired
	private List<ChainElement> chain;

	@PostConstruct
	public void init() {
		Collections.sort(chain, AnnotationAwareOrderComparator.INSTANCE);
	}

	@Override
	public void executeChain(ChainContext context) {

		for (ChainElement chainElement : chain) {
			if (chainElement.doChain(context))
				break;
		}
	}
}
```

Note that we use the same qualifier as our **MainBean** here. The main trick in this article is the usage of **@Autowired** to inject all the components implementing the **ChainElement** interface into a List.



## The application main and tests



That's it ! Now you can run your project with this main class :

```java
public class SpringStandaloneChainApp {

	private static final String CONFIG_PACKAGE = "com.geowarin.spring.config";

	public static void main(String[] args) {

		try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()) {

			ctx.scan(CONFIG_PACKAGE);
			ctx.refresh();

			MainBean bean = ctx.getBean(MainBean.class);
			bean.start();
		}
	}
}
```

And unit test the service with spring-test like that :

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { SpringStandalonChainConfig.class })
public class ChainServiceTest extends TestCase {

	@Autowired
	private ChainService chainService;

	@Test
	public void testHandledByFirst() {

		ChainContext chainContext = new ChainContext(true, false);
		chainService.executeChain(chainContext);

		Assert.assertTrue(chainContext.isHandledByFirst());
		Assert.assertFalse(chainContext.isHandledBySecond());
	}

	@Test
	public void testHandledBySecond() {

		ChainContext chainContext = new ChainContext(false, true);
		chainService.executeChain(chainContext);

		Assert.assertFalse(chainContext.isHandledByFirst());
		Assert.assertTrue(chainContext.isHandledBySecond());
	}
}
```


## Conclusion



Spring is perfectly suitable for a Java SE Environment. Its new java configuration is very handy and powerful as long as you keep things tidy and make sure the configuration is not spread across the whole project.
Finally, let's note it is possible to inject all components or services implementing a given interface into a list with the `@Autowired annotation.
