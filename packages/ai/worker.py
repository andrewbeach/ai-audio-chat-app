from minio import Minio
import pika

print(' [*] Connecting to server ...')
connection = pika.BlockingConnection(pika.ConnectionParameters(
    host='localhost',
    port=5672
))
channel = connection.channel()
channel.queue_declare(queue='audio-file-queue', durable=True)

print(' [*] Waiting for messages.')

mineo = Minio(
    "play.minio.io:9000",
    access_key="Q3AM3UQ867SPQQA43P2F",
    secret_key="zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG",
    region="my-region",
)

def callback(ch, method, properties, body):
    print(" [x] Received %s" % body)
    cmd = body.decode()

    if cmd == 'hey':
        print("hey there")
    elif cmd == 'hello':
        print("well hello there")
    else:
        print("sorry I did not understand ", body)

    print(" [x] Done")

    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='audio-file-queue', on_message_callback=callback)
channel.start_consuming()
