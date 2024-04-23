So far we have only talked about Docker and there's a pretty good reason for that: for _personal_ use or _developer_ use, Docker is pretty much the indisputable champion. It has all the developer experience bells and whistles, all the mindshare of developers everywhere, and even all the other tools we are about to talk about like to tout their Docker compatability. However it good to keep in mind that Docker is a for-profit company and thus they are trying to align your incentives to there's and vice versa. It's good to know what else exists out there.

I don't have a lot of experience with any of these as I've exclusively used Docker my whole career, but I wanted to get these names out in front of you so you recognize what they are.

## Container Builders

This is what would replace `docker build`. What tools out there exist for building containers?

- [Buildah][buildah] – Generally can read a Dockerfile without any problems. It also has the neat ability to use hosts' package managers instead of having to include those inside your Docker container. Supported by Red Hat / IBM.

## Container Runtime Tools

This is what would replace `docker run`. This is the toolset that orchestrates the runtime that actually runs the container.

- [Podman][podman] – Docker relies on having a daemon (background process) in the background to run its containers. Think of it like a client and server. Podman is daemonless: it builds containers to be run directly by the host OS without a daemon in the middle. Podman also has Podman Compose for Docker Compose situations. Supported by Red Hat / IBM.
- [Colima][colima] – A project to make running container on macOS and Linux easier by cutting down on setup. Still uses Docker's tools under the hood, just a tool to make interacting with it easier.
- [rkt][rkt] – This was a project from CoreOS, who got bought by Red Hat, who got bought by IBM. Along the way rkt got deprecated so this project isn't maintained. Just wanted to mention it because my last course made mention of it.

## Container Runtimes

This is the actual code executing your container.

- [containerd][containerd] – So Docker actually uses containerd inside of it itself by default, but you can use containerd without Docker and you can use Docker with other Runtimes. containerd is a [CNCF][cncf] project that handles the running of containers, and Docker is a tool that wraps that to add all the Docker stuff on top of it. [Docker has a deeper discussion if you want to know more][docker-containerd].
- [gVisor][gvisor] – Google's container runtime with a particular focus on security. A hot topic at the moment, I see a lot of companies moving stuff to gVisor.
- [Kata][kata] – I know way less about Kata, but they use full-on VMs to separate their "containers" as opposed to just using container features to separate them. From reading their docs, their intent is to be mixed-and-matched with actual containers and only used for containers that need the strongest separation.

## Container Orchestrators

These are alternatives to Kubernetes (and somewhat Docker Compose)

- [Apache Mesos][mesos] – The less I say about Mesos the better as it's very complicated and it's a tool I don't know or use. It's been around for a long time and therefore has some core believers in it. It predates Kubernetes even. Apache actually tried to stop development on Mesos and people revolted so now they still maintain it.
- [Docker Swarm][swarm] – Before Kubernetes really won out, Docker was push Swarm hard, its own version of Kubernetes. Nowadays unless you're planning on using Swarm, use Compose and Kubernetes.
- [OpenShift][openshift] – OpenShift is Red Hat's layer on top of Kubernetes, so indeed it is using Kubernetes underneath the hood. It includes things in it that Kubernetes lacks like CI/CD.
- [Nomad][nomad] – I'm a big fan of Hashicorp and the products they've made. I think they do a great job making DevOps tools approachable by developers and that's why they're so popular. Nomad is a tool that takes Kubernetes and strips it down to the most-simple it can be.
- [Rancher][rancher] – A project by SUSE (the team who make SUSE Linux) that itself also wraps Kubernetes but with extras stuff in it.

## Desktop Apps

Alternatives to the Docker Desktop app.

- [Podman Desktop][podman-desktop] – Since Red Hat / IBM makes Podman to run containers, they made a desktop app like Docker Desktop to be able to use Podman and Buildah the same way.
- [Rancher Deskopt][rancher-desktop] – Rancher provides a desktop app like Docker Desktop to build and run containers for devs. Users Docker and [Rancher][rancher] and is maintained by SUSE (who make SUSE Linux.)

[podman]: https://podman.io/
[buildah]: https://buildah.io/
[podman-desktop]: https://podman-desktop.io/
[cncf]: https://www.cncf.io/
[containerd]: https://containerd.io/
[docker-containerd]: https://www.docker.com/blog/containerd-vs-docker/
[rkt]: https://github.com/rkt/rkt
[kata]: https://katacontainers.io/
[rancher-desktop]: https://rancherdesktop.io/
[rancher]: https://www.rancher.com/
[mesos]: https://mesos.apache.org/
[openshift]: https://docs.openshift.com/
[nomad]: https://www.nomadproject.io/
[gvisor]: https://gvisor.dev/
[swarm]: https://docs.docker.com/engine/swarm/
[colima]: https://github.com/abiosoft/colima
