---
title: "Reverse proxy on docker-compose with CORS and SSL"
date: 2019-12-21T00:24:53+01:00
toc: false
tags:
 - docker
 - nginx
categories:
 - architecture
Summary: How to set up a reverse-proxy with CORS and SSL, with docker-compose and a self-signed certificate.
---

# The problem

[Ackee](https://github.com/electerious/Ackee) is a neat self-hosted analytics solution for simple needs (e.g. a blog).
On the repo, the authors give instructions to run the tool, a node application, via docker-compose.

On the other hand, the website whose analytics will be tracked needs to include a script that will look like this:

```html
<script async src="https://unpkg.com/ackee-tracker@3.2.2/dist/ackee-tracker.min.js"
        data-ackee-server="https://ackee.com"
        data-ackee-domain-id="67bfa855-7569-4d29-a0a3-a2f4ceae2ea3"
        data-ackee-opts='{ "ignoreLocalhost": false }'></script>
```

The problem is that `localhost:1313`, where my blog runs locally, cannot send json requests to `https:localhost`
or whichever host Ackee is running on, if they differ in name/port, etc.

This is a browser built-in protection known as *CORS*.

To allow the browser to make a certain type of requests (like json request) to another host, this host must explicitly
allow it by responding with the following headers to a preflight request (with the OPTION http verb):

```
Access-Control-Allow-Origin  "*"
Access-Control-Allow-Methods "GET, POST, PATCH, OPTIONS"
Access-Control-Allow-Headers "Content-Type"
```  

The example above allows whichever host (*) to send GET, POST, PATCH, and OPTIONS requests with the `Content-Type`
header.
More info can be found in the [fetch specification](https://fetch.spec.whatwg.org/#http-cors-protocol)

This is a good use-case for a [reverse-proxy](https://medium.com/intrinsic/why-should-i-use-a-reverse-proxy-if-node-js-is-production-ready-5a079408b2ca).

We'll use nginx and a self-signed certificate for SSL.

Please note:
- You should avoid using wild-card in CORS headers in production
- SSL is not required to allow CORS
- You should use a properly signed certificate in production

However, I thought it would be a good occasion to learn something new. 
And I really wanted Ackee to work locally.

# The solution

Credits to Nickolas Kraus who wrote a [very good article](https://nickolaskraus.org/articles/how-to-create-a-self-signed-certificate-for-nginx-on-macos/)
on how to run nginx with self-signed certificates.

I just added docker-compose and CORS headers into the mix.

## Generating the cerficates

Here is a shell script that will create `self-signed.crt`, `self-signed.key` and `dhparam.pem`, your self-signed certificates.
It will also add it to the macOS trust store.

This will work immediately with Chrome. 
Firefox has its own store and you will have to manually add the certificate upon the first connection.

For other platforms, [see here](https://github.com/Busindre/How-to-Add-trusted-root-certificates).

 ```shell script
#!/usr/bin/env bash

mkdir -p nginx

rm -f nginx/dhparam.pem nginx/self-signed.crt nginx/self-signed.key

# create a ssl certificate
sudo openssl req \
  -x509 -nodes -days 365 -newkey rsa:2048 \
  -subj "/CN=localhost" \
  -config nginx/openssl.cnf \
  -keyout nginx/self-signed.key \
  -out nginx/self-signed.crt

# create a Diffie-Hellman key pair
sudo openssl dhparam -out nginx/dhparam.pem 128

# add certificate to the trusted root store
sudo security add-trusted-cert \
  -d -r trustRoot \
  -k /Library/Keychains/System.keychain nginx/self-signed.crt

# to remove

# sudo security delete-certificate -c "<name of existing certificate>"
```

## Nginx conf

**nginx.conf**
```
worker_processes  1;

events {
  worker_connections  1024;
}

http {
  include       mime.types;
  default_type  application/octet-stream;

  sendfile           on;
  keepalive_timeout  65;
  proxy_http_version 1.1;

  # configure nginx server to redirect to HTTPS
  server {
    listen       80;
    server_name  localhost;
    return 302 https://$server_name:443;
  }

  # configure nginx server with ssl
  server {
    listen       443 ssl http2;
    server_name  localhost;
    include self-signed.conf;
    include ssl-params.conf;

    # route requests to the local development server
    location / {
      add_header   Access-Control-Allow-Origin "*" always;
      add_header   Access-Control-Allow-Methods "GET, POST, PATCH, OPTIONS" always;
      add_header   Access-Control-Allow-Headers "Content-Type" always;
      add_header   Strict-Transport-Security "max-age=31536000" always;
      add_header   X-Frame-Options deny;
      proxy_pass   http://ackee:3000/;
    }
  }

  include servers/*;
}
```

Note the `proxy_pass` line that will reference the site we reverse-proxy.
With docker-compose the hostname will be the name of the container listed in `docker-compose.yml`.

We know that the node server runs on port 3000.

You can also see that nginx will automatically add the CORS headers we previously discussed.

You can see two includes:

**ssl-params.conf**
```
ssl_protocols TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
ssl_dhparam dhparam.pem;
```

**self-signed.conf**
```
ssl_certificate self-signed.crt;
ssl_certificate_key self-signed.key;
```

## docker-compose

**docker-compose.yml**
```yaml
version: "3"
services:
  nginx:
    image: nginx:latest
    container_name: pnginx
    volumes:
      - ./nginx/:/etc/nginx/
    ports:
      - 80:80
      - 443:443
    depends_on:
      - ackee
  ackee:
    image: electerious/ackee
    container_name: ackee
    restart: always
    environment:
      - WAIT_HOSTS=mongo:27017
      - ACKEE_MONGODB=mongodb://mongo:27017/ackee
    env_file:
      - .env
    depends_on:
      - mongo
  mongo:
    image: mongo
    container_name: mongo
    restart: always
    volumes:
      - ./data:/data/db
```

Note the `depends_on` line which will make the Ackee container available inside the docker network on http://ackee.

With that, we have a node application running behind nginx with HTTPS and CORS enabled! 

![It works](/assets/images/articles/2019/2019-12-21-success.png)

Resources:
- [Github repository](https://github.com/geowarin/docker-compose-nginx)
- [Original article](https://nickolaskraus.org/articles/how-to-create-a-self-signed-certificate-for-nginx-on-macos/)
- [Why should I use a Reverse Proxy if Node.js is Production-Ready?](https://medium.com/intrinsic/why-should-i-use-a-reverse-proxy-if-node-js-is-production-ready-5a079408b2ca)
- [How-to: Adding trusted root certificates](https://github.com/Busindre/How-to-Add-trusted-root-certificates)
