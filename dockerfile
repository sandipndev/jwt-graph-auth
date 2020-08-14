FROM node:slim
LABEL maintainer="help@quinch.co.in"
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN yarn build
RUN cp -r dist ../
RUN rm -rf *
RUN mv ../dist .
CMD ["node", "dist/bundle.js"]