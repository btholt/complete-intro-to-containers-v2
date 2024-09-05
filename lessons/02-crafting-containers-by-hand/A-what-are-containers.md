---
description: >-
  Understand the simplicity of containers by exploring how they leverage a few
  Linux kernel features for isolation, contrasting with managing bare metal
  servers or virtual machines. Discover the advantages and trade-offs associated
  with each approach, leading to the emergence of containers as a cost-effective
  and efficient solution for deploying code.
keywords:
  - containers
  - Linux kernel features
  - bare metal servers
  - virtual machines
  - resource management
  - security
  - deploying code
---

Containers are probably simpler than you think they are. Before I took a deep dive into what they are, I was very intimidated by the concept of what containers were. I thought they were for one super-versed in Linux and sysadmin-type activties. In reality, the core of what containers are is just a few features of the Linux kernel duct-taped together. Honestly, there's no single concept of a "container": it's just using a few features of Linux together to achieve isolation. That's it.

So how comfortable are you with the command line? This course doesn't assume wizardry with bash or zsh but this probably shouldn't be your first adventure with it. If it is, [check out my course on the command line and Linux][linux]. This course will give you more than we'll need to keep up with this course.

## Why Containers

Let's start with why first, why we need containers.

### Bare Metal

Historically, if you wanted to run a web server, you either set up your own or you rented a literal server somewhere. We often call this "bare metal" because, well, your code is literally executing on the processor with no abstraction. This is great if you're extremely performance sensitive and you have ample and competent staffing to take care of these servers.

The problem with running your servers on the bare metal is you become extremely inflexible. Need to spin up another server? Call up Dell or IBM and ask them to ship you another one, then get your tech to go install the physical server, set up the server, and bring it into the server farm. That only takes a month or two right? Pretty much instant. 😅

Okay, so now at least you have a pool of servers responding to web traffic. Now you just to worry about keeping the operating system up to date. Oh, and all the drivers connecting to the hardware. And all the software running on the server. And replacing the components of your server as new ones come out. Or maybe the whole server. And fixing failed components. And network issues. And running cables. And your power bill. And who has physical access to your server room. And the actual temperature of the data center. And paying a ridiculous Internet bill. You get the point. Managing your own servers is its own set of challenges and requires a whole team to do it.

### Virtual Machines

Virtual machines are the next step. This is adding a layer of abstraction between you and the metal. Now instead of having one instance of Linux running on your computer, you'll have multiple guest instances of Linux running inside of a host instance of Linux (it doesn't have to be Linux but I'm using it to be illustrative.) Why is this helpful? For one, I can have one beefy server and have it spin up and down virtual servers at will. So now if I'm adding a new service, I can just spin up a new VM on one of my servers (providing I have space to do so.) This allows a lot more flexibility.

Another thing is I can separate two VMs from each other on the same machine _totally_ from each other. This affords a few nice things.

1. Imagine both Coca-Cola and Pepsi lease a server from Microsoft to power their soda making machines and hence have the recipe on the server. Microsoft, wanting to be efficient, buys large physical servers and then allocates virtual servers to each of them. If Microsoft puts both of these virtual servers on the same physical server with no separation, one soda-maker could just connect into the server and browse the competitor's files and find the secret recipe. So this is a massive security problem.
1. Imagine one of the soda-makers discovers that they're on the same server as their competitor. They could drop a [fork bomb][fork-bomb] to devour all the resources their competitors' website was using and intentionally crash the server.
1. Much less nefariously, imagine an engineer at Coca-Cola shipped a bug that crashed the whole server. If there's no separation between the two virtual servers, his shipping a bug would also crash Pepsi's website, something they wouldn't be super happy about.

So enter VMs. These are individual instances of operating systems that as far as the OSes know, are running on bare metal themselves. The host operating system offers the VM a certain amount resources and if that VM runs out, they run out and they don't affect other guest operating systems running on the server. If someone else crashes their server, they crash their guest OS and yours hums along unaffected. And since they're in a guest OS, they can't peek into your files because their VM has no concept of any sibling VMs on the machine so it's much more secure.

All these above features come at the cost of a bit of performance. Running an operating system within an operating system isn't free. But in general we have enough computing power and memory that this isn't the primary concern. And of course, with abstraction comes ease at the cost of additional complexity. In this case, the advantages very much outweigh the cost most of the time.

### Public Cloud

So, as alluded to above, you can nab a VM from a public cloud provider like Microsoft Azure or Amazon Web Services. It will come with a pre-allocated amount of memory and computing power (often called virtual cores or vCores because their dedicated cores to your virtual machine.) Now you no longer have to manage the expensive and difficult business of maintaining a data center but you do have to still manage all the software of it yourself: Microsoft won't update Ubuntu for you (generally speaking, they might prompt you but you still have to worry about it) but they will make sure the hardware is up to date.

But now you have the great ability spin up and spin down virtual machines in the cloud, giving you access to resources with the only upper bound being how much you're willing to pay. And we've been doing this for a while. But the hard part is they're still just giving you machines, you have to manage all the software, networking, provisioning, updating, etc. for all these servers. And lots of companies still do! Tools like Terraform, Chef, Puppet, Salt, etc. help a lot with things like this because they can make spinning up new VMs easy because they can handle the software needed to get it going.

We're still paying the cost of running a whole operating system in the cloud inside of a host operating system. It'd be nice if we could just run the code inside the host OS without the additional expenditure of guest OSs.

### Containers

And here we are, containers. As you may have divined, containers give us many of the security and resource-management features of VMs but without the cost of having to run a whole other operating system. Instead, they use chroot, namespaces, and cgroups to isolate and manage groups of processes. If this sounds a little flimsy to you and you're still worried about security and resource-management, you're not alone. But I assure you a lot of very smart people have worked out the kinks and containers are the future of deploying code.

So now that we've been through why we need containers, let's go through the three things that make containers a reality.

[fork-bomb]: https://en.wikipedia.org/wiki/Fork_bomb
[linux]: https://frontendmasters.com/courses/linux-command-line/
