import { auth } from './auth';
import { postgrestClient } from './postgrest';
import { minioClient } from './minio';

export { auth, minioClient as minio, postgrestClient as postgrest };
