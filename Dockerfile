FROM node:16-alpine

WORKDIR /build
COPY package.json package-lock.json index.js /build/
RUN npm ci
ENTRYPOINT node .