---
description: >-
  Understanding the usage and limitations of the `EXPOSE` instruction in Docker,
  its intended purpose to expose container ports to the host machine, and the
  optional `-P` flag for mapping ports to random host ports. Considerations
  include documentation benefits and deliberate port mapping.
keywords:
  - Docker EXPOSE instruction
  - Docker port mapping
  - Dockerfile port documentation
---

This was a point of confusion for me so I'm going to try to clear it up for you. There is an instruction called `EXPOSE <port number>` that its intended use is to expose ports from within the container to the host machine. However if we don't do the `-p 3000:3000` it still isn't exposed so in reality this instruction doesn't do much. You don't need `EXPOSE`.

There are two caveats to that. The first is that it could be useful documentation to say that "I know this Node.js service listens on port 3000 and now anyone who reads this Docekrfile will know that too." I would challenge this that I don't think the Dockerfile is the best place for that documentation

The second caveat is that instead of `-p 3000:3000` you can do `-P`. This will take all of the ports you exposed using `EXPOSE` and will map them to random ports on the host. You can see what ports it chose by using `docker ps`. It'll say something like `0.0.0.0:32769->3000/tcp` so you can see in this case it chose `32769`. Again, I'd prefer to be deliberate about which ports are being mapped.
