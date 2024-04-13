---
title: cgroups
---

### TODO - This is the valid cgroup2 code

```bash

grep -c cgroup /proc/mounts # if this is greater than 0, then you're on cgroups v1 and this won't work

mkdir /sys/fs/cgroup/sandbox # creates the cgroup

# Find your PID, it's the bash one immediately after the unshare
cat /sys/fs/cgroup/cgroups.proc # should see the process in the root cgroup
echo <PID> > /sys/fs/cgroup/sandbox/cgroup.procs # puts the unshared env into the cgroup called sandbox
cat /sys/fs/cgroup/sandbox/cgroup.proc # should see the process in the sandbox cgroup

cat /sys/fs/cgroup/cgroups.proc # should see the process no longer in the root cgroup - processes belong to exactly 1 cgroup
mkdir /sys/fs/cgroup/other-procs # make new cgroup for the rest of the processes, you can't modify cgroups that have processes and by default Docker doesn't include any subtree_controllers
echo <PID> > /sys/fs/cgroup/other-procs/cgroup.procs # you have to do this one at a time for each process

cat /sys/fs/cgroup/sandbox/cgroup.controllers # no controllers
cat /sys/fs/cgroup/cgroup.controllers # should see all the available controllers
echo "+cpuset +cpu +io +memory +hugetlb +pids +rdma" > /sys/fs/cgroup/cgroup.subtree_control # add the controllers
cat /sys/fs/cgroup/sandbox/cgroup.controllers # all the controllers now available

### Peg the CPU

apt-get install htop # a cool visual representation of CPU and RAM being used
htop

yes > /dev/null # inside #1 / the cgroup/unshare – this will peg one core of a CPU at 100% of the resources available, see it peg 1 CPU
kill -9 <PID of yes> # from #2, (you'll have to stop htop with CTRL+C) to stop the CPU from being pegged
htop

echo '5000 100000' > /sys/fs/cgroup/sandbox/cpu.max # this allows the cgroup to only use 5% of a CPU
yes > /dev/null # inside #1 / the cgroup/unshare – this will peg one core of a CPU at 5% since we limited it
kill -9 <PID of yes> # from #2, to stop the CPU from being pegged
htop

### Limit memory

yes | tr \\n x | head -c 1048576000 | grep n # run this from #3 terminal and watch it in htop to see it consume about a gig of RAM and 100% of CPU core, CTRL+C to stop it
cat /sys/fs/cgroup/sandbox/memory.max # should see max, so the memory is unlimited
echo 83886080 > /sys/fs/cgroup/sandbox/pids.max # set the limit to 80MB of RAM
yes | tr \\n x | head -c 1048576000 | grep n # from inside #1, see it limit both the CPU and the RAM taken up

### Stop fork bombs

cat /sys/fs/cgroup/sandbox/pids.current # See how many processes the cgroup has at the moment
cat /sys/fs/cgroup/sandbox/pids.max # See how many processes the cgroup can create before being limited (max)
echo 5 > /sys/fs/cgroup/sandbox/pids.max # set a limit that the cgroup can only run 5 processes
for a in $(seq 1 5); do sleep 60 & done # this runs 5 60 second processes that run and then stop. run this from within #2 and watch it work. now run it in #1 and watch it not be able to.

:(){ :|:& };: # DO NOT RUN THIS ON YOUR COMPUTER. This is a fork bomb. If not accounted for, this would bring down your computer. However we can safely run inside our #1 because we've limited the amount of PIDs available. It will end up spawning about 100 processes total but eventually will run out of forks to fork.

```

### END TODO - below is the old cgroup1 code

Okay, so now we've hidden the processes from Eve so Bob and Alice can engage in commerce in privacy and peace. So we're all good, right? They can no longer mess each other, right? Not quite. We're almost there.

So now say it's Black Friday, Boxing Day or Singles' Day (three of the biggest shopping days in the year, pick the one that makes the most sense to you 😄) and Bob and Alice are gearing up for their biggest sales day of the year. Everything is ready to go and at 9:00AM their site suddenly goes down without warning. What happened!? They log on to their chroot'd, unshare'd shell on your server and see that the CPU is pegged at 100% and there's no more memory available to allocate! Oh no! What happened?

The first explanation could be that Eve has her site running on another virtual server and simple logged on and ran a malicious script that ate up all the available resources so that Bob and Alice so that their sites would go down and Eve would be the only site that was up, increasing her sales.

However another, possibly more likely explanation is that both Bob's and Alice's sites got busy at the same time and that in-and-of-itself took all the resources without any malice involved, taking down their sites and everyone else on the server. Or perhaps Bob's site had a memory leak and that was enough to take all the resources available.

Suffice to say, we still have a problem. Every isolated environment has access to all _physical_ resources of the server. There's no isolation of physical components from these environments.

Enter the hero of this story: cgroups, or control groups. Google saw this same problem when building their own infrastructure and wanted to protect runaway processes from taking down entire servers and made this idea of cgroups so you can say "this isolated environment only gets so much CPU, so much memory, etc. and once it's out of those it's out-of-luck, it won't get any more."

This is a bit more difficult to accomplish but let's go ahead and give it a shot.

``bash

# in #2, outside of unshare'd environment get the tools we'll need here

apt-get install -y cgroup-tools htop

# create new cgroups

cgcreate -g cpu,memory,blkio,devices,freezer:/sandbox

# add our unshare'd env to our cgroup

ps aux # grab the bash PID that's right after the unshare one
cgclassify -g cpu,memory,blkio,devices,freezer:sandbox <PID>

# list tasks associated to the sandbox cpu group, we should see the above PID

cat /sys/fs/cgroup/cpu/sandbox/tasks

# show the cpu share of the sandbox cpu group, this is the number that determines priority between competing resources, higher is is higher priority

cat /sys/fs/cgroup/cpu/sandbox/cpu.shares

# kill all of sandbox's processes if you need it

# kill -9 $(cat /sys/fs/cgroup/cpu/sandbox/tasks)

# Limit usage at 5% for a multi core system

cgset -r cpu.cfs_period_us=100000 -r cpu.cfs_quota_us=$[ 5000 * $(getconf _NPROCESSORS_ONLN) ] sandbox

# Set a limit of 80M

cgset -r memory.limit_in_bytes=80M sandbox

# Get memory stats used by the cgroup

cgget -r memory.stat sandbox

# in terminal session #2, outside of the unshare'd env

htop # will allow us to see resources being used with a nice visualizer

# in terminal session #1, inside unshared'd env

yes > /dev/null # this will instantly consume one core's worth of CPU power

# notice it's only taking 5% of the CPU, like we set

# if you want, run the docker exec from above to get a third session to see the above command take 100% of the available resources

# CTRL+C stops the above any time

# in terminal session #1, inside unshare'd env

yes | tr \\n x | head -c 1048576000 | grep n # this will ramp up to consume ~1GB of RAM

# notice in htop it'll keep the memory closer to 80MB due to our cgroup

# as above, connect with a third terminal to see it work outside of a cgroup

``

And now we can call this a container. Using these features together, we allow Bob, Alice, and Eve to run whatever code they want and the only people they can mess with is themselves.

So while this is a container at its most basic sense, we haven't broached more advance topics like networking, deploying, bundling, or anything else that something like Docker takes care of for us. But now you know at its most base level what a container is, what it does, and how you _could_ do this yourself but you'll be grateful that Docker does it for you. On to the next lesson!
