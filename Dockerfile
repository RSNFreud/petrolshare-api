FROM node:16-alpine

WORKDIR /build
COPY . .
COPY pages/* /build/
RUN npm ci
RUN npm run build
CMD ["node", "."]