# 1. Base Image: Official, lightweight Node.js Alpine image (Requirement 1)
FROM node:20-alpine
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm install --only=production
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD [ "node", "server.js" ]