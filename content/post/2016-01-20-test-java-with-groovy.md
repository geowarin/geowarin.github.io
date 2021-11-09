---
categories:
- testing
- groovy
date: 2016-01-20T00:00:00Z
description: You can write better tests for your Java application with Spock, Groovy and
  very little configuration
tags:
- testing
- groovy
- featured
title: Test your Java application with Groovy
aliases:
    - /test-java-with-groovy.html
---

I think Groovy is a wonderful language.
However, I would not advise a complete rewrite of your project in Groovy!

We can however use Groovy to test our Java code.

I'm actually a big fan of this approach.
I've been using it to test legacy applications written in Java.

I still couldn't use lambdas or fancy Java 8 features but all of a sudden,
my test code was more expressive.
I could take advantage closures, power asserts, the Spock DSL and Groovy simple syntax.
The best part: every library I used was a test dependency and never impacted
the actual code.

In this article I will show you how to add Groovy tests to
an existing Java application built either with Maven or Gradle.

The code source of a demo application using Maven and Spock is [available on github](https://github.com/geowarin/groovy-tests).

## Why groovy?

Groovy is a dynamic language with optional typing. It means that you can
have the guarantees of a type system when it matters and the versatility of
duck typing when you know what your are doing.

Groovy removes all the verbosity from the Java syntax.
Some small examples:

```groovy
// map literals
Map<String, String> things = ['hello': 'world']

// Write to a file
new File("hello.txt") << 'Hello world!'

// Add some numbers
BigInteger a = 18
BigDecimal b = 24
int sum = a + b
println "$sum ${sum.class}" // 42 class java.lang.Integer

// List literals
List<Number> numbers = [-2, 12, 6, 3]
// Closures
def result = numbers
        .findAll { it > 0 } // filter
        .collect { it * 2 } // map
        .sum() // reduce

// template strings
println "This answer to life, universe and everything: ${result}"
```

If you want a good introduction to groovy check out the [groovy style guide](http://www.groovy-lang.org/style-guide.html).

You can also watch the amazing [Groovy for Java developers](http://www.infoq.com/presentations/groovy-for-java) presentation by Peter Ledbrook.

Another thing. Groovy let you access private class members.
Although this completely violates encapsulation, you will get away
with just a warning.

It is nice to have this kind of ability when you add tests to a legacy application before
refactoring it.

## Why Spock?

Spock is a wonderful test framework.

It combines the best features of other frameworks like JUnit, jMock, and RSpec
and let you write specifications with a nice [BDD](https://fr.wikipedia.org/wiki/Behavior_driven_development) DSL.

It is fully compatible with JUnit so you can use all the stuff you like (rules for instance)
and much more!

It will also completely remove the need for a mocking framework like Mockito.

If you want to learn more about Spock read: [why spock](https://code.google.com/p/spock/wiki/WhySpock) and [spock primer](http://spockframework.github.io/spock/docs/1.0/spock_primer.html).

I also found the [next level spock repo](https://github.com/spockframework/next-level-spock)
interesting to look at.

## How?

You are now ready to add Spock to your tool-belt. But how?

### With Maven

Add dependencies to Groovy and Spock:

```xml
<dependencies>
    <dependency>
        <groupId>org.codehaus.groovy</groupId>
        <artifactId>groovy-all</artifactId>
        <version>2.4.4</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.spockframework</groupId>
        <artifactId>spock-core</artifactId>
        <version>1.0-groovy-2.4</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

Now, you need to tell maven to compile the code contained in `src/test/groovy`.
We will use the [gmavenplus](https://github.com/groovy/GMavenPlus) plugin for that.

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.codehaus.gmavenplus</groupId>
            <artifactId>gmavenplus-plugin</artifactId>
            <version>1.0</version>
            <executions>
                <execution>
                    <goals>
                        <goal>generateStubs</goal>
                        <goal>compile</goal>
                        <goal>testGenerateStubs</goal>
                        <goal>testCompile</goal>
                    </goals>
                </execution>
            </executions>
            <dependencies>
                <dependency>
                    <groupId>org.codehaus.groovy</groupId>
                    <artifactId>groovy-all</artifactId>
                    <version>2.4.4</version>
                    <scope>runtime</scope>
                </dependency>
            </dependencies>
        </plugin>
        <!-- Optional -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>2.16</version>
            <configuration>
                <parallel>methods</parallel>
                <threadCount>5</threadCount>
                <includes>
                    <include>**/*Test.*</include>
                    <include>**/*Spec.*</include>
                </includes>
                <excludes>
                    <exclude>**/Abstract*.java</exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
```


By convention, Spock tests are called specifications and spec files end with
`*Spec.groovy`.
This is optional but we can enable that behavior by overriding the surefire default
configuration.

### With gradle

Just apply the groovy plugin, included by default in Gradle.

```groovy
apply plugin: 'groovy'
```

Since the plugin extends the Java convention, it will automatically compile the
Java code contained in `src/main/java` and `src/test/java` as well as the
Groovy code contained in `src/main/groovy` and `src/test/groovy`.

## Your first Spock specification

Place this little specification in `src/test/groovy`:

```groovy
import spock.lang.Specification
import spock.lang.Unroll

class MySpec extends Specification {

    @Unroll
    def "max(#a,#b) == #c"() {
        expect:
        // This class is in our Java code
        MyClass.max(a, b) == c

        where:
        a  | b   | c
        1  | 2   | 2
        42 | -12 | 42
        42 | -12 | -42
    }
}
```

Here is what it looks like in IntelliJ:

![Spock test results](/assets/images/articles/2016-01-spock.png "Spock results")

You can also verify that it works with maven by typing:

```
mvn test
```

You would get this result:

```
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running MySpec
Tests run: 3, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.146 sec <<< FAILURE! - in MySpec
max(42,-12) == -42(MySpec)  Time elapsed: 0.105 sec  <<< FAILURE!
org.spockframework.runtime.SpockComparisonFailure: Condition not satisfied:

Math.max(a, b) == c
     |   |  |  |  |
     42  42 -12|  -42
               false

        at MySpec.max(#a,#b) == #c(MySpec.groovy:9)


Results :

Failed tests:
  MySpec.max(#a,#b) == #c:9 Condition not satisfied:

Math.max(a, b) == c
     |   |  |  |  |
     42  42 -12|  -42
               false


Tests run: 3, Failures: 1, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 1.887 s
[INFO] Finished at: 2016-01-20T15:52:40+01:00
[INFO] Final Memory: 11M/309M
[INFO] ------------------------------------------------------------------------
```

## IDE integration

Install the [gmavnen intelliJ plugin](https://github.com/mycila/gmavenplus-intellij-plugin)
and the [spock plugin](https://plugins.jetbrains.com/plugin/7114) for a better integration with your IDE.

## Conclusion

Even if your whole codebase is in Java, your fellow developers will thank you
for bringing a breath of fresh air to your project with Groovy tests.

The configuration to get this working is very simple. You have no excuse
for not giving it a try!

As always, checkout the [github repo](https://github.com/geowarin/groovy-tests) and tell me your thoughts.
