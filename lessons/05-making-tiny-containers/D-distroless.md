---
description: >-
  Learn about the differences between Alpine and Distroless for Docker
  containers, focusing on edge cases with Alpine and the stripped-down nature of
  Distroless. Explore alternative options like Wolfi, Red Hat's Universal Base
  Image Micro, and Google's Distroless projects, emphasizing security and
  minimalism.
keywords:
  - Alpine
  - Distroless
  - Docker containers
  - security
  - minimalism
---

You may not want to use Alpine. [This blog post goes into depth][blog] but let me sum it up with two points:

1. Alpine made some design choices that have some extremely rare edge cases that can cause failures and be _very_ hard to diagnose. This arises from their choice of replacing the typical `glibc` with `musl`. Read the blog post if you want to know more. Suffice to say, unless you're running Kubernetes at a large scale this shouldn't concern you; lots of people run Alpine and never see issues.
1. Now Alpine isn't the only option!

The three projects to look to here, [Wolfi (an open source project)][wolfi], [Red Hat's Universal Base Image Micro][ubi] and [Google's Distroless][distroless].

You would be set with any of these. We are going to focus on Distroless because it is currently the most popular but feel free to experiment!

"Distroless" is a bit of a lie as it still based on Debian, but to their point, they've stripped away essentially everything except what is 100% necessary to run your containers. This means you need to install _everything_ you need to get running. It means no package manager. It means it is truly as barebones as it can get.

Let's build a Node.js distroless image.

```dockerfile
# build stage
FROM node:20 AS node-builder
WORKDIR /build
COPY package-lock.json package.json ./
RUN npm ci
COPY . .

# runtime stage
FROM gcr.io/distroless/nodejs20
COPY --from=node-builder --chown=node:node /build /app
WORKDIR /app
CMD ["index.js"]
```

[⛓️ Link to the Dockerfile][dockerfile-file]

```bash
docker build -t my-distroless .
docker run -it -p 8080:8080 --name my-app --rm --init my-distroless
```

The size (according to my computer) was about 175MB, so not necessarily any smaller than Alpine, but it is indeed using a Debian-derivative Linux instead of Alpine which does exclude a class of rare-but-possible bugs! These days I tend to use Distroless images but honestly I'm fine with anything you choose here. Probably by the time you _need_ something other than an Alpine image you will have 100x surpassed my knowledge and skills with containers or have a whole dev ops org to attend to these nuances.

One note with the Dockerfile: notice we _just_ give it the Node.js file and _not_ the Node.js command. The Distroless container locks it down so it can only run Node.js apps and cannot be given any other command. Just another way they are hyper-focused for security in production.

[blog]: https://martinheinz.dev/blog/92
[wolfi]: https://wolfi.dev
[distroless]: https://github.com/GoogleContainerTools/distroless
[ubi]: https://catalog.redhat.com/software/base-images
[node-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/distroless/index.js
[dockerfile-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/distroless/Dockerfile
