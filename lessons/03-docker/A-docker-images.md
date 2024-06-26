---
description: >-
  Learn how to work with Docker images without Docker by unpacking, exporting,
  and creating a new isolated environment manually through commands. Understand
  the core concepts behind Docker such as namespace isolation, cgroups
  limitation, and chroot environment while exploring functionalities like
  networking and volumes.
keywords:
  - Docker images
  - Docker Hub
  - container environment
  - namespace isolation
  - cgroups
  - chroot
  - environment setup
---

These pre-made containers are called _images_. They basically dump out the state of the container, package that up, and store it so you can use it later. So let's go nab one of these image and run it! We're going to do it first without Docker to show you that you actually already knows what's going on.

First thing, let's go grab a container off of Docker Hub. Let's grab the latest Node.js container that runs Ubuntu.

### Docker Images without Docker

```bash
# start docker contaier with docker running in it connected to host docker daemon
docker run -ti -v /var/run/docker.sock:/var/run/docker.sock --privileged --rm --name docker-host docker:26.0.1-cli

# run stock alpine container
docker run --rm -dit --name my-alpine alpine:3.19.1 sh

# export running container's file system
docker export -o dockercontainer.tar my-alpine

# make container-root directory, export contents of container into it
mkdir container-root
tar xf dockercontainer.tar -C container-root/

# make a contained user, mount in name spaces
unshare --mount --uts --ipc --net --pid --fork --user --map-root-user chroot $PWD/container-root ash # this also does chroot for us
mount -t proc none /proc
mount -t sysfs none /sys
mount -t tmpfs none /tmp

# here's where you'd do all the cgroup rules making with the settings you wanted to
# we're not going to since we did it all in the last lesson
```

So, this isn't totally it. Docker does a lot more for you than just this like networking, volumes, and other things but suffice to say this core of what Docker is doing for you: creating a new environment that's isolated by namespace and limited by cgroups and chroot'ing you into it. So why did we go through all this ceremony? Well, it's because I want you to understand what Docker is doing for you, know that you _could_ do it by hand but since there's a tool that does for you you don't want to. I hold a strong personal belief that tools people need to understand their tools and what they do for them. Every tool you add to your environment adds complexity but should also add ease. If you don't understand the complexity the tool is solving, you resent it and don't get to fully appreciate nor take advantage of what the tool can fully offer.

So how often will you do what we just did? Never. 99.9% of container-utilizers have no idea this is what's happening under the hood. But now that you know it will make you embrace the complexity that Docker adds because you can see why you have it.
