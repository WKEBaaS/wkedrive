import * as minio from 'minio';
import { env } from '$env/dynamic/private';

const endpoint = new URL(env.S3_ENDPOINT);

export const minioClient = new minio.Client({
	endPoint: endpoint.hostname,
	region: env.S3_REGION,
	accessKey: env.S3_ACCESS_KEY_ID,
	secretKey: env.S3_SECRET_ACCESS_KEY,
	useSSL: endpoint.protocol === 'https:',
});
