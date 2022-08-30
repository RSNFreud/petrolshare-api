FROM node:16-alpine

WORKDIR /build
COPY package.json package-lock.json fail.html success.html index.js /build/
RUN npm ci
CMD ["node", "."]