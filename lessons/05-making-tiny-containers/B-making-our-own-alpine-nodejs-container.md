---
title: "Making Our Own Alpine Node.js Container"
---

## Making our own Node.js Alpine container

Let's take this exercise a bit further. Let's actually make our own Node.js Alpine container. NOTE: I'd suggest **always** using the official one. They'll keep it up to date with security fixes and they're _real_ good at making containers. Better than I am, anyway. But this is a good exercise for us to go through to learn how to install system dependencies.

Start with this in a new Dockerfile.

```dockerfile
FROM alpine:3.19

RUN apk add --update nodejs npm
```

`alpine:latest` would nab you the latest Alpine (3.19 as of writing, if you run into issues with versions, continue with `alpine:3.19` instead of `alpine:latest`. Otherwise feel free to truck on with `alpine:latest`)

`RUN apk add --update nodejs npm` will use the Alpine package manager to grab Node.js and npm (they're bundled separately for Alpine.)

```bash
docker build -t my-node .
```

If you encounter error like this

```bash
/home/node/code/node_modules/@hapi/hapi/lib/core.js:51
    actives = new WeakMap();                                                   // Active requests being processed
            ^

SyntaxError: Unexpected token =
```

Try using `nodejs-current` instead of `nodejs`

```dockerfile
RUN apk add --update nodejs-current npm
```

Okay so now if you do `docker build -t my-node .`. Now try `docker run --rm --name my-app -it my-node`. In here you should have a pretty bare bones Linux container but both `node -v` and `npm -v` should work. I checked and already my container is 72MB.

Keep in mind that Alpine does not use bash for its shell; it uses a different shell called `ash` or often just `sh`. It's similar enough to bash but there are some differences. It's not really the point of this class so we'll keep the focus on learning just what's necessary.

Let's next make our `node` user.

```dockerfile
FROM alpine:3.19

RUN apk add --update nodejs npm

RUN addgroup -S node && adduser -S node -G node

USER node
```

I'm mimicking what the Node.js official container does, which is make a user group of `node` with one user in it, `node`. Feel free to name them different things if you feel so inclined. Notice we could conceivably combine the two `RUN` instructions together but it's generally best practices to keep "ideas" separate. The first `RUN` installs dependencies, the second one creates the `node` user. Up to you how you do it, neither is wrong per se.

Now we can just copy the rest from the previous Dockerfile! Let's do that.

```dockerfile
FROM alpine:3.19

RUN apk add --update nodejs npm

RUN addgroup -S node && adduser -S node -G node

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["node", "index.js"]
```

[⛓️ Link to the Dockerfile][dockerfile-file]

It works! We're down to 89MB (compared to 150MB-ish with the official `node:12-alpine` container). Honestly, I'm not entirely sure what we cut out from the other `node:20-alpine` container but it's probably important. Again, I'd stick to the official containers where they exist. But hey, we learned how to add a user and install system dependencies! Let's make it even small because why the hell not.

[dockerfile-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/making-our-own-alpine-nodejs-container/Dockerfile
