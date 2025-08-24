FROM golang:1.25.0-alpine
WORKDIR /usr/src/app
COPY . .
RUN go build
EXPOSE 8090
CMD [ "your executable path"]
