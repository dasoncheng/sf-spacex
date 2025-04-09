FROM m.daocloud.io/docker.io/library/node:20.15.1

# Set the timezone to Asia/Shanghai (UTC+8)
RUN echo "Asia/Shanghai" > /etc/timezone

ADD . /app
VOLUME /app/public
WORKDIR /app
RUN npm install --omit=dev --registry=https://registry.npmmirror.com && npm run generate
EXPOSE 3000
CMD [ "env", "TZ=Asia/Shanghai", "node", "." ]
