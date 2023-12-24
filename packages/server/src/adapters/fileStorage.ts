import * as Minio from 'minio'
import { v4 as uuid } from 'uuid';

export type SignedUrl = {
  bucket: string;
  key: string;
  url: string;
}

export type FileStorageAdapter = {
  generateSignedGetUrl: (params: {
    bucket: string;
    key: string;
  }) => Promise<SignedUrl | undefined>;
  generateSignedPutUrl: (params: {
    bucket: string
  }) => Promise<SignedUrl | undefined>;
};

export const initFileStorageAdapter = (): FileStorageAdapter => {
  const minio = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: 'minio_user',
    secretKey: 'minio_password',
  });

  return {
    async generateSignedGetUrl({ bucket, key }) {
      try {
       const url = await minio.presignedGetObject(bucket, key);
       return { bucket, key, url };
      } catch {
        return undefined;
      }
    },
    async generateSignedPutUrl({ bucket }) {
      try {
        const key = uuid();
        const url = await minio.presignedPutObject(bucket, key);
        return { bucket, key, url };
      } catch {
        return undefined;
      }
    },
  };
};
