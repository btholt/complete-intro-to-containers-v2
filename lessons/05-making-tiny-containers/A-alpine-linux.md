---
description: >-
  Learn how to make your Node.js app container faster, cheaper, and more secure
  by optimizing its size. Reduce vulnerabilities and hosting costs with tips on
  minimizing container size using Alpine Linux in Docker.
keywords:
  - Node.js
  - container optimization
  - Alpine Linux
  - Docker
  - security
  - cost-effective hosting
---

We've now built a nice little container for our Node.js app and we absolutely could ship it as-is to production. However there's a few things we can do to make things even faster, cheaper, and more secure.

## Making your containers smaller

Making your containers smaller is a good thing for a few reasons. For one, everything tends to get a bit cheaper. Moving containers across the Internet takes time and bits to do. If you can make those containers smaller, things will go faster and you'll require less space on your servers. Often private container registries (like personal Docker Hubs, Azure Container Registry is a good example) charge you by how much storage you're using.

Beyond that, having less _things_ in your container means you're less susceptible to bugs. Let's say there's a Python exploit that's going around that allows hackers to get root access to your container. If you don't have Python in your container, you're not vulnerable! And obviously if you do have Python installed (even if you're not using it) you're vulnerable. So let's see how to make your container a bit smaller.

In your previous Dockerfile, change the first line (`FROM`)

```dockerfile
FROM node:20-alpine

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["node", "index.js"]
```

[⛓️ Link to the Dockerfile][dockerfile-file]

Our image size (by comparing the `"Size"` field in in `docker inspect my-app`) from 1.1GB to 150MB just like that. We shed quite a bit of cruft that we didn't need in Debian and we didn't even need to change anything in our Dockerfile. Honestly, that's unusual. When you strip _everything_ out typically you'll have to go back and add some of them back in. But in this case we're golden!

Alpine, if you remember, is a bare bones alternative to Debian. It's built on Busybox Linux which is a 2MB distro of Linux (Alpine is 5MB.) `node:20-alpine` itself is about `133MB` and `node:latest` is about 1.0GB.

When should you select Alpine? My general feeling (this is a Brian Holt opinion, not a community one so take it with a grain of salt) is that the "end destination" container is where Alpine is most useful. It cuts all cruft out which is super helpful for end-deployment sorts of scenarios due to security and size but it also can be annoying for development scenarios because it lacks just about everything necessary for those, making you have to hand install everything you need. In these "middle scenarios" where it's not really the destination and the container is just another tool in your development system (where that's a multi stage build or a development container) I'll reach for Ubuntu or Debian.

[dockerfile-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/alpine-linux/Dockerfile
