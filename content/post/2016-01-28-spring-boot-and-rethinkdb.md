---
categories:
- websocket
- rethinkdb
date: 2016-01-28T00:00:00Z
description: RethinkDB is a great database engine allowing you to receive live updates
  on your data. Let's create a Spring Boot App and give it a try!
tags:
- chat
title: A simple chat with Spring Boot and RethinkDB
aliases:
    - /spring-boot-and-rethinkdb.html
---

The Java driver for [RethinkDB](https://www.rethinkdb.com/) has recently
[been released](https://rethinkdb.com/blog/official-java-driver/) in beta.

I created a little chat application with Spring Boot, you can see the result
[on github](https://github.com/geowarin/boot-rethinkdb).

There is a docker-compose file at the root of the project that you can
use to run a RethinkDB instance instead of installing it directly on your machine.

## Why RethinkDB?

I already gave RethinkDB a try a few months ago and I was very impressed
with its beautiful admin GUI, its clustering capabilities and its clever
and intuitive API.

But there is more! RethinkDB is a DB engine designed to push updates to the clients
in real time.

In the [CAP theorem](https://github.com/henryr/cap-faq), rethinkDB focuses on being
Consistent in case of difficulties in the cluster.

Relevant quote from the [FAQ](https://www.rethinkdb.com/docs/architecture/#cap-theorem):
<blockquote>
Authoritative systems such as RethinkDB and MongoDB choose to maintain data consistency. Building applications on top of authoritative primary systems is much simpler because all of the issues associated with data inconsistency do not arise. In exchange, these applications will occasionally experience availability issues.
</blockquote>

Once RethinkDB is started, you can connect on the beautiful admin GUI on port `8080`:

![The awesome GUI](/assets/images/articles/2016-01-rethinkDB-admin.png "The RethinkDB admin GUI")

## Setting up the project

I created a Gradle project with the `web` and `websocket` Spring boot starters.
I also added a couple of [webjars](https://spring.io/blog/2014/01/03/utilizing-webjars-in-spring-boot):
`jquery` for ajax requests, sockjs and stomp to connect to Spring's websockets:

```groovy
dependencies {
    compile('org.springframework.boot:spring-boot-starter-web')
    compile('org.springframework.boot:spring-boot-starter-websocket')
    compile('org.springframework.boot:spring-boot-devtools')

    compile 'org.webjars:jquery:3.0.0-alpha1'
    compile 'org.webjars:sockjs-client:1.0.0'
    compile 'org.webjars:stomp-websocket:2.3.3'

    compile 'com.rethinkdb:rethinkdb-driver:2.2-b1-SNAPSHOT'
}
```

## Getting a connection

Every action we will perform on the database will require a `Connection`.
We can create a small factory that we will later use in the code:

```java
public class RethinkDBConnectionFactory {
    private String host;

    public RethinkDBConnectionFactory(String host) {
        this.host = host;
    }

    public Connection<ConnectionInstance> createConnection() {
        try {
            return RethinkDB.r.connection().hostname(host).connect();
        } catch (TimeoutException e) {
            throw new RuntimeException(e);
        }
    }
}
```

## Initializing the DB

For this little chat, we will need a database called `chat` and a table
called `messages`.

To avoid creating them by hand, we can create a Spring bean that will get called
when the application starts:

```java
public class DbInitializer implements InitializingBean {
    @Autowired
    private RethinkDBConnectionFactory connectionFactory;

    @Autowired
    private ChatChangesListener chatChangesListener;

    private static final RethinkDB r = RethinkDB.r;

    @Override
    public void afterPropertiesSet() throws Exception {
        createDb();
        // we will see that later on
        chatChangesListener.pushChangesToWebSocket();
    }

    private void createDb() {
        Connection<ConnectionInstance> connection = connectionFactory.createConnection();
        List<String> dbList = r.dbList().run(connection);
        if (!dbList.contains("chat")) {
            r.dbCreate("chat").run(connection);
        }
        List<String> tables = r.db("chat").tableList().run(connection);
        if (!tables.contains("messages")) {
            r.db("chat").tableCreate("messages").run(connection);
            r.db("chat").table("messages").indexCreate("time").run(connection);
        }
    }
}
```

Ignore the `pushChangesToWebSocket()` method call for now, we will see this in a minute.

We can already get a feel for the RethinkDB API.
It was originally designed for dynamically typed language so some things might
be a little awkward for hardcore Java developers.

For instance, the result of the operations can be of any type.
RethinkDB will try to coerce the result according to the return type chosen, if possible.

This is both good, because of the additional flexibility, and bad, because you
cannot rely on autocomplete to know the return type of an operation.

## The ChatController

The chat controller will react to two things:

1. `GET`ting the last 20 messages from the DB
2. `POST`ing a new message

Here is the code, which is kind of straight-forward:

```java
@RestController
@RequestMapping("/chat")
public class ChatController {

    protected final Logger log = LoggerFactory.getLogger(ChatController.class);
    private static final RethinkDB r = RethinkDB.r;

    @Autowired
    private RethinkDBConnectionFactory connectionFactory;

    @RequestMapping(method = RequestMethod.POST)
    public ChatMessage postMessage(@RequestBody ChatMessage chatMessage) {
        chatMessage.setTime(OffsetDateTime.now());
        Object run = r.db("chat").table("messages").insert(chatMessage)
                .run(connectionFactory.createConnection());

        log.info("Insert {}", run);
        return chatMessage;
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<ChatMessage> getMessages() {

        List<ChatMessage> messages = r.db("chat").table("messages")
                .orderBy().optArg("index", r.desc("time"))
                .limit(20)
                .orderBy("time")
                .run(connectionFactory.createConnection(), ChatMessage.class);

        return messages;
    }
}
```

The cool thing is that the API clean and simple to understand.

Some things are still a bit funny:

* The `optArg` after the orderBy is a bit cryptic
* I spent some time figuring out that your POJO class must not contain any id
attribute for the auto-generation to work

## Setting up websockets

Now that we can read and write from the DB, we need to push the updates to
the client in real time.

We will use websockets over [SockJS](http://www.rabbitmq.com/blog/2011/09/13/sockjs-websocket-emulation/) for that.
The configuration for websockets is pretty classic:

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chatWS").withSockJS();
    }
}
```

How to read that:

* Our clients will be able to connect to the `/chatWS` endpoint
* The clients will then have the possibility to listen to any topic whose url begins
with `/topic` (i.e, `/topic/messages`) and get notified in real time

## Listening to the updates

We will now listen to database updates in a thread and broadcast the changes
to all the clients listening on the web socket.

We use the `@Async` annotation, so Spring will take care of running the code in a thread
for us:

```java
@Service
public class ChatChangesListener {
    protected final Logger log = LoggerFactory.getLogger(ChatChangesListener.class);
    private static final RethinkDB r = RethinkDB.r;

    @Autowired
    private RethinkDBConnectionFactory connectionFactory;

    @Autowired
    private SimpMessagingTemplate webSocket;

    @Async
    public void pushChangesToWebSocket() {
      Cursor<ChatMessage> cursor = r.db("chat").table("messages").changes()
              .getField("new_val")
              .run(connectionFactory.createConnection(), ChatMessage.class);

      while (cursor.hasNext()) {
          ChatMessage chatMessage = cursor.next();
          log.info("New message: {}", chatMessage.message);
          webSocket.convertAndSend("/topic/messages", chatMessage);
      }
  }
}
```

So what happens here? Each time a change happens in the database,
we will get an update. This update will contain two fields: `old_val` and `new_val`.
See [the documentation](https://www.rethinkdb.com/api/java/changes/).

Since we are only interested in the new things, we will only retrieve the `new_val` field.

Note that the second (optional) argument to the `run` method is a class.
If present, RethinkDB will try to convert the data to this target class, just like
we did in the `ChatController` above.

Then, we simply broadcast the message to all the clients listening on `/topic/messages`.

## The client

If you never used webjars before, they are simply jar packages containing frontend
dependencies. With Spring Boot we can use them in our web pages directly.
Below the `index.html` file of our application:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <script src="webjars/jquery/3.0.0-alpha1/jquery.js"></script>
    <script src="webjars/sockjs-client/1.0.0/sockjs.js"></script>
    <script src="webjars/stomp-websocket/2.3.3/stomp.js"></script>
    <script src="js/main.js"></script>
</head>
<body>

<div id="chat">

    <div id="messages">

    </div>
    <form onsubmit="sendMessage(); return false;">
        <label>
            Message:
            <input type="text" id="messageInput" />
        </label>
        <button type="submit">Send</button>
    </form>
</div>

</body>
</html>
```

And the javascript:

```javascript
var userName = window.prompt("Enter your name", "some user");

function appendMessage(message) {
    $('#messages').append($('<div />').text(message.from + ": " + message.message))
}

function getPreviousMessages() {
    $.get('/chat').done(messages => messages.forEach(appendMessage));
}

function sendMessage() {
    var $messageInput = $('#messageInput');
    var message = {message: $messageInput.val(), from: userName};
    $messageInput.val('');
    post('/chat', message);
}

function onNewMessage(result) {
    var message = JSON.parse(result.body);
    appendMessage(message);
}

function connectWebSocket() {
    var socket = new SockJS('/chatWS');
    stompClient = Stomp.over(socket);
    //stompClient.debug = null;
    stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/messages', onNewMessage);
    });
}

getPreviousMessages();
connectWebSocket();
```

![The chat with a bit of CSS](/assets/images/articles/2016-01-rethinkDB-hello.gif "Hello world!")

## Conclusion

RethinkDB is an awesome database, especially because it lets you decouple the
code that updates the database and the code that listens to the changes.

The driver is brand new and still in beta but we can already salute the efforts
of the developers for such an amazing work!

As always, check out the project [on github](https://github.com/geowarin/boot-rethinkdb)
and tell me what you think!
