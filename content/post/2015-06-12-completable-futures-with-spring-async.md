---
categories:
- spring
date: 2015-06-12T00:00:00Z
description: Use Java 8 new CompletableFuture with Spring async
redirect_from: spring/2015/06/12/completable-futures-with-spring-async.html
tags:
- spring
- futures
- async
- featured
title: Completable futures with Spring async
aliases:
    - /completable-futures-with-spring-async.html
---

Since version 8, java has a way better abstraction than `java.util.Future`
called `CompletableFuture`.
This new API along with the lambdas enables new ways of reasoning with futures
by composing, listening and joining them.

Futures are traditionally created by submitting tasks to an `Executor`.
Spring allows declaring one or multiple executors and will submit any method
annotated with `@Async` as tasks for those executors.

The big problem is that executors still return `Future`s and not `CompletableFuture`s.

We are going to create our own Executor to solve this problem.
Then we will study a solution to handle timeouts with those futures and
as a bonus, do a little bit of AOP to debug our threads.

You can see the resulting application [on my gihtub](https://github.com/geowarin/spring-completable).

## Creating an Executor for CompletableFutures

If you try to return a `CompletableFuture` from an Async method in Spring,
you will get the following error:

```
Caused by: java.lang.ClassCastException: java.util.concurrent.FutureTask cannot be cast to java.util.concurrent.CompletableFuture
```

The idea is to use delegation to decorate an existing instance of `ExecutorService`.
We will implement the `ExecutorService` and use type covariance to return
`CompletableFuture`s instead of `Future`.

The following code has been greatly inspired by this [blog post](http://binkley.blogspot.fr/2014/12/completablefuture-and-executorservice.html). Many thanks to Brian Oxley!

So the first thing we need to do is to create a decorator for an executor service
and delegate every method to that service:

```java
static class DelegatingExecutorService implements ExecutorService {
    protected ExecutorService delegate;

    public DelegatingExecutorService(ExecutorService executorService) {
        this.delegate = executorService;
    }

    @Override public <T> Future<T> submit(Callable<T> task) {
        return delegate.submit(task);
    }

    @Override public <T> Future<T> submit(Runnable task, T result) {
        return delegate.submit(task, result);
    }

    // Override and delegate everything
}
```

We can create an interface that will extends `ExecutorService` and return
`CompletableFuture`s instead of `Future`s:

```java
/**
 * DelegatingCompletableExecutorService {@code ExecutorService} to covariantly return {@code
 * CompletableFuture} in place of {@code Future}.
 */
public interface CompletableExecutorService extends ExecutorService {
    /**
     * @return a completable future representing pending completion of the
     * task, never missing
     */
    @Override <T> CompletableFuture<T> submit(Callable<T> task);

    /**
     * @return a completable future representing pending completion of the
     * task, never missing
     */
    @Override <T> CompletableFuture<T> submit(Runnable task, T result);

    /**
     * @return a completable future representing pending completion of the
     * task, never missing
     */
    @Override CompletableFuture<?> submit(Runnable task);
}
```

We can then implement this new interface using our decorator as a base:

```java
static class DelegatingCompletableExecutorService
    extends DelegatingExecutorService
    implements CompletableExecutorService {

     DelegatingCompletableExecutorService(ExecutorService threads) {
         super(threads);
     }

     @Override public <T> CompletableFuture<T> submit(Callable<T> task) {
         final CompletableFuture<T> cf = new CompletableFuture<>();
         delegate.submit(() -> {
             try {
                 cf.complete(task.call());
             } catch (CancellationException e) {
                 cf.cancel(true);
             } catch (Exception e) {
                 cf.completeExceptionally(e);
             }
         });
         return cf;
     }

     @Override public <T> CompletableFuture<T> submit(Runnable task, T result) {
         return submit(callable(task, result));
     }

     @Override public CompletableFuture<?> submit(Runnable task) {
         return submit(callable(task));
     }
}
```

We also need to create an utility method to create a `CompletableExecutorService`:

```java
public static CompletableExecutorService completable(ExecutorService delegate) {
    return new DelegatingCompletableExecutorService(delegate);
}
```

See [this gist](https://gist.github.com/geowarin/bc40acd46791aa114c30) for the final result.

## Creating an async service

To enable asynchronous methods in Spring, you will need this kind of configuration
class:

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig implements AsyncConfigurer {
    protected final Log logger = LogFactory.getLog(getClass());

    @Override
    public Executor getAsyncExecutor() {
        ThreadFactory threadFactory = new ThreadFactoryBuilder().setNameFormat("async-%d").build();
        return CompletableExecutors.completable(Executors.newFixedThreadPool(10, threadFactory));
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> logger.error("Uncaught async error", ex);
    }
}
```

As you can see, we can specify which executor will handle our `@Async` methods.

We can now return `CompletableFuture`s from our services!

```java
@Service
public class AsyncService {

    private static String[] greetings = new String[]{
            "hallo", "hallo", "hej", "hej", "bonjour", "hola",
            "ciao", "shalom", "fáilte", "kaixo", "konnichiwa",
            "saluton", "päivää", "selamat pagi", "gut de", "olá"
    };

    @Async
    public CompletableFuture<String> asyncGreeting() {
        AsyncUtil.randomSleep(3000, TimeUnit.MILLISECONDS);
        String result = AsyncUtil.getThreadName() + " - " + random(greetings);
        return CompletableFuture.completedFuture(result);
    }

    @SafeVarargs public final <T> T random(T... elements) {
        LinkedList<T> greetings = new LinkedList<>(Arrays.asList(elements));
        Collections.shuffle(greetings, ThreadLocalRandom.current());
        return greetings.getFirst();
    }
}
```

Here is the `AsyncUtil` class in case you are wondering what's going on:

```java
public class AsyncUtil {
    public static void randomSleep(int duration, TimeUnit timeUnit) {
        try {
            timeUnit.sleep(ThreadLocalRandom.current().nextInt(duration));
        } catch (InterruptedException e) {
            Throwables.propagate(e);
        }
    }

    public static String getThreadName() {
        return Thread.currentThread().getName();
    }
}
```

Our service will say hello in a random language within 3 seconds of time.
How do we handle the result?

```java
public class Runner implements CommandLineRunner {

    @Autowired
    private AsyncService asyncService;

    @Override public void run(String... args) throws Exception {

        IntStream.rangeClosed(1, 10)
                .mapToObj(__ -> asyncService.asyncGreeting().exceptionally(Throwable::getMessage))
                .forEach(this::printResult);
    }

    private void printResult(CompletableFuture<String> future) {
        future.thenRun(() -> System.out.println(future.join()));
    }
}
```

My what a beauty! In the above class, we create a stream of ten elements
to call our async service ten times, make sure that we handle exceptions and
print each result on the console.

Please, notice that **nothing is blocking** in the above code.
The `join()` method will wait for a result but since we are calling it in a
callback after completion, we get a fully asynchronous code.

This code will produce the following output, printing each lines at different
timings:

```
async-7 - gut de
async-5 - konnichiwa
async-4 - hallo
async-2 - hallo
async-6 - saluton
async-1 - fáilte
async-9 - päivää
async-0 - hej
async-8 - hallo
async-3 - saluton
```

## Handling timeouts

An interesting question with future is how to set a timeout and cancel them
if they run late.

My solution is to create another executor like this:

```java
static class TimeOutExecutorService extends CompletableExecutors.DelegatingCompletableExecutorService {
    private final Duration timeout;
    private final ScheduledExecutorService schedulerExecutor;

    TimeOutExecutorService(ExecutorService delegate, Duration timeout) {
        super(delegate);
        this.timeout = timeout;
        schedulerExecutor = Executors.newScheduledThreadPool(1);
    }

    @Override public <T> CompletableFuture<T> submit(Callable<T> task) {
        CompletableFuture<T> cf = new CompletableFuture<>();
        Future<?> future = delegate.submit(() -> {
            try {
                cf.complete(task.call());
            } catch (CancellationException e) {
                cf.cancel(true);
            } catch (Throwable ex) {
                cf.completeExceptionally(ex);
            }
        });

        schedulerExecutor.schedule(() -> {
            if (!cf.isDone()) {
                cf.completeExceptionally(new TimeoutException("Timeout after " + timeout));
                future.cancel(true);
            }
        }, timeout.toMillis(), TimeUnit.MILLISECONDS);
        return cf;
    }
}
```

This implementation was inspired by [a discussion](http://stackoverflow.com/questions/23575067/timeout-with-default-value-in-java-8-completablefuture/24457111#24457111) on stackoverflow.

We can now create a new executor as a Spring bean:

```java
@Bean(name = "timed")
public Executor timeoutExecutor() {
    ThreadFactory threadFactory = new ThreadFactoryBuilder().setNameFormat("timed-%d").build();
    return TimedCompletables.timed(Executors.newFixedThreadPool(10, threadFactory), Duration.ofSeconds(2));
}
```

An use it like this:

```java
@Async("timed")
public CompletableFuture<String> asyncTimeoutGreeting() {
    AsyncUtil.randomSleep(3000, TimeUnit.MILLISECONDS);
    String result = AsyncUtil.getThreadName() + " - " + random(greetings);
    return CompletableFuture.completedFuture(result);
}
```

Now if we run the application again, about one third of the tasks will time out:

```
timed-4 - saluton
timed-3 - hallo
timed-7 - saluton
timed-8 - fáilte
timed-1 - saluton
timed-5 - hallo
Timeout after PT2S
Timeout after PT2S
Timeout after PT2S
Timeout after PT2S
```

## Profiling threads with AOP

Let's add a dependency to `spring-boot-starter-aop` to automatically profile the
execution of our async methods:

 ```java
@Aspect
@Component
public class ServiceProfiler {

    @Pointcut("execution(java.util.concurrent.CompletableFuture completable.service.*.*(..))")
    public void serviceMethods() {
    }

    @Around("serviceMethods()")
    public Object profile(ProceedingJoinPoint pjp) throws Throwable {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        Object output = pjp.proceed();
        stopWatch.stop();
        if (output instanceof CompletableFuture) {
            CompletableFuture future = (CompletableFuture) output;
            String debug = String.format("(%d ms)", stopWatch.getTotalTimeMillis());
            future.thenAccept(o -> System.out.println(o + " - " + debug));
        }
        return output;
    }
}
 ```

This is a bit unnecessary but I used one of the callbacks of `CompletableFuture`
to display the profiling message :)

## Conclusion

Java 8 `CompletableFuture`s provide an awesome API to deal with async
tasks. Too bad that no Executor is able to create them without a bit of code
on our part.

I'm not a concurrency expert so please tell me what you think of this solution
in the comments.
