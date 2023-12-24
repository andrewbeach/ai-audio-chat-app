default: 
  @just -l --list-prefix '· '

setup:
  cp .env.sample .env
  sudo echo "127.0.0.1 minio" >> /etc/hosts

add service package *flags:
  just packages/{{service}}/add {{package}} {{flags}}

up service *flags:
  docker compose up -d {{service}} {{flags}}

up-all:
  docker compose up -d

down service *flags:
  docker compose down {{service}} {{flags}}

tsc service *flags:
  just packages/{{service}}/tsc {{flags}}

test service *flags:
  just packages/{{service}}/test {{flags}}

server-gen:
  just packages/server/gen
