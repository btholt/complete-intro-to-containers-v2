---
---

So far we've talking about taking an app and using containers to prepare the apps to run. This is an obvious use case for them and one you're going to use a lot. But let's talk about a different use case for them: building development environments for your apps.

Let's paint a picture. Let's say you got a new job with a company and they're a Ruby shop (if you know Ruby, pretend you don't for a sec.) When you arrive, you're going to be given a very long, likely-out-of-date, complicated README that you're going to have to go look for and struggle to set up the proper version of Ruby, the correct dependencies installed, and that Mercury is in retrograde (just kidding.) Suffice to say, it's a not-fun struggle to get new apps working locally, particularly if it's in a stack that you're not familiar with. Shouldn't there be a better way? There is! (I feel like I'm selling knives on an informercial.)

Containers! What we can do is define a Dockerfile that sets up all our dependencies so that it's 100% re-createable with zero knowledge of how it works to everyone that approaches it. With bind mounts, we can mount our local code into the container so that we can edit locally and have it propagate into the development container. Let's give it a shot!

## Ruby on Rails

I am not a Rails developer but I will confess I have always had an admiration for talented Rails developers. On one hand, I really don't like all the black magic that Rails entails. I feel like you whisper an arcane incantation into the CLI and on the other side a new website manifests itself from the ether. On the other hand, a really good Rails dev can make stuff so much faster than me because they can wield that sorcery so well.

So let's say we got added to a new Rails project and had to go set it up. Open this project in VS Code.

[⛓️ Link to the project][project]

If you do this in VS Code, it should show you a prompt in the bottom to reopen in a dev container. Say yes.

![VS Code UI showing a prompt to reopen in dev container](/images/dev-containers.jpg)

If you miss the notification or want to do it later, you can either do in the [Command Palette][command] with the command "Dev Containers: Open Workspace in Container" or with the `><` UI element in the bottom left of VS Code and clicking "Reopen in Container".

![VS Code UI showing a prompt to reopen in dev container](/images/vscode-ui.png)

This should build the container, setup all the Ruby dependencies and put you in a container. From here, you can open the terminal and see that you're now inside a Linux container. Run `rails server` and it will open the container and automatically forward the port for you to open `localhost:3000` in your own browser. There you go! Rails running without very little thought about it on our part. This is even running SQLite for us. You can make pretty complicated dev environments (using Docker Compose, we'll talk about that later), this was just a simple example.

Personally, this took a good 30 mins of messing around just to get set up, but with a dev container it was just instant, and that's kind of the magic: it's a ready-made dev environment to go.

> Just to be super clear, you dev containers and production containers will be different. You wouldn't want to ship your dev environment to production. So in these cases your project may have multiple Dockerfiles doing different things.

## Dev Containers Outside of VS Code

While dev containers is a decidedly Microsoft / GitHub initative to start up, they have opened it into an open standard and other companies can now use dev containers. Here's a few other tools that work with dev containers.

- [DevContainer CLI][cli] – Run dev containers from the CLI directly and then you can just use them without any IDE needed to manage it. Maintained by Microsoft and GitHub
- [Visual Studio][vs]
- [JetBrain IntelliJ][jetbrains]
- [GitHub Codespaces][gh] – Any time you open a project with a dev container in it in Codespaces, Codespaces will automatically use that dev container for you.

[project]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/dev-containers
[command]: https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette
[cli]: https://github.com/devcontainers/cli
[vs]: https://devblogs.microsoft.com/cppblog/dev-containers-for-c-in-visual-studio/
[jetbrains]: https://blog.jetbrains.com/idea/2023/06/intellij-idea-2023-2-eap-6/#SupportforDevContainers
[gh]: https://docs.github.com/en/codespaces/overview
