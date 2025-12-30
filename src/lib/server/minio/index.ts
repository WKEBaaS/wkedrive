import { env } from '$env/dynamic/private';
import * as minio from 'minio';

let minioClient: minio.Client | null;

export const getMinIOClient = () => {
  if (minioClient) return minioClient;

  minioClient = new minio.Client({
    endPoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    accessKey: env.S3_ACCESS_KEY_ID,
    secretKey: env.S3_SECRET_ACCESS_KEY,
    useSSL: env.S3_USE_SSL?.toLowerCase() === 'true',
  });

  return minioClient;
};
