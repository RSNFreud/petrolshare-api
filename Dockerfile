FROM node:16-alpine

WORKDIR /build
COPY . /build/
RUN npm ci
CMD ["node", "."]