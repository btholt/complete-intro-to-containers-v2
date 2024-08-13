---
description: >-
  Learn how to build a front end website using Astro, React, TypeScript, and
  Tailwind with step-by-step instructions. Create a multi-stage Dockerfile to
  build and serve the project with NGINX, simplifying static file serving for
  your users.
keywords:
  - Astro
  - React
  - TypeScript
  - Tailwind
  - Dockerfile
  - NGINX
  - static assets
---

We're going to do a project now! Feel free to attempt the project first and then follow along with me as I code the answer.

We're going to construct a very basic front end website with Astro, React, TypeScript, and Tailwind. Why these? Because I want it to have a lot of dependencies and a big build step. This class isn't about any of these things but if you want to take a class on React, my [intro][intro] and [intermediate][intermediate] classes are available on Frontend Masters.

You have two choices here: you can either create your own Astro project with `npx create-astro@latest` or you can just use my copy of it. I added Tailwind and React to mine but you don't necessarily need to as it doesn't really affect building the project.

Also feel free to use your own static asset project or favorite static assets framework. As long as `npm run build` works and you make sure to get the path right for where the assets are to be served from, it doesn't matter.

[⛓️ Link to the Project][project]

> Do note I have the complete Dockerfile in there under `solution.Dockerfile`. Only glance at it once you've tried to build it yourself.

You should have your project ready to go now.

To make sure this works right now, run `npm run dev` in your console and make sure the app starts okay. You should see a splash screen. Once you're ready to build it, run `npm run build` to have it build for production.

The project is to make a multi-stage Dockerfile that build the project in one container and then serves it from a different container using NGINX. If you're not familiar with NGINX, fear not! It is a static file server, which is to say it take takes HTML, CSS, JS, images, fonts, etc. and serves them to your users. It handles all the serving and file headers for you. Using it can be accomplished in few steps. You'll use the `nginx:latest` (or `nginx:alpine`! up to you) container and copy **just the newly built files, not everything** (which is in the `dist` directory inside of the Astro app) to `/usr/share/nginx/html` and the `nginx` will take care of the rest. The `nginx` container defines `CMD` in it and if you don't override it, it starts NGINX for you. Give it a shot! Once you've tried, come back here and we'll do the solution together.

> NGINX runs on port 80 by default, so you probably want to route that something like 8080 on your host machine (otherwise you have to run it as root which no one wants to do.) In other words, use `-p 8080:80` when you start Docker.

Scroll down to see my answer.

<div style="height: 600px"></div>

Done? If you gave it a shot, your Dockerfile probably shouldn't very long. Let's see what I came up with

```Dockerfile
FROM node:20 AS node-builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# you could totally use nginx:alpine here too
FROM nginx:latest
COPY --from=node-builder /app/dist /usr/share/nginx/html
```

Now if you run this, it should work:

```bash
docker build -t my-static-app .
docker run -it -p 8080:80 --name my-app --rm --init my-static-app
```

It should be working now! Hooray! Hopefully you're starting to see the power of what Docker can unlock for you.

[intro]: https://frontendmasters.com/courses/complete-react-v8/
[intermediate]: https://frontendmasters.com/courses/intermediate-react-v5/
[project]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/static-asset-project
