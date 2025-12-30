import { auth } from './auth';
import { getMinIOClient } from './minio';
import { postgrestClient } from './postgrest';

export { auth, getMinIOClient, postgrestClient as postgrest };
