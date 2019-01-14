FROM alekzonder/puppeteer
LABEL maintainer="Nicolas Degardin <degardin.n@gmail.com>"

USER root

RUN npm i -g node-options

RUN mkdir -p /srv
WORKDIR /srv

RUN npm link node-options
RUN npm link puppeteer

COPY files/boozang.js /srv/boozang.js
RUN chmod a+x /srv/boozang.js
RUN chown -R node:node /srv
RUN mkdir -p /var/boozang
RUN chmod a+rw /var/boozang
RUN ln -s /srv/boozang.js /sbin/boozang

VOLUME /var/boozang

USER node

ENTRYPOINT ["boozang"]