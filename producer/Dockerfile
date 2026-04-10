FROM gradle:8.7-jdk17

WORKDIR /app
COPY . /app

RUN gradle :app:installDist --no-daemon

CMD ["/app/app/build/install/app/bin/app"]