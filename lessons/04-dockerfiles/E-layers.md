---
---

Go make any change to your Node.js app. Now re-run your build process. Docker is smart enough to see the your `FROM`, `RUN`, and `WORKDIR` instructions haven't changed and wouldn't change if you ran them again so it uses the same layers it cached from the previous but it can see that your `COPY` is different since files changed between last time and this time, so it begins the build process there and re-runs all instructions after that. Pretty smart, right? This is the same mechanism that Docker uses when you pull a new container to download it in pieces. Each one of those corresponds to a layer.

So which part of container-building takes the longest? `RUN npm ci`. Anything that has to hit the network is going to take the longest without-a-doubt. The shame is that our `package.json` hasn't changed since the previous iteration; we just changed something in our `index.js`. So how we make it so we only re-run our `npm ci` when package.json changes? Break it into two `COPY` instructions!

```Dockerfile
FROM node:20

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["node", "index.js"]
```

[⛓️ Link to the Dockerfile][dockerfile-file]

```bash
docker build -t layers .
docker run -it -p 8080:8080 --name my-app --rm --init layers
```

The first `COPY` pulls just the `package.json` and the `package-lock.json` which is just enough to do the `npm ci`. After that we nab the rest of the files. Now if you make changes you avoid doing a full npm install. This is useful and recommended for any dependency installation: apt-get, pip, cargo, gems, etc. as well as any long-running command like building some from source.

[dockerfile-file]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/layers/Dockerfile
