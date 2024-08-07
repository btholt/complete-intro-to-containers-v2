---
title: Docker CLI
description: >-
  Explore Docker CLI features like pull, push, inspect, and more. Learn how to
  manage containers efficiently with commands such as pause, unpause, exec,
  import, export, history, info, top, rm, rmi, logs, restart, and search.
keywords:
  - Docker CLI
  - container management
  - Docker commands
  - Docker features
  - Docker container operations
---

Let's take a look at some more cool features of the Docker CLI.

### pull / push

`pull` allows you to pre-fetch container to run.

```bash
# this just downloads and caches the image, it doesn't do anything else with it
docker pull jturpin/hollywood

# notice it's already loaded and cached here; it doesn't redownload it
docker run -it jturpin/hollywood hollywood
```

That will pull the hollywood container from the user jturpin's user account. The second line will execute this fun container which is just meant to look a hacker's screen in a movie (it doesn't really do anything than look cool.)

> Note: The `jturpin/hollywood` image has been depricated. These steps should still work, but if you have issues, you can replace that image with `bcbcarl/hollywood`.

`push` allows you to push containers to whatever registry you're connected to (probably normally Docker Hub or something like Azure Container Registry or GitHub Container Registry).

### inspect

```bash
docker inspect node:20
```

This will dump out a lot of info about the container. Helpful when figuring out what's going on with a container

### pause / unpause

As it looks, these pauses or unpause all the processes in a container. Feel free to try

```bash
docker run -dit --name hw --rm jturpin/hollywood hollywood
docker ps # see container running
docker pause hw
docker ps # see container paused
docker unpause hw
docker ps # see container running again
docker kill hw # see container is gone
```

### exec

This allows you to execute a command against a running container. This is different from `docker run` because `docker run` will start a new container whereas `docker exec` runs the command in an already-running container.

```bash
docker run -dit --name hw --rm jturpin/hollywood hollywood

# see it output all the running processes of the container
docker exec hw ps aux
```

If you haven't seen `ps aux` before, it's a really useful way to see what's running on your computer. Try running `ps aux` on your macOS or Linux computer to see everything running.

### import / export

Allows you to dump out your container to a tar ball (which we did above.) You can also import a tar ball as well.

### history

We'll get into layers in a bit but this allow you to see how this Docker image's layer composition has changed over time and how recently.

```bash
docker history node:20
```

### info

Dumps a bunch of info about the host system. Useful if you're on a VM somewhere and not sure what the environment is.

```bash
docker info
```

### top

Allows you to see processes running on a container (similar to what we did above)

```bash
docker run -dit --name my-mongo --rm mongo
docker top my-mongo # you should see MongoDB running
docker kill my-mongo
```

### rm / rmi

If you run `docker ps --all` it'll show all containers you've stopped running in addition to the runs you're running. If you want to remove something from this list, you can do `docker rm <id or name>`.

You can run `docker container prune` to remove _all_ of the stopped containers.

If you want to remove an image from your computer (to save space or whatever) you can run `docker rmi mongo` and it'll delete the image from your computer. This isn't a big deal since you can always reload it again

### logs

Very useful to see the output of one of your running containers.

```bash
docker run --name my-mongo --rm -dit mongo
docker logs my-mongo # see all the logs
docker kill my-mongo
```

### restart

Pretty self explanatory. Will restart a running container

### search

If you want to see if a container exists on Docker Hub (or whatever registry you're connected to), this will allow you to take a look.

```bash
docker search python # see all the various flavors of Python containers you can run
docker search node # see all the various flavors of Node.js containers you can run
```
