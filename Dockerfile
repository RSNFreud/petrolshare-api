FROM node:16-alpine

WORKDIR /build
COPY package.json package-lock.json views/* index.js /build/
RUN npm ci
CMD ["node", "."]