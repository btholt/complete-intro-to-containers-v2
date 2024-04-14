---
title: cgroups
---

Okay, so now we've hidden the processes from Eve so Bob and Alice can engage in commerce in privacy and peace. So we're all good, right? They can no longer mess each other, right? Not quite. We're almost there.

So now say it's Black Friday, Boxing Day or Singles' Day (three of the biggest shopping days in the year, pick the one that makes the most sense to you 😄) and Bob and Alice are gearing up for their biggest sales day of the year. Everything is ready to go and at 9:00AM their site suddenly goes down without warning. What happened!? They log on to their chroot'd, unshare'd shell on your server and see that the CPU is pegged at 100% and there's no more memory available to allocate! Oh no! What happened?

The first explanation could be that Eve has her site running on another virtual server and simple logged on and ran a malicious script that ate up all the available resources so that Bob and Alice so that their sites would go down and Eve would be the only site that was up, increasing her sales.

However another, possibly more likely explanation is that both Bob's and Alice's sites got busy at the same time and that in-and-of-itself took all the resources without any malice involved, taking down their sites and everyone else on the server. Or perhaps Bob's site had a memory leak and that was enough to take all the resources available.

Suffice to say, we still have a problem. Every isolated environment has access to all _physical_ resources of the server. There's no isolation of physical components from these environments.

Enter the hero of this story: cgroups, or control groups. Google saw this same problem when building their own infrastructure and wanted to protect runaway processes from taking down entire servers and made this idea of cgroups so you can say "this isolated environment only gets so much CPU, so much memory, etc. and once it's out of those it's out-of-luck, it won't get any more."

This is a bit more difficult to accomplish but let's go ahead and give it a shot.

