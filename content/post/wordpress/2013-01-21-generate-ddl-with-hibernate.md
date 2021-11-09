---
categories:
- hibernate
- java
date: 2013-01-21T23:44:07Z
description: How to generate SQL schemas with hibernate built-in classes
redirect_from: /2013/01/21/generate-ddl-with-hibernate/
tags:
- DDL
- hibernate
title: Generate DDL with hibernate
aliases:
    - /generate-ddl-with-hibernate.html
---

I don't know if it's a well known feature but there is a bunch of methods on hibernate [Configuration](http://docs.jboss.org/hibernate/orm/3.5/api/org/hibernate/cfg/Configuration.html) class which will produce [DDL](http://en.wikipedia.org/wiki/Data_definition_language) for your database according to the dialect in use.

In this blog post we will see how to use those methods to generate a DDL script to set up our database and get rid of those annoying DBAs (just kidding, always review these scripts, they're not production ready).

The source code of this article is available on github : https://github.com/geowarin/hibernate-examples/tree/master/generate-ddl-hibernate

So the goal of this article is, given a dialect and a package to scan containing our entities, generate a DDL.

With hibernate in the classpath, you can create a new configuration like this :

```java
hibernateConfiguration = new Configuration();

hibernateConfiguration.addAnnotatedClass(myEntity.class);
hibernateConfiguration.addAnnotatedClass(mySecondEntity.class);

hibernateConfiguration.setProperty(AvailableSettings.DIALECT, dialect);
```

That's cool but pretty boring.
Cooler is to use the [reflections project](http://code.google.com/p/reflections/) to provide some package scanning.


```java
private Configuration createHibernateConfig() {

	hibernateConfiguration = new Configuration();

	final Reflections reflections = new Reflections(entityPackage);
	for (Class<?> cl : reflections.getTypesAnnotatedWith(MappedSuperclass.class)) {
		hibernateConfiguration.addAnnotatedClass(cl);
	}
	for (Class<?> cl : reflections.getTypesAnnotatedWith(Entity.class)) {
		hibernateConfiguration.addAnnotatedClass(cl);
	}
	hibernateConfiguration.setProperty(AvailableSettings.DIALECT, dialect);
	return hibernateConfiguration;
}
```

Then you can get your creation scripts lines like that :

```java
String[] createSQL = hibernateConfiguration.generateSchemaCreationScript(hibDialect);
String[] dropSQL = hibernateConfiguration.generateDropSchemaScript(hibDialect);
```

For the create script, each line will contain either a database creation or a constraint.

So here is the final result :

```java
/**
 * This class will create an hibernate {@link Configuration} with the given dialect and will scan provided
 * package for {@link MappedSuperclass} and {@link Entity}.
 * You can then use the export methods to generate your schema DDL.
 *
 * @author Geoffroy Warin (https://github.com/geowarin)
 *
 */
public class HibernateExporter {

	private static Logger log = LoggerFactory.getLogger(HibernateExporter.class);

	private String dialect;
	private String entityPackage;

	private boolean generateCreateQueries = true;
	private boolean generateDropQueries = false;

	private Configuration hibernateConfiguration;

	public HibernateExporter(String dialect, String entityPackage) {
		this.dialect = dialect;
		this.entityPackage = entityPackage;

		hibernateConfiguration = createHibernateConfig();
	}

	public void export(OutputStream out, boolean generateCreateQueries, boolean generateDropQueries) {

		Dialect hibDialect = Dialect.getDialect(hibernateConfiguration.getProperties());
		try (PrintWriter writer = new PrintWriter(out)) {

			if (generateCreateQueries) {
				String[] createSQL = hibernateConfiguration.generateSchemaCreationScript(hibDialect);
				write(writer, createSQL, FormatStyle.DDL.getFormatter());
			}
			if (generateDropQueries) {
				String[] dropSQL = hibernateConfiguration.generateDropSchemaScript(hibDialect);
				write(writer, dropSQL, FormatStyle.DDL.getFormatter());
			}
		}
	}

	public void export(File exportFile) throws FileNotFoundException {

		export(new FileOutputStream(exportFile), generateCreateQueries, generateDropQueries);
	}

	public void exportToConsole() {

		export(System.out, generateCreateQueries, generateDropQueries);
	}

	private void write(PrintWriter writer, String[] lines, Formatter formatter) {

		for (String string : lines)
			writer.println(formatter.format(string) + ";");
	}

	private Configuration createHibernateConfig() {

		hibernateConfiguration = new Configuration();

		final Reflections reflections = new Reflections(entityPackage);
		for (Class<?> cl : reflections.getTypesAnnotatedWith(MappedSuperclass.class)) {
			hibernateConfiguration.addAnnotatedClass(cl);
			log.info("Mapped = " + cl.getName());
		}
		for (Class<?> cl : reflections.getTypesAnnotatedWith(Entity.class)) {
			hibernateConfiguration.addAnnotatedClass(cl);
			log.info("Mapped = " + cl.getName());
		}
		hibernateConfiguration.setProperty(AvailableSettings.DIALECT, dialect);
		return hibernateConfiguration;
	}

	public boolean isGenerateDropQueries() {
		return generateDropQueries;
	}

	public void setGenerateDropQueries(boolean generateDropQueries) {
		this.generateDropQueries = generateDropQueries;
	}

	public Configuration getHibernateConfiguration() {
		return hibernateConfiguration;
	}

	public void setHibernateConfiguration(Configuration hibernateConfiguration) {
		this.hibernateConfiguration = hibernateConfiguration;
	}
}
```

And its usage :

```java
public static void main(String[] args) {

//		HibernateExporter exporter = new HibernateExporter("org.hibernate.dialect.HSQLDialect", "com.geowarin.model");
	HibernateExporter exporter = new HibernateExporter("org.hibernate.dialect.MySQL5Dialect", "com.geowarin.model");
	exporter.exportToConsole();
}
```

This will produce this kind of output :

```sql
 create table groups (
        id bigint not null auto_increment,
        createdOn datetime,
        modifiedOn datetime,
        version bigint not null,
        name varchar(50) not null,
        user_id bigint,
        primary key (id)
    );

create table users (
        id bigint not null auto_increment,
        createdOn datetime,
        modifiedOn datetime,
        version bigint not null,
        email varchar(255) not null,
        password varchar(80) not null,
        user_name varchar(50) not null unique,
        primary key (id)
    );

    alter table groups
        add index FKB63DD9D4CA46C100 (user_id),
        add constraint FKB63DD9D4CA46C100
        foreign key (user_id)
        references users (id);
```

As I said, it is not suitable for your production environment but it provides some starter DDL if you are the code first kind (and don't want to use hibernate-tools).
