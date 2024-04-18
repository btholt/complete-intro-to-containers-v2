---
title: "Build a More Complicated Node.js App"
---

Okay, all looking good so far. Let's make this app go one step further. Let's have it have an npm install step! In the directory where your app is, put this:

```javascript
// this is the sample app from fastify.dev

// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });

// Declare a route
fastify.get("/", function handler(request, reply) {
  reply.send({ hello: "world" });
});

// Run the server!
fastify.listen({ port: 8080 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
```

[⛓️ Link to the code][node-file]

This is a [Fastify][fastify] server. Fastify is a server-side framework (like Express) for Node.js and one I've used several times. This is going to require that we `npm install` the dependencies. So in your project do the following

```bash
npm init -y # this will create a package.json for you without asking any questions
npm install fastify
```

[⛓️ Link to the package.json][package-file]

Now try running `node index.js` to run the Node.js server. You should see it running and logging out info whenever you hit an endpoint. Cool, so now that we have a full featured Node.js app, let's containerize it.

If we tried to build it and run it right now it'd fail because we didn't `npm install` the dependencies. So now right after the `COPY` we'll add a `RUN`.

```dockerfile
FROM node:20

USER node

WORKDIR /home/node/code

COPY --chown=node:node . .

RUN npm ci

CMD ["node", "index.js"]
```

```bash
docker build -t more-complicated-app .
docker run -it -p 8080:8080 --name my-app --rm --init more-complicated-app
```

We changed the `COPY` to copy everything in the directory. Right now you probably have a `node_modules` but if you're building a container directly from a repo it won't copy the `node_modules` so we have to operate under the assumption that those won't be there. Feel free even to delete them if you want.

Let's go ahead and add a `.dockerignore` file to the root of the project that prevents Docker from copying the `node_modules`. This has the same format as a `.gitignore`.

```
node_modules/
.git/
```

We then added a `RUN` instruction to run a command inside of the container. If you're not familiar with `npm ci` it's very similar to `npm install` with a few key differences: it'll follow the `package-lock.json` exactly (where `npm install` will ignore it and update it if newer patch versions of your dependencies are available) and it'll automatically delete `node_modules` if it exists. `npm ci` is made for situations like this.

Now if you try to build again, it _may_ fail with permissions issues. Why? Well, when you have `WORKDIR` create a directory, it does so as root (depending on which version of Docker you're using) which means that the node user won't have enough permissions to modify that directory. We could either use `RUN` to change the user or we could use `RUN` to make the directory in the first place as node. Let's do the latter.

Generally it's encouraged to not rely on `WORKDIR` to get it right and just do it yourself.

```dockerfile
FROM node:20

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node . .

RUN npm ci

CMD ["node", "index.js"]
```

[⛓️ Link to the Dockerfile][dockerfile-file]

```bash
docker build -t more-complicated-app .
docker run -it -p 8080:8080 --name my-app --rm --init more-complicated-app
```

Now try building and running your container. It should work now! Yay!

> **NOTE:** Make sure you don't bind your app to host `localhost` (like if you put `localhost` instead of `0.0.0.0` in the host in our Fastify app.) This will make it so the app is only available _inside_ the container. If you see `connection reset` instead of when you're expecting a response, this a good candidate for what's happening (because this definitely didn't _just_ happen to me 😂.)

[node-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/build-a-more-complicated-nodejs-app/main.js
[node-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/build-a-more-complicated-nodejs-app/package.json
[dockerfile-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/build-a-more-complicated-nodejs-app/Dockerfile
[fastify]: https://fastify.dev/
