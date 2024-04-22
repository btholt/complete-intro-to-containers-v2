---
---

Next tool we're going to use is one called [Kompose][kompose]. I'm showing you this tool because it's how I start out with Kubernetes when I have a project that I want to use with it. Kompose converts a docker-compose.yml configuration to a Kubernetes configuration. I find this to much more approachable than starting with the myriad configurations you need to get Kubernetes going.

[Click here][install-kompose] to see how to install Kompose on your platform. I did `brew install kompose` with Homebrew.

So first let's modify our docker-compose.yml a bit to make it work for Kompose.

```yml
services:
  api:
    build: api
    ports:
      - "8080:8080"
    links:
      - db
    depends_on:
      - db
    environment:
      MONGO_CONNECTION_STRING: mongodb://db:27017
    labels:
      kompose.service.type: nodeport
      kompose.image-pull-policy: Never
  db:
    image: mongo:7
    ports:
      - "27017:27017"
  web:
    build: web
    links:
      - api
    depends_on:
      - api
    labels:
      kompose.service.type: LoadBalancer
      kompose.service.expose: true
      kompose.image-pull-policy: Never
    ports:
      - "8081:80"
```

[⛓️ Link to the project][project]

> I went ahead here and modified the NGINX config to handle all inbound traffic. We could expose two services but in reality we want NGINX to be our front door and then allow our API to scale independently. I also modified the Node.js app to have correct paths relative to NGINX routes.

We add the `NodePort` type to the api service so that we can scale this part of our infra up and Kubernetes will make it bind to different ports. Any app can reach api on 8080 but we can have 50 scaled up instances that it's spreading across.

We add the `LoadBalancer` label to web so that Kubernetes will know to expose this particular service to the outside world. What this actually does for you is it spins up a loadbalancer that will distribute the load amongst all of your running pods. Do note tha this one of three ways to expose a service to outside world (by default everything is only expose internally). The other two are NodePort and using an ingress controller. [This is a great explainer][ingress] if you're curious. For now LoadBalancer is perfect. It's actually just a NodePort under the hood in Kubernetes but once you deploy to GCP, AWS, or Azure they'll use their own flavor of load balancer for you. You can also handle this yourself but that's _way_ outside the scope of this course.

Lastly, we need to explicit about the port MongoDB exposes. Locally Docker was able to take care of it but Kubernetes needs us to be super explicity of what's exposed and what's not.

> They used to let you do `kompose up` but now they don't. You have to convert the config and then apply the configs.

```bash
kompose convert --build local
```

Okay, now that you've done this, run

```bash
kubectl apply -f '*.yaml'
```

> If you see an error, make sure you have the quotes, they're needed, and make sure that your docker-compose.yml file doesn't have .yaml for its extension.

To get a bird's eye view of everything running, run `kubectl get all` to see everything happening. Critically, we want to see STATUS: Running on all three of our services. If you're seeing something like ErrImagePull or something like that, it means your containers probably aren't pulling locally and you'll need to debug that.

Let's do some Kubernetes magic now. Run `kubectl scale --replicas=5 deployment/api` and run `kubectl get all`. Just like that, you have five instances of our Node.js app running and Kubernetes smartly routing traffic to each. If one of them becomes unhealthy, Kubernetes will automatically tear it down and spin up a new one. By setting up Kubernetes, you get a lot of cool stuff for free. If you're computer is starting to warm up, feel free to run `kubectl scale --replicas=1 deployment/api` to scale down. You can scale the database the same way too but the loadbalancer won't do it but again that's because Kubernetes expects the cloud provider to do that for you.

Once you're done toying, run `kubectl delete all --all`. This will tear down everything.

## To the cloud!

What's super fun is that kubectl is the same tool you'd use to control your production deployment. So everything you just learn would work against Azure, AWS, GCP, etc. All you have to do is change the context from minikube or docker-desktop to Azure, AWS, or GCP. I'm not going to do that but I'll drop the tutorials here so you can play around yourself. Do note these are often not free and if you're not careful, Kubernetes can get expensive!

- [Azure AKS][aks]
- [Amazon EKS][aws]
- [Google GKE][gcp]

[ingress]: https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
[localhost]: http://localhost:3000
[aks]: https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough
[aws]: https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html
[gcp]: https://cloud.google.com/kubernetes-engine/docs/quickstart
[kompose]: https://kompose.io/
[install-kompose]: https://kompose.io/installation/
[project]: https://github.com/btholt/project-files-for-complete-intro-to-containers-v2/blob/main/kubernetes
