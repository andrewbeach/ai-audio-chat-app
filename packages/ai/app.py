import json
import os
import pika
from minio import Minio
import whisper

print(' [*] Connecting to server ...')
connection = pika.BlockingConnection(pika.ConnectionParameters(
    host='rabbitmq',
    port=5672,
))
print(connection)
channel = connection.channel()
channel.queue_declare(queue='audio-file-queue', durable=True)
channel.queue_declare(queue='ai-results-queue', durable=True)

print(' [*] Waiting for messages.')

minio = Minio(
    "minio:9000",
    access_key="minio_user",
    secret_key="minio_password",
    secure=False, # temp for working over http locally
    region="my-region",
)

def callback(ch, method, properties, body):
    print(" [x] Received %s" % body)

    parsed = json.loads(body)
    message_id = parsed['messageId']
    bucket = parsed['bucket']
    key = parsed['key']
    try:
      response = minio.get_object(bucket, key)

      model = whisper.load_model("base")
      local_file_path = "audio.webm"

      with open(local_file_path, "wb") as local_file:
        local_file.write(response.read())

      audio = whisper.load_audio("audio.webm")

      transcribed_result = model.transcribe(audio)

      # mel = whisper.log_mel_spectrogram(audio).to(model.device)
      # _, probs = model.detect_language(mel)

      # print(f"Detected language: {max(probs, key=probs.get)}")
      
      result = { 
        'messageId': message_id,
        'text': transcribed_result['text'], 
        'language': transcribed_result['language'],
      }
      channel.basic_publish(
        exchange="",
        routing_key="ai-results-queue",
        body=json.dumps(result),
      )

    except Exception as err: 
      print(f"Unexpected {err=}, {type(err)=}")

    finally:
      response.close()
      response.release_conn()
      ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='audio-file-queue', on_message_callback=callback)
channel.start_consuming()
