FROM node:14.9-buster-slim
RUN useradd -rm -d /home/djp -s /bin/bash -g root -G sudo -u 1001 djp
RUN apt-get update
USER djp
RUN mkdir -p /home/djp/telemetry
ADD src /home/djp/telemetry
WORKDIR /home/djp/telemetry
RUN npm install
CMD ["node", "app.js", "&"]