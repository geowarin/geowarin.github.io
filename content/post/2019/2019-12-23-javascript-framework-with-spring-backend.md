---
title: "Run your frontend alongside spring boot"
date: 2019-12-23T01:20:59+01:00
toc: false
tags:
 - javascript
categories:
 - spring
description: Running a javascript application alongside your spring boot backend can be bit of a conundrum. Here are
    several ways to tackle this problem.
---

Assumptions:

- Your backend serves the API (REST, graphQL)
- You build your javascript with a separate bundler (parcel, webpack)
- Your frontend uses a push state (HTML 5 history) router
- You want hot module reloading (HMR) for the best developer experience

## TLDR;

The [github repository](https://github.com/geowarin/boot-js) shows four different solutions.


## 1. CORS

The most obvious solution is to set up the backend to allow [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS)
with the frontend, which runs on the development web server.

```kotlin
@Bean
@ConditionalOnProperty(name = ["com.geowarin.cors.allowedOrigin"])
fun corsFilter(corsProperties: CorsProperties): CorsWebFilter {
    val source = UrlBasedCorsConfigurationSource().apply {
      registerCorsConfiguration("/api/**", CorsConfiguration().apply {
        addAllowedOrigin(corsProperties.allowedOrigin!!)
        addAllowedHeader("*")
        addAllowedMethod("*")
      })
    }
    return CorsWebFilter(source)
}
```

We run the frontend with its included web server on `localhost:1234`. 
The spring backend runs on `localhost:8080`. 

Navigating on `localhost:1234`, you will see that the frontend is able to call web services because the backend allows
CORS from that origin.

Pros:
- Close to a production environment
- Simple enough

Cons:
- CORS?


## 2. Embed javascript into the backend

Another solution is to embed the frontend resources directly inside the spring server, as static resources.
The advantage is that we have only one web server and everything is on the same host.

```kotlin
val acceptsHtmlOnly: RequestPredicate = RequestPredicate { request ->
  request.headers().accept().contains(MediaType.TEXT_HTML) &&
      !request.headers().accept().contains(MediaType.ALL)
}

@Configuration
class RouterConfig {
  @Bean
  fun indexRoutes(props: EmbeddedProperties) = router {
    (GET("*") and acceptsHtmlOnly) {
      val indexHtml = DefaultResourceLoader().getResource(props.frontendDirectory)
      val indexHtml = frontendDirectory.createRelative("index.html")
      ServerResponse.ok().contentType(MediaType.TEXT_HTML).bodyValue(indexHtml)
    }
  }
}

@Configuration
@EnableWebFlux
class WebConfig(val props: EmbeddedProperties) : WebFluxConfigurer {
  override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
    registry.addResourceHandler("/**")
      .addResourceLocations(props.frontendDirectory)
      .setCacheControl(props.cacheControl)
  }
}
```

Navigating on `locahost:8080` you will see that the react application is able to call web services because they
both run on the same host.

This configuration might have some occasional problems with HMR not fully reloaded so it's not my favourite.

![Oups](/assets/images/articles/2019-12-23-javascript-framework-with-spring-backend/hmr-errors.png)

However, by generating the result of the frontend build in `src/main/resources/static` we both have a very simple
way to distribute the full web application, as well as a dev environment that is very similar to the production environment.

Pros:
- Simple to distribute
- No CORS 

Cons:
- A bit of code to handle frontend routing on the backend
- Clunky hot reloading
- We cannot scale the backend and the frontend independently

## 3. Javascript proxy

You might do the opposite, run an express web server which includes your bundler and proxies requests to `localhost:8080`.

```javascript
const Bundler = require('parcel');
const express = require('express');
const proxy = require('http-proxy-middleware');
const history = require('connect-history-api-fallback');

const bundler = new Bundler('src/index.html');
const app = express();

app.use(history());
app.use(proxy('/api', {target: 'http://localhost:8080', changeOrigin: true}));

app.use(bundler.middleware());

app.listen(3000, 'localhost', (err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://localhost:3000');
});
```

So going to `localhost:3000` we can see that the frontend is able to make web requests as if it is running on the
same host as the backend.

Pros:
- No CORS

Cons:
- Not a production solution (needs to be complemented with another solution)

## 4. Reverse proxy

We can run a third web server that routes both to our frontend and backend. 
This is simple enough thanks to `docker-compose`.

```yaml
version: "3"
services:
  nginx:
    image: nginx:latest
    container_name: brginx
    volumes:
      - ./server.conf:/etc/nginx/conf.d/default.conf
      - ../frontend/dist:/usr/share/nginx/html
    ports:
      - 8081:8081
```

Here is the nginx configuration:

```
server {
    listen       8081;
    server_name  localhost;

    location /api {
        proxy_pass   http://host.docker.internal:8080;
    }

    location / {
        root /usr/share/nginx/html;
        set $fallback_file /index.html;
        if ($http_accept !~ text/html) {
            set $fallback_file /null;
        }
        try_files $uri $fallback_file;
    }
}
```

So navigating to the nginx server on `localhost:8081`, we can see that the backend and the frontend appear to be on the
same host.

Pros:
- Close to a production environment
- Flexible
- Can scale with a load balancer

Cons:
- 3 processes

## Conclusion

Depending on how you wish to deploy your application, you might choose one of the approaches above or even mix them to 
reach developer nirvana.

What about you? How do you develop your full stack application?

I'd love to have your input!  

Sources:
- [Github repository](https://github.com/geowarin/boot-js)
