---
categories:
- JPA
- java
date: 2013-01-21T15:25:11Z
description: Demonstration of how to set up spring data JPA in java SE and test with dbUnit
redirect_from: /2013/01/21/using-spring-data-jpa-in-a-java-se-environment-and-run-tests-with-dbunit/
tags:
- hibernate
- java SE
- spring
- spring-data
- spring-java-config
- spring-test
title: Using Spring Data JPA in a Java SE environment and run tests with dbUnit
aliases:
    - /using-spring-data-jpa-in-a-java-se-environment-and-run-tests-with-dbunit.html
---

This blog post follows my previous articles on using [hibernate as a standalone JPA provider](http://geowarin.wordpress.com/2013/01/20/using-hibernate-as-a-jpa-provider-in-a-java-se-environment-and-run-tests-with-dbunit/) and how to use [spring in a Java SE](http://geowarin.wordpress.com/2013/01/20/using-spring-in-a-java-se-environment-and-implementing-the-chain-of-responsibility-pattern/) environment.

In this post, I will show you how to use [Spring Data JPA](http://geowarin.wordpress.com/2013/01/21/using-spring-data-jpa-in-a-java-se-environment-and-run-tests-with-dbunit/), a great project which improves your productivity by generating all CRUD operations for you. Then we will use [springtestdbunit](http://springtestdbunit.github.com/spring-test-dbunit/) to run some very clean tests on our database with spring and [dbUnit](http://www.dbunit.org/).

The code source of this example is available on github : [https://github.com/geowarin/hibernate-examples/tree/master/standalone-data-jpa](https://github.com/geowarin/hibernate-examples/tree/master/standalone-data-jpa)


## What is Spring Data JPA?


Are you tired of always implementing the findOne(long id), findAll(), save()... methods on your repositories? Having to come up with clever tricks to generate a generic DAO?

Then give Spring Data JPA a try ! This project lets you implement a very simple interface for your repositories and takes care of all the rest, allowing you to focus on your real queries.


## The configuration


The configuration we will set up here is pretty similar to the one we used in the [spring standalone article.](http://geowarin.wordpress.com/2013/01/20/using-spring-in-a-java-se-environment-and-implementing-the-chain-of-responsibility-pattern/) We will just add a bunch of classes to make use of spring data jpa :

```java
@Configuration
@EnableJpaRepositories("com.geowarin.standalonedatajpa.repository")
@EnableTransactionManagement
public class StandaloneDataJpaConfig {

	@Bean
	public DataSource dataSource() {
		return new EmbeddedDatabaseBuilder().setType(EmbeddedDatabaseType.HSQL)
				.addScript("classpath:sql/schema.sql")
				.addScript("classpath:sql/import-users.sql")
				.build();
	}

	@Bean
	public PlatformTransactionManager transactionManager() {

		JpaTransactionManager txManager = new JpaTransactionManager();
		txManager.setEntityManagerFactory(entityManagerFactory());
		return txManager;
	}

	@Bean
	public HibernateExceptionTranslator hibernateExceptionTranslator() {
		return new HibernateExceptionTranslator();
	}

	@Bean
	public EntityManagerFactory entityManagerFactory() {

		// will set the provider to 'org.hibernate.ejb.HibernatePersistence'
		HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
		// will set hibernate.show_sql to 'true'
		vendorAdapter.setShowSql(true);
		// if set to true, will set hibernate.hbm2ddl.auto to 'update'
		vendorAdapter.setGenerateDdl(false);

		LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
		factory.setJpaVendorAdapter(vendorAdapter);
		factory.setPackagesToScan("com.geowarin.standalonedatajpa.model");
		factory.setDataSource(dataSource());

		// This will trigger the creation of the entity manager factory
		factory.afterPropertiesSet();

		return factory.getObject();
	}

	@Bean
	public MainBean mainBean() {
		return new MainBean();
	}
}
```

With this configuration, you won't even need a _persistence.xml_ file ! Compared to our [previous example](http://geowarin.wordpress.com/2013/01/20/using-hibernate-as-a-jpa-provider-in-a-java-se-environment-and-run-tests-with-dbunit/) however, one cannot make use of _hibernate.hbm2ddl.import_files_ property to import SQL scripts with hibernate because _hibernate.hbm2ddl.auto_ must be set to either _create_ or _create-drop_.

That's ok we will generate some very tiny scripts to set up the schema and the data in our database (and make our DBA happy, a thing that is never to be disregarded :))



* * *



**Hint** : If this is a real blocker for you, you could setGenrateDdl to false and maintain a simple **hibernate.properties** file like this one

```properties
hibernate.hbm2ddl.auto=create
hibernate.hbm2ddl.import_files=sql/import-users.sql
hibernate.format_sql=true
```

That's because hibernate will always look for a [hibernate.properties](http://docs.jboss.org/hibernate/core/4.1/manual/en-US/html/ch03.html#configuration-optional-properties) file in the classpath to override you persistence properties.



* * *



Note the use of **@EnableJpaRepositories** that will tell spring data in which packages our repositories can be found.

**@EnableTransactionManagement** is a replacement of the tag `<tx:annotation-driven />`.

We can set up the [LocalContainerEntityManagerFactoryBean ](http://static.springsource.org/spring-framework/docs/3.2.0.RC1/api/org/springframework/orm/jpa/LocalContainerEntityManagerFactoryBean.html)to use a package to scan our entities for us, no need to list them all.

The rest is pretty straight forward I believe.

Note that by default, spring data JPA will try to locate your _persistence.xml_ so the two approaches are completely compatible, for this example however we will go for a full xml-less configuration.


## One entity, one interface and we are ready


We have one very simple entity :

```java
@Table(name = "users")
@Entity
public class User implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private long id;

	@Column(name = "name", nullable = false, unique=true, length=50)
	private String name;

	// getters and setters omitted
}
```

Now let's use spring data to generate a repository for us :

```java
public interface UserRepository  extends JpaRepository<User, Long> {
}
```

Tadaa! Is that it? Yes, you can now use your repository in our **MainBean** :

```java
public class MainBean {

	@Autowired
	private UserRepository userRepository;

	private static Logger log = LoggerFactory.getLogger(MainBean.class);

	public void start() {

		// Spring Data JPA CRUD operations are transactionnal by default !
		// http://static.springsource.org/spring-data/data-jpa/docs/current/reference/html/#transactions
		User newUser = new User();
		newUser.setName("inserted");
		userRepository.save(newUser);

		List all = userRepository.findAll();
		log.info("users=" + all);
	}
}
```

Pretty sweet. But that's not all. You now have three different ways of writing new queries with Spring data :




  1. Use [named queries](https://blogs.oracle.com/JPQL01/entry/named_query_in_java_persistence)


  2. [Use the @Query annotation](http://static.springsource.org/spring-data/data-jpa/docs/current/reference/html/#jpa.query-methods.at-query) to write your own JPQL queries


  3. Use the awesome [query creation by method name](http://static.springsource.org/spring-data/data-jpa/docs/current/reference/html/#jpa.query-methods.query-creation)


Let's review the last two options (I don't really like named queries but have a look a the [documentation](http://static.springsource.org/spring-data/jpa/docs/1.2.0.RELEASE/reference/html/#jpa.query-methods.named-queries) if you want)

```java
public interface UserRepository  extends JpaRepository<User, Long> {

	// Demonstrate query creation by method name
	// http://static.springsource.org/spring-data/data-jpa/docs/current/reference/html/#jpa.query-methods.query-creation
	User findByName(String name);

	// Demonstrate the use of a simple JPQL query
	@Query("from User u where upper(u.name) = upper(:name)")
	User findByNameIgnoreCase(@Param("name") String name);
}
```


## Ok let's test it


Have a look at the unit test for our repository :

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { StandaloneDataJpaConfig.class })
@TestExecutionListeners({ DependencyInjectionTestExecutionListener.class,
	DbUnitTestExecutionListener.class })
public class UserRepositoryTest {

	@Autowired
	private UserRepository userRepository;

	@Test
	@DatabaseSetup("userAdminData.xml")
	public void testFindAdmin() {

		User admin = userRepository.findOne(1L);
		Assert.assertNotNull(admin);
		Assert.assertEquals("admin", admin.getName());
	}

	@Test
	@DatabaseSetup("userAdminData.xml")
	public void testFindByName() {

		User admin = userRepository.findByName("admin");
		Assert.assertNotNull(admin);
		Assert.assertEquals("admin", admin.getName());
	}

	@Test
	@DatabaseSetup("userAdminData.xml")
	public void testFindByNameIgnoreCase() {

		User admin = userRepository.findByNameIgnoreCase("AdMIn");
		Assert.assertNotNull(admin);
		Assert.assertEquals("admin", admin.getName());
	}

	@Test
	@DatabaseSetup("userAdminData.xml")
	@ExpectedDatabase("afterInsert.xml")
	public void testInsertUser() {

		User newUser = new User();
		newUser.setName("inserted");
		userRepository.save(newUser);
	}

}
```

We use springtestdbunit to be able to use annotations to set up and verify the database state after each test. Here are our two datasets.

userAdminData.xml :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataset>
	<users id="1" name="admin" />
</dataset>
```

afterInsert.xml :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataset>
	<users id="1" name="admin" />
	<users id="2" name="inserted" />
</dataset>
```

Using the **@ExpectedDatabase** annotation is really awesome, dbUnit will generate very informative messages if your test failed.


## Conclusion


Spring Data JPA is really a good piece of software. We did not go into too much details but know that it will handle pagination, type-safe queries, is compatible with [query-dsl](http://www.querydsl.com/) and much more.
It is suitable for a Java SE environment which can come in handy if we want to run some quick tests on our database.

Finally, springtestdbunit is a very nice-to-have feature which will make your repository unit tests a real breeze to write.

Lastly, I will point out that making use of the [transational behaviour of spring data](http://static.springsource.org/spring-data/data-jpa/docs/current/reference/html/#transactions) CRUD operation is not really a good practice but we did it all the same for the sake of simplicity.
A better approach would be to use **@Service** spring beans to encapsulate one or several operations.
