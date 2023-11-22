FROM golang:1.21.3-alpine
WORKDIR /usr/src/app
COPY . .
RUN go build
EXPOSE 8090
CMD [ "your executable path"]
