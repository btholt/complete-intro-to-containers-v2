---
description: >-
  Learn about Docker Desktop, a convenient desktop app GUI to control Docker on
  your computer. Follow installation instructions for Windows, macOS, and Linux
  provided in the document. Understand system requirements, internet usage, and
  tools used in the course.
keywords:
  - Docker Desktop
  - installation instructions
  - system requirements
  - internet usage
  - tools FAQ
---

## Docker Desktop

Docker Desktop is a desktop app GUI that allows you to control Docker on your computer. You can definitely use Docker and containers without it but it's just a convenience to be able to turns things on and off with an app instead of trying to communicate with the daemon via their client. Suffice to say, at least for this course, please use Docker Desktop. It's free for individuals and small companies.

You will need to set up Docker Desktop if you haven't already.

- [Installation instructions for Microsoft Windows][windows] (if you're unsure, I suggest doing the WSL2 installation)
- [Installation instructions for Apple macOS][macos] (make sure to choose if you have an Intel or an Apple chip in your computer)
- [Installation instructions for Linux][linux]

Docker states on its website that it requires 4GB of RAM to run okay. I haven't tried it but that seems like it should be enough. 8GB would really put you in a comfortable spot.

For Windows developers, you'll either need to be on Windows 10 or 11. It doesn't matter what version (Home, Pro, Education, etc.) It used to matter but now Windows allows any version of Windows 10+ to use Docker. Please be sure to follow all the instructions carefully as you may have to do some stuff like enable virtualization and turn on WSL which aren't on by default. This course does not work on Windows 7 or 8 (or 9, lol.) You will see on the Windows page a bunch of information about what version of Windows you need for Windows containers – ignore that. We're not doing any Windows containers today, just Linux.

For Linux devs, they have instructions for Ubuntu, Debian, RHEL, and Fedora. They also list experimental support for Arch. If you're using something different than those, you're on your own. Generally if you're on Linux I'm going to assume you can translate my macOS instructions into Linux.

This course also assumes you are using an x64 processor or an Apple Silicon processor. This class is untested on 32 bit processors, other ARM, RISC, etc. processors. 

## Internet and Storage

This class will use a fair amount of bandwidth as containers can be quite large. Docker does a decent job of caching so once you've downloaded a container once it will cache its layers so you don't have to install it again. If you're on metered or slower Internet, be aware of that.

Also be aware the Docker can eat up your disk space pretty quickly. I have barely used Docker on my new computer and already it's using 2GB of storage with various images. Once Docker is running, run `docker image ls` to see what you have locally and type `docker image rm <image name>` to remove any that you don't want sticking around if you need to free up space. You can also do this from the Docker Desktop GUI.

## Tools FAQ

### What tools are your using?

- Visual Studio Code – I used to work at Microsoft on VS Code so it's no surprise that I'll be using it in this course. We'll also be using a few extensions that I'll call out as we get there.
- Firefox – I want more than Chromium to exist so I support Firefox where I can. Feel free to use any browser; it won't matter in this course.
- Terminal.app – I used to use iTerm2 and Hyper but in the end I appreciate how fast the default terminal is.

### What <font/theme/extension> are you using?

- Visual Studio Code
    - Dark+ Theme – It comes installed by default but it's not the default theme anymore. I'm so used to it that I can't switch.
    - [MonoLisa][monolisa] font – I like fonts and I look at it all day so I was okay paying for it. I have [ligatures][ligatures] enabled which is why you might see strange glyphs. If you want ligatures but don't want to pay, the linked ligature article has a few. I like Cascadia Code from Microsoft.
    - [vscode-icons][vscode-icons] – Lots of neat icons for VS Code and it's free.
- Terminal
    - zsh – It comes with macOS now and I'm _way_ too lazy to switch back to bash.
    - [Dracula theme][dracula] – I like the pastels. I would use it in VS Code too if Dark+ wasn't ingrained in my blood.
    - [Starship Prompt][starship] – Very cool prompt that's just pretty. Also shows you what sort of project you're in which is occasionally useful
    - [CaskaydiaCove Nerd Font][nerd] – This works with Starship prompt to give you the JS logos and all those extra glyphs. It's based on Cascadia Code.

### Can I use a different container engine than Docker for this course?

The short answer is no.

The slightly longer answer is noooo.

The longer answer is that it's likely _most_ of the course would work on something like podman or nerdctl but I'm not testing any of it so I'm sure you'll run into inconsistencies and I won't be able to help you with it. They're very valid and useful pieces of technology and you should try them but for this course let's stick to Docker.

[windows]: https://docs.docker.com/desktop/install/windows-install/
[macos]: https://docs.docker.com/desktop/install/mac-install/
[linux]: https://docs.docker.com/desktop/install/linux-install/
[ligatures]: https://worldofzero.com/posts/enable-font-ligatures-vscode/
[monolisa]: https://www.monolisa.dev/
[vscode-icons]: https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons
[dracula]: https://draculatheme.com/terminal
[starship]: https://starship.rs/
[nerd]: https://www.nerdfonts.com/font-downloads
