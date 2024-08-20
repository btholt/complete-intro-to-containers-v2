---
description: >-
  Learn how to use Docker Compose to coordinate multiple containers for
  development environments efficiently. Simplify defining relationships between
  containers using a YAML file, making it easy to manage complex setups with one
  command. Explore CI/CD integration possibilities and enhance development
  productivity by leveraging Docker Compose features.
keywords:
  - Docker Compose
  - multiple containers
  - development environments
  - CI/CD scenarios
  - YAML file
  - containers relationship
  - productivity
---

This may be one of the most useful features you learn about Docker. We've been mixing various different facets of deploying your app to production and creating development environments. This feature in particular is geared much more for development environments. Many times when you're developing containers you're not in just a single container environment (though that does happen too.) When this happens, you need to coordinate multiple containers when you're doing local dev and you've seen in the previous chapter, networking, that it's possible if a bit annoying.

With Docker Compose we simplify this a lot. Docker Compose allows us the ability to coordinate multiple containers and do so with one YAML file. This is great if you're developing a Node.js app and it requires a database, caching, or even if you have two+ separate apps in two+ separate containers that depend on each other or all the above! Docker Compose makes it really simple to define the relationship between these containers and get them all running with one `docker compose up`.

> If you see any commands out there with `docker-compose` (key being the `-` in there) it's from Docker Compose v1 which is not supported anymore. We are using Docker Compose v2 here. For our purposes there isn't much difference.

Do note that Docker does say that Docker Compose is suitable for production environments if you have a single instance running multiple containers. This is atypical for the most part: if you have multiple containers, typically you want the ability to have many instances.

In addition to working very well dev, Docker Compose is very useful in CI/CD scenarios when you want GitHub Actions or some CI/CD provider to spin up multiple environments to quickly run some tests.

Okay so let's get our previous app working: the one with a MongoDB database being connected to by a Node.js app. Create a new file in the root directory of your project called `docker-compose.yml` and put this in there:

```yml
services:
  api:
    build: api
    ports:
      - "8080:8080"
    links:
      - db
    environment:
      MONGO_CONNECTION_STRING: mongodb://db:27017
  db:
    image: mongo:7
  web:
    build: web
    ports:
      - "8081:80"
```

This should feel familiar even if it's new to you. This is basically all of the CLI configurations we were giving to the two containers but captured in a YAML file.

In `service` we define the containers we need for this particular app. We have two: the `web` container (which is our app) and the `db` container which is MongoDB. We then identify where the Dockerfile is with `build`, which ports to expose in `ports`, and the `environment` variables using that field.

The one interesting one here is the `links` field. In this one we're saying that the `api` container needs to be connected to the `db` container. This means Docker will start this container first and then network it to the `api` container. This works the same way as what we were doing in the previous lesson.

The `db` container is pretty simple: it's just the `mongo` container from Docker Hub. This is actually smart enough to expose 27017 as the port and to make a volume to keep the data around between restarts so we don't actually have to do anything for that. If you needed any other containers, you'd just put them here in services.

We then have a frontend React.js app that is being built by Parcel.js and served by NGINX.

There's a lot more to compose files than what I've shown you here but I'll let you explore that on your own time. [Click here][compose] to see the docs to see what else is possible.

This will start and work now, just run `docker compose up` and it'll get going. I just want to do one thing: let's make our app even more productive to develop on. Go to your Dockerfile for the app make it read a such:

> If you change something and want to make sure it builds, make sure to run `docker compose up --build`. Docker Compose isn't watching for changes when you run up.

```dockerfile
FROM node:latest

RUN npm i -g nodemon

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["nodemon", "index.js"]
```

Now we can write our code and every time it save it'll restart the server from within the container. This will make this super productive to work with!

While we're about to get to Kubernetes which will handle bigger deployment scenarios than Docker Compose can, you can use `docker-compose up --scale web=10` to scale up your web container to 10 concurrently running containers. This won't work at the moment because they're all trying to listen on the host on port 3000 but we could use something like NGINX or HAProxy to loadbalance amongst the containers. It's a bit more advance use case and less useful for Compose since at that point you should probably just use Kubernetes or something similar. We'll approach it in the Kubernetes chapter.

[compose]: https://docs.docker.com/compose/compose-file/#compose-file-structure-and-examples