> cgroups v2 is now the standard. Run `grep -c cgroup /proc/mounts` in your terminal. If the number that is **greater than one**, the system you're using is cgroups v1. [Click here][move-to-v2] if you want to try to get your system from cgroup v1 to v2. As this is fairly involved, I would just suggest using a more recent version of Ubuntu as it will have cgroups v2 on it.
>
> If you want to learn cgroups v1 (which I would not suggest, they're getting phased out), [the first version of this course][v1] teaches them.

cgroups as we have said allow you to move processes and their children into groups which then allow you to limit various aspects of them. Imagine you're running a single physical server for Google with both Maps and GMail having virtual servers on it. If Maps ships an infinite loop bug and it pins the CPU usage of the server to 100%, you only want Maps to go down and _not_ GMail just because it happens to be colocated with Maps. Let's see how to do that.

You interact with cgroups by a pseudo-file system. Honestly the whole interface feels weird to me but that is what it is! Inside your #2 terminal (the non-unshared one) run `cd /sys/fs/cgroup` and then run `ls`. You'll see a bunch of "files" that look like `cpu.max`, `cgroup.procs`, and `memory.high`. Each one of these represents a setting that you can play with with regard to the cgroup. In this case, we are looking at the root cgroup: all cgroups will be children of this root cgroup. The way you make your own cgroup is by creating a folder inside of the cgroup.

```bash
mkdir /sys/fs/cgroup/sandbox # creates the cgroup
ls /sys/fs/cgroup/sandbox # look at all the files created automatically
```

We now have a sandbox cgroup which is a child of the root cgroup and can putting limits on it! If we wanted to create a child of sandbox, as you may have guessed, just create another folder inside of sandbox.

Let's move our unshared environment into the cgroup. Every process belongs to exactly one cgroup. If you move a process to a cgroup, it will automatically be removed from the cgroup it was in. If we move our unshared bash process from the root cgroup to the sandbox cgroup, it will be removed from the root cgroup without you doing anything.

```bash
ps aux # Find your isolated bash PID, it's the bash one immediately after the unshare
cat /sys/fs/cgroup/cgroup.procs # should see the process in the root cgroup
echo <PID> > /sys/fs/cgroup/sandbox/cgroup.procs # puts the unshared env into the cgroup called sandbox
cat /sys/fs/cgroup/sandbox/cgroup.procs # should see the process in the sandbox cgroup
cat /sys/fs/cgroup/cgroups.proc # should see the process no longer in the root cgroup - processes belong to exactly 1 cgroup
```

We now have moved our unshared bash process into a cgroup. We haven't placed any limits on it yet but it's there, ready to be managed. We have a minor problem at the moment though that we need to solve.

```bash
cat /sys/fs/cgroup/cgroup.controllers # should see all the available controllers
cat /sys/fs/cgroup/sandbox/cgroup.controllers # there's no controllers
cat /sys/fs/cgroup/cgroup.subtree_control # there's no controllers enabled its children
```

You have to enable controllers for the children and none of them are enabled at the moment. You can see the root cgroup has them all enabled, but hasn't enabled them in its subtree_control so thus none are available in sandbox's controllers. Easy, right? We just add them to subtree_control, right? Yes, but one probelm: you can't add new subtree_control configs while the cgroup itself has processes in it. So we're going to create another cgroup, add the rest of the processes to that one, and then enable the subtree_control configs for the root cgroup.

```bash
mkdir /sys/fs/cgroup/other-procs # make new cgroup for the rest of the processes, you can't modify cgroups that have processes and by default Docker doesn't include any subtree_controllers

cat /sys/fs/cgroup/cgroups.proc # see all the processes you need to move, rerun each time after you add as it may move multiple processes at once due to some being parent / child
echo <PID> > /sys/fs/cgroup/other-procs/cgroup.procs # you have to do this one at a time for each process

echo "+cpuset +cpu +io +memory +hugetlb +pids +rdma" > /sys/fs/cgroup/cgroup.subtree_control # add the controllers

ls /sys/fs/cgroup/sandbox # notice how few files there are
cat /sys/fs/cgroup/sandbox/cgroup.controllers # all the controllers now available
ls /sys/fs/cgroup/sandbox # notice how many more files there are now
```

We did it! We went ahead and added all the possible controllers but normally you should just add just the ones you need. If you want to learn more about what each of them does, [the kernel docs are quite readable][kernel].

Let's get a third terminal going. From your host OS (Windows or macOS or your own Linux distro, not within Docker) run another `docker exec -it docker-host bash`. That way we can have #1 inside the unshared environment, #2 running our commands, and #3 giving us a visual display of what's going with `htop`, a visual tool for seeing what process, CPU cores, and memory are doing.

So, let's go three little exercises of what we can do with a cgroup. First let's make it so the unshared environment only has access to 80MB of memory instead of all of it.

```bash
apt-get install htop # a cool visual representation of CPU and RAM being used
htop # from #3 so we can watch what's happening

yes | tr \\n x | head -c 1048576000 | grep n # run this from #1 terminal and watch it in htop to see it consume about a gig of RAM and 100% of CPU core
kill -9 <PID of yes> # from #2, (you can get the PID from htop) to stop the CPU from being pegged and memory from being consumed
cat /sys/fs/cgroup/sandbox/memory.max # should see max, so the memory is unlimited
echo 83886080 > /sys/fs/cgroup/sandbox/memory.max # set the limit to 80MB of RAM (the number is 80MB in bytes)
yes | tr \\n x | head -c 1048576000 | grep n # from inside #1, see it limit the RAM taken up; because the RAM is limited, the CPU usage is limited
```

I think this is very cool. We just made it so our unshared environment only has access to 80MB of RAM and so despite there being a script being run to literally just consume RAM, it was limited to only consuming 80MB of it.

However, as you saw, the user inside of the container could still peg the CPU if they wanted to. Let's fix that. Let's only give them 5% of a core.

```bash
yes > /dev/null # inside #1 / the cgroup/unshare – this will peg one core of a CPU at 100% of the resources available, see it peg 1 CPU
kill -9 <PID of yes> # from #2, (you can get the PID from htop) to stop the CPU from being pegged

echo '5000 100000' > /sys/fs/cgroup/sandbox/cpu.max # from #2 this allows the cgroup to only use 5% of a CPU
yes > /dev/null # inside #1 / the cgroup/unshare – this will peg one core of a CPU at 5% since we limited it
kill -9 <PID of yes> # from #2, to stop the CPU from being pegged, get the PID from htop
```

Pretty cool, right? Now, no matter how bad of code we run inside of our chroot'd, unshare'd, cgroup'd environment, we cannot take more than 5% of a CPU core.

One more demo, the dreaded [fork bomb][fork-bomb]. A fork bomb is a script that forks itself into multiple processes, which then fork themselves, which them fork themselves, etc. until all resources are consumed and it crashes the computer. It can be written plainly as

```bash
fork() {
    fork | fork &
}
fork
```

but you'll see it written as `:(){ :|:& };:` where `:` is the name of the function instead of `fork`.

So someone could run a fork bomb on our system right now and it'd limit the blast radius of CPU and RAM but creating and destroying so many processes still carries a toll on the system. What we can do to more fully prevent a fork bomb is limit how many PIDs can be active at once. Let's try that.

```bash
cat /sys/fs/cgroup/sandbox/pids.current # See how many processes the cgroup has at the moment
cat /sys/fs/cgroup/sandbox/pids.max # See how many processes the cgroup can create before being limited (max)
echo 3 > /sys/fs/cgroup/sandbox/pids.max # set a limit that the cgroup can only run 3 processes at a time
for a in $(seq 1 5); do sleep 15 & done # this runs 5 15 second processes that run and then stop. run this from within #2 and watch it work. now run it in #1 and watch it not be able to. it will have to retry several times

:(){ :|:& };: # DO NOT RUN THIS ON YOUR COMPUTER. This is a fork bomb. If not accounted for, this would bring down your computer. However we can safely run inside our #1 because we've limited the amount of PIDs available. It will end up spawning about 100 processes total but eventually will run out of forks to fork.
```

Attack prevented! 3 processes is way too few for anyone to do anything meaningful but by limiting the max PIDs available it allows you to limit what damage could be done. I'll be honest, this is the first time I've run a fork bomb on a computer and it's pretty exhilirating. I felt like I was in the movies Hackers. [Hack the planet!][hackers].

And now we can call this a container. You have handcrafted a container. A container is literally nothing more than we did together. There's other sorts of technologies that will accompany containers like runtimes and daeomons, but the containers themselves are just a combination of chroot, namespaces, and cgroups! Using these features together, we allow Bob, Alice, and Eve to run whatever code they want and the only people they can mess with is themselves.

So while this is a container at its most basic sense, we haven't broached more advance topics like networking, deploying, bundling, or anything else that something like Docker takes care of for us. But now you know at its most base level what a container is, what it does, and how you _could_ do this yourself but you'll be grateful that Docker does it for you. On to the next lesson!

[move-to-v2]: https://medium.com/@charles.vissol/cgroup-v2-in-details-8c138088f9ba#aa07
[v1]: https://btholt.github.io/complete-intro-to-containers/cgroups
[kernel]: https://docs.kernel.org/admin-guide/cgroup-v2.html#controllers
[fork-bomb]: https://en.wikipedia.org/wiki/Fork_bomb
[hackers]: https://youtu.be/Rn2cf_wJ4f4
