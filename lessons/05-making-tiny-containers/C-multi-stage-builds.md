---
description: >-
  Learn how to optimize Docker images using multistage builds with Node.js and
  Alpine, reducing container size significantly by eliminating unnecessary
  dependencies like npm. Follow a tutorial on building a Dockerfile with
  multiple stages and leveraging Alpine for smaller, more efficient containers.
keywords:
  - Docker multistage build
  - Node.js Alpine Docker image
  - optimize Docker image size
---

Hey, we're already half-way to ridiculous, let's make our image EVEN SMALLER. Technically we only need `npm` to build our app, right? We don't actually need it to run our app. Docker allows you to have what it called multistage builds, we it uses one container to build your app and another to run it. This can be useful if you have big dependencies to build your app but you don't need those dependencies to actually run the app. A C++ or Rust app might be a good example of that: they need big tool chains to compile the apps but the resulting binaries are smaller and don't need those tools to actually run them. Or one perhaps more applicable to you is that you don't need the TypeScript or Sass compiler in production, just the compiled files. We'll actually do that here in a sec, but let's start here with eliminating `npm`.

Make a new Dockerfile, call it `Dockerfile`.

```dockerfile
# build stage
FROM node:20 AS node-builder
RUN mkdir /build
WORKDIR /build
COPY package-lock.json package.json ./
RUN npm ci
COPY . .

# runtime stage
FROM alpine:3.19
RUN apk add --update nodejs
RUN addgroup -S node && adduser -S node -G node
USER node
RUN mkdir /home/node/code
WORKDIR /home/node/code
COPY --from=node-builder --chown=node:node /build .
CMD ["node", "index.js"]
```

Notice we have have two `FROM` instructions. This is how you can tell it's multistage. The last container made will be the final one that gets labeled and shipped. Notice we're starting in the full `node:20` container since we're not going to ship this container so we can use the kitchen sink to build it before it copying it to a smaller container.

After building everything in the build stage (you can have more than two stages by the way) we move on to the runtime container. In this one we're using Alpine due its size and security benefits. Everything else looks similar to what we were doing before, just now we're going to be copying from the build container instead of the host machine.

The two real key differences are that we don't `apk add npm` and we're doing `COPY --from=my-node` which means we're copying from the first stage. We do `FROM node:20 AS node-builder` so we can refer to node-builder by name which simplifies reading the Dockerfile.

As you may imagine, this means you can copy from any previous stage or if you leave `--from` off it'll come from the host machine.

So try it now!

```bash
docker build -t my-multi .
docker run -it -p 8080:8080 --name my-app --rm --init my-multi
```

Still works! And our container size is down to a cool 72MB as compared to 89MB when we included npm, 150MB when we used `node:20-alpine` and 1.1GB when we used `node:20`.

Pretty amazing, right? Honestly, how worth is it doing micro optimization like this? Not very. We had to do a decent amount to shave 50% off the final size and now we're stuck maintaining it. I'd rather just start with `FROM node:20-alpine` and call it a day. We get all their wisdom for free and we're not stuck with a longer Dockerfile than we need. But it is definitely worth going from 1.1GB to 150MB!

## A note on container sizes

A last note here: file size isn't everything. It's at best weakly correlated with security, it's just a fun metric to measure. In theory you'll save some money on bandwidth but I have to guess you'll spend more engineering salaries making containers tiny than you'll save on bandwidth. I'd much rather have `node:20` and have it be maintained by security professionals than trying to do it myself. Just keep that in mind: it can be a fool's errand to chase shaving bytes off your containers.
