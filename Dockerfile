FROM alekzonder/puppeteer
LABEL maintainer="Nicolas Degardin <degardin.n@gmail.com>"

USER root

RUN npm i -g express pretty

RUN mkdir -p /srv
WORKDIR /srv

RUN npm link express
RUN npm link puppeteer
RUN npm link pretty

COPY files/boozang.js /srv/boozang.js
RUN chmod a+x /srv/boozang.js
RUN chown -R node:node /srv
RUN mkdir -p /var/boozang
RUN chmod a+rw /var/boozang

VOLUME /var/boozang

ENV DEVICE=
ENV TIMEOUT=
ENV FILE=
ENV TOKEN=
ENV SCREENSHOT=0

ENTRYPOINT ["/srv/boozang.js"]