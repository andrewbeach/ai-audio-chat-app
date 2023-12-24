This is a chat application allowing users to send audio messages. Once the message is sent, the audio is transcribed using openai-whisper and updated live in the chat feed. 

## Running the app locally
Each package is dockerized, with a compose.yml file at the top level that defines how the full stack is to be run. I added `just setup` and `just up-all` tasks to handle this, but the manual steps without those commands are to:

1. Copy .env.sample to .env. In a real application, the .env contents would be distributed in a secure way.
2. Add minio to hosts (`sudo echo "127.0.0.1 minio" >> /etc/hosts"`). I found this necessary in order to use the presigned urls in a localhost browser ui session because minio generates the urls with the docker host name used on the server (minio), but this name is not known outside of docker.
3. Run `docker compose up -d` to build and run all services.

Once everything loads, the web ui will be available at localhost:3000/feed. All other service ports are defined in the compose.yml if you'd like to manually interact with the other services.

## Demo
![2023-12-24 10 23 07](https://github.com/andrewbeach/ai-audio-chat-app/assets/3936715/e29f2e2a-3748-440b-be49-22605eb1b469)
