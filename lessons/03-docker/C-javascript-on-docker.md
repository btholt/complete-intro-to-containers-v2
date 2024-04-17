---
---

## Node.js on Containers

So now what if we wanted to run a container that has Node.js in it? The default Ubuntu container doesn't have Node.js installed. Let's use a different container!

```bash
docker run -it node:20
```

The version here is we're using is Node.js version 20. If you run this as-is, it'll drop you directly into Node.js. What version of Linux do you think this is? Let's find out!

```bash
docker run -it node:20 cat /etc/issue
```

It's Debian! They made a choice to choose Debian which is a perfectly great distro to use (it's what Ubuntu is based on.)

What if we wanted to be dropped into bash of that container? Easy! You already know how!

```bash
docker run -it node:20 bash
```

Remember, after we identify the container ([node][node]), anything we put after get's evaluated instead of the default command identified by the container (in the container `node`'s case, it runs the command `node` by default). This allows us to run whatever command we want! In this case, we're exectuing `bash` which puts us directly into a bash shell.

We'll get into later how to select which Linux distros you should use but for now this is just a fun exercise.

Just for fun, let's try one of the other Linux distros that you can use with Node.js

```bash
docker run -it node:20-alpine cat /etc/issue
```

This one still has Node.js version 20 on it but it's using a much slimmer version of Linux on it, Alpine. We'll talk a lot about Alpine later but know that it's possible.

## Deno

```bash
docker run -it denoland/deno:centos-1.42.4
docker run -it denoland/deno:centos-1.42.4 deno
```

This will allow you to run the alternative to Node.js JavaScript runtime, Deno. This command should log out "Welcome to Deno!" and then exit.

This operating system is another good candiate for your Linux distro for you containers, CoreOS which is a Fedora/IBM product.

The second command will actually get you into the Deno REPL to play around with Deno.

## Bun

```bash
docker run -it oven/bun:1.1.3 bun repl
docker run -it oven/bun:1.1.3 cat /etc/issue
```

Like above, the first command will get you into Bun, another JS runtime based on Safari's JavaScript engine JavaScriptCore (as opposed to Chrome's V8.)

The second command will let you see that by default Bun uses Debian.

## A few other runtimes

```bash
# you don't have to run all of these, just wanted to show you the variety of what's available
docker run -it ruby:3.3
docker run -it golang:1.22.2
docker run -it rust:1.77.2
docker run -it php:8.2
docker run -it python:3.12.3
```

Here's just a few but as you can imagine, just about every run time has a pre-made container for them. And in the case yours doesn't, I'll show you how to make it!

[node]: https://hub.docker.com/_/node
