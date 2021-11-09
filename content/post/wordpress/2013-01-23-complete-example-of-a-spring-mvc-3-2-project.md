---
categories:
- spring
- spring-mvc
date: 2013-01-23T00:00:00Z
description: Awesome spring mvc 3.2 starter with sitemesh, localization, UTF-8, boostrap
  and spring test mvc
redirect_from: /2013/01/23/complete-example-of-a-spring-mvc-3-2-project/
tags:
- spring-java-config
- spring-mvc
- featured
title: Complete example of a Spring MVC 3.2 project
aliases:
    - /complete-example-of-a-spring-mvc-3-2-project.html
---

You want to get started with Spring MVC 3.2 with a complete XML-less configuration? Have a cool simple project with a lot of the nice-to-have features?


  1. A templating framework (we will use [SiteMesh](http://wiki.sitemesh.org/display/sitemesh/Home) for this example - I think it is one of the simplest, most powerful frameworks out there)
  2. Localized and custom text and validation messages with reloadable bundles in development
  3. UTF-8 encoding filter for your user inputs
  4. Use the [twitter boostrap](http://twitter.github.com/bootstrap/) for a responsive, slick design
  5. Unit tests of your controllers using [spring-test-mvc](https://github.com/SpringSource/spring-test-mvc)
  6. Be able to run it with embedded tomcat or jetty maven plugins?


Then you can directly git clone this project : [https://github.com/geowarin/spring-mvc-examples/tree/master/mvc-base](https://github.com/geowarin/spring-mvc-examples/tree/master/mvc-base)

This article will explain how this can be done with 5 classes and 1 jsp.


## The configuration with spring 3.2 and servlet 3.0


Since spring 3.1, it is possible to run spring MVC without a web.xml if you are in a servlet 3.0 environment. But spring 3.2 takes things a little bit further by providing a set of abstract classes to enable a [very easy configuration](http://static.springsource.org/spring-framework/docs/3.2.0.RELEASE/spring-framework-reference/html/mvc.html#mvc-container-config). Check this :

```java
public class WebInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

	@Override
	protected Class<?>[] getRootConfigClasses() {
		return null;
	}

	@Override
	protected Class<?>[] getServletConfigClasses() {
		return new Class<?>[] { WebConfig.class };
	}

	@Override
	protected String[] getServletMappings() {
		return new String[] { "/" };
	}

	@Override
	protected Filter[] getServletFilters() {

		CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
		characterEncodingFilter.setEncoding("UTF-8");

		return new Filter[] { characterEncodingFilter, new SiteMeshFilter()};
	}
}
```

The filters are not mandatory, it just demonstrates how to add them to this configuration (site mesh requires a small xml file to point to a template - it won't be covered by this article but check out the [documentation](http://wiki.sitemesh.org/display/sitemesh/Start+Using+SiteMesh+in+10+Minutes) or have a look at this project on [github](https://github.com/geowarin/spring-mvc-examples/tree/master/mvc-base)).

The UTF-8 filter will prevent encoding problems with your user inputs.

Spring MVC also requires a **WebConfig** class. This is the minimal one :

```java
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = { "com.geowarin.mvc.base.controller" })
public class WebConfig extends WebMvcConfigurerAdapter {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/resources/**").addResourceLocations("/resources/");
	}

	@Bean
	public ViewResolver viewResolver() {

		InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
		viewResolver.setViewClass(JstlView.class);
		viewResolver.setPrefix("/WEB-INF/views");
		viewResolver.setSuffix(".jsp");
		return viewResolver;
    }
}
```

The **@ComponentScan** annotation will indicate the package in which our controllers are found.
The **ViewResolver** bean will indicate both where our views can be found and what their extension is.

In this example for instance we will just have a simple view in **/WEB-INF/views/home.jsp**. The **ResourceHandler** indicates where our static resources can be found (css, js, images, etc.).

Here is our controller :

```java
@Controller
public class HomeController {

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String displayHome(Model model) {
		return "/home";
	}
}
```

At this point, you can write "hello" in your home.jsp, launch a tomcat and enjoy our 3 classes spring MVC hello world. No web.xml, nothing else.


## Interceptors, locales, messages


Let me just show you the full configuration for our project :

```java
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = { "com.geowarin.mvc.base.controller" })
public class WebConfig extends WebMvcConfigurerAdapter {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/resources/**").addResourceLocations("/resources/");
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {

		LocaleChangeInterceptor localeChangeInterceptor = new LocaleChangeInterceptor();
		localeChangeInterceptor.setParamName("lang");
		registry.addInterceptor(localeChangeInterceptor);
	}

	@Bean
	public LocaleResolver localeResolver() {

		CookieLocaleResolver cookieLocaleResolver = new CookieLocaleResolver();
		cookieLocaleResolver.setDefaultLocale(StringUtils.parseLocaleString("en"));
		return cookieLocaleResolver;
	}

	@Bean
	public ViewResolver viewResolver() {

		InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
		viewResolver.setViewClass(JstlView.class);
		viewResolver.setPrefix("/WEB-INF/views");
		viewResolver.setSuffix(".jsp");
		return viewResolver;
	}

	@Bean
	public MessageSource messageSource() {

		ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
		messageSource.setBasenames("classpath:messages/messages", "classpath:messages/validation");
		// if true, the key of the message will be displayed if the key is not
		// found, instead of throwing a NoSuchMessageException
		messageSource.setUseCodeAsDefaultMessage(true);
		messageSource.setDefaultEncoding("UTF-8");
		// # -1 : never reload, 0 always reload
		messageSource.setCacheSeconds(0);
		return messageSource;
	}
}

```

The **localeInterceptor** will provide a way to switch the language in any page just by passing the lang='en', lang='fr', and so on to your url.
The **localeResolver** will work with a simple cookie to memorize the user preference (you don't want to pass the lang argument through your whole site, do you?).

With the messageSource, you will get access to properties bundle usable in your web pages. Here it is configured to be developper friendly (always reload, no error).

These bundled can be localized. You can have as many as you want :

  * **messages_en.properties** for english language text
  * **message_fr.properties** for french
  * **message_cn.properties**, etc.


## A form, a DTO, some validation


Next we will show a very simple usage of a form to demonstrate the localized, custom validation messages.

In your home.jsp, write this code :

```html
<form:form id="form" method="post" modelAttribute="formDTO">

	<form:input path="messageFromUser" />

	<form:errors path="messageFromUser" cssClass="errorMessage" element="div" />

	<c:if test="${not empty message}">
		<div id="message" class="alert alert-success">
			<spring:message code="message.youWrote" arguments="${message}" htmlEscape="true" />
		</div>
	</c:if>

	<button type="submit" class="btn">Submit</button>

</form:form>
```

This will bind your form to a model attribute called **formDTO**, we will see it in the controller shortly. You could also provide an action attribute but we will just map the action to **"/"**, just like our jsp.

Then the input will be bound to the **messageFromUser** attribute of the **formDTO**. You can also see the associated error message if validation fails.

Lastly, if a success message is present in the request (the controller will place it), we will display it with a localized text taking an argument. We also want to escape the text given by the user to prevent XSS injection.

The message bundle for this example would look like this :

```properties
message.youWrote=You wrote : {0}
```

Our new controller :

```java
@Controller
public class HomeController {

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String displayHome(Model model) {
		return "/home";
	}

	@ModelAttribute("formDTO")
	public FormDTO createFormBean() {
		return new FormDTO();
	}

	@RequestMapping(value = "/", method=RequestMethod.POST)
	public String submitMessage(@Valid FormDTO formDTO, BindingResult result,
					SessionStatus sessionStatus,
					RedirectAttributes redirectAttrs) {

		if (result.hasErrors()) {
			return "/home";
		}
		String message = formDTO.toString();
		sessionStatus.setComplete();
		redirectAttrs.addFlashAttribute("message", message);

		return "redirect:/";
	}
}
```

You can see we expose our **FormDTO** to the Model.
Then we process this action of posting on "/". With spring MVC request mapping you can inject whatever is relevant to the context of your page.
Here we will ask Spring MVC to give us the form posted with indication on its correctness as far as validation rules are concerned (we will see that below).

We also want some other small things : access to redirect attributes to display a single time (flash) message, access to the session to dispose our form, etc.

If the user input is correct, we will redirect him (yes with spring MVC you have some [PRG](http://en.wikipedia.org/wiki/Post/Redirect/Get) for free) to the home. You can also use the instruction 'forward:url'.

I strongly advise you to check out [the documentation](http://static.springsource.org/spring/docs/3.2.x/spring-framework-reference/html/mvc.html) to learn what can be injected in your controllers.

Our **FormDTO** is a simple POJO, annotated with [hibernate-validator](http://static.springsource.org/spring/docs/3.2.x/spring-framework-reference/html/mvc.html) annotation :

```java

public class FormDTO {

	@NotEmpty
	private String messageFromUser;

	// Getters and setters omitted
}

```

Hibernate validator provides a lot of useful annotations like @Min, @Max, @Email. You can even stack them or create your own rules.

That's it ! To customize validation message, just write properties with the same name as the annotations :

```properties
# This will override validation messages caused by @NotEmpty annotation
NotEmpty=This cannot be empty !
# This will override @NotEmpty validation messages with a path of messageFromUser
NotEmpty.messageFromUser=Don't you have anything to say?
```


## Wait ! How do we test a controller?


With spring mvc test ! Have a look :

```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = WebConfig.class)
public class HomeControllerTest {

	@Autowired
	private WebApplicationContext wac;

	private MockMvc mockMvc;

	@Before
	public void setup() {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac).build();
	}

	@Test
	public void getHome() throws Exception {
		this.mockMvc.perform(get("/"))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(forwardedUrl("/WEB-INF/views/home.jsp"));
	}

	@Test
	public void postEmptyData() throws Exception {
		this.mockMvc.perform(post("/"))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(model().attributeHasFieldErrors("formDTO", "messageFromUser"))
			.andExpect(forwardedUrl("/WEB-INF/views/home.jsp"));
	}

	@Test
	public void postSomething() throws Exception {

		this.mockMvc.perform(post("/").param("messageFromUser", "hello"))
			.andDo(print())
			.andExpect(status().isMovedTemporarily()) // 302 redirect
			.andExpect(model().hasNoErrors())
			.andExpect(flash().attributeExists("message"))
			.andExpect(redirectedUrl("/"));
	}
}
```

I think the code is pretty understandable as it uses a syntax which is very close to natural language.
But it is quite difficult to get it right the first time. You definitely have to check out [the documentation](http://static.springsource.org/spring/docs/3.2.x/spring-framework-reference/htmlsingle/#unit-testing-spring-mvc).


## Tomcat and jetty


To add them to your pom.xml, check out my [previous article](http://geowarin.wordpress.com/2013/01/22/basic-configuration-for-jetty-and-tomcat-maven-plugins/) or download the [github project](https://github.com/geowarin/spring-mvc-examples/tree/master/mvc-base) of this article which also provides a very handsome SiteMesh template featuring twitter bootstrap and responsive design.



## Conclusion



Since version 3.2, Spring MVC is now very easy to configure and use. Spring mvc test, now integrated in the framework, is a really unique feature in terms of controller unit testing and is really worth a try.

Its action based request mapping 'a la rest' makes it both versatile, easy to integrate with ajax solutions and a very good replacement for the [old-timer](http://struts.apache.org/).

It also provides easy XML, RSS, plain text or JSON publishing and can almost be used as a replacement for a rest framework !

Of course, be sure to check the [spring-mvc-showcase](https://github.com/SpringSource/spring-mvc-showcase), a real goldmine.
