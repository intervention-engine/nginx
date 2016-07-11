nginx Configuration for Intervention Engine
===========

This repository contains the `nginx.conf`, `Dockerfile`, and compiled Ember application for deploymenet of Intervention Engine in Docker with nginx as the application entrypoint and reverse proxy to Intervention Engine backend services.

nginx.conf
------
`nginx.conf` is the nginx configuration file. It uses Docker environment variables to configure the reverse proxy. It also contains references to an `ssl` directory that should contain the `nginx.cert` and `nginx.key` files. These can be self signed or obtained from a Certificate Authority (note that if they are self signed, the users browser will warn them of possible man in the middle attacks).

The configuration also references an `htpasswd` file in the top level of this repository. This should be generated and appended to by running the following command in this directory:

```
sudo htpasswd -c htpasswd exampleuser
```

Dockerfile
------
`Dockerfile` is the Docker configuration file for the `nginx` container. It builds the container based on the `nginx` image on Docker Hub, then copies the relevant files from this repository into the container, and exposes port 443 for https connections.

dist
------
`dist` contains the compiled frontend application.
