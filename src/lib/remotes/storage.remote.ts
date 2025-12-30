import { command, form, getRequestEvent, query } from '$app/server';
import { env } from '$env/dynamic/private';
import { displaySize } from '$lib/components/ui/file-drop-zone';
import * as api from '$lib/server';
import {
  appErrorSchema,
  createStorageFolderSchema,
  deleteStorageObjectsSchema,
  getStorageFileSchema,
  storageObjectSchema,
  uploadStorageFileSchema,
} from '$src/lib/schemas';
import { error, invalid, isHttpError } from '@sveltejs/kit';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import * as v from 'valibot';
import {
  CREATE_STORAGE_FILE,
  CREATE_STORAGE_FOLDER,
  DELETE_STORAGE_OBJECTS,
  GET_STORAGE_FILE,
  GET_STORAGE_OBJECTS,
} from '../server/postgrest/endpoints';
import { getS3Path } from '../utils';
dayjs.extend(duration);

export const getStorageObjects = query(async () => {
  const event = getRequestEvent();

  if (!event.params.org_class_id) {
    error(400, 'Organization Class ID is required');
  }

  const token = await api.auth.fetchToken(event);
  try {
    const objects = await api.postgrest.get({
      endpoint: GET_STORAGE_OBJECTS,
      token: token,
      schema: v.array(storageObjectSchema),
      params: {
        p_org_class_id: event.params.org_class_id!,
        p_path: event.params.path ? `/${event.params.path}` : '/',
      },
    });
    return objects;
  } catch (e) {
    console.log('Error fetching storage objects:', e);
  }

  return [];
});

export const createStorageFolder = form(createStorageFolderSchema, async (data, issue) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  try {
    await api.postgrest.post({
      endpoint: CREATE_STORAGE_FOLDER,
      token: token,
      data: data,
    });

    const folderPath = getS3Path(data.p_org_class_id, data.p_path, data.p_name, 'folder');
    const minioClient = api.getMinIOClient();
    await minioClient.putObject(env.S3_BUCKET, folderPath, '');

    return { success: true };
  } catch (e) {
    if (!isHttpError(e)) {
      throw e;
    }

    const parsedError = v.safeParse(appErrorSchema, e.body);
    if (!parsedError.success) {
      throw e;
    }
    switch (parsedError.output.status) {
      case 409:
        invalid(issue.p_name(`A folder with this name already exists.`));
    }

    throw e;
  }
});

export const uploadStorageFile = form(uploadStorageFileSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  const { p_file, ...body } = data;
  await api.postgrest.post({
    endpoint: CREATE_STORAGE_FILE,
    token: token,
    data: {
      ...body,
      p_etag: null,
      p_size: displaySize(p_file.size),
    },
  });
  try {
    const buffer = Buffer.from(await data.p_file.arrayBuffer());
    const objectPath = getS3Path(data.p_org_class_id, data.p_path, data.p_file.name, 'file');
    const minioClient = api.getMinIOClient();

    await minioClient.putObject(env.S3_BUCKET, objectPath, buffer, data.p_file.size, {
      'Content-Type': data.p_file.type,
      'Content-Length': data.p_file.size,
    });
  } catch (e) {
    console.error('Error uploading file to S3:', e);
    return { success: false, message: 'Failed to upload file to storage.' };
  }

  return { success: true };
});

export const deleteStorageObjects = command(deleteStorageObjectsSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  // TODO: This api should returns deleted objects, currently not implemented
  await api.postgrest.post({
    endpoint: DELETE_STORAGE_OBJECTS,
    token: token,
    data: {
      p_org_class_id: data.p_org_class_id,
      p_path: data.p_path,
      p_names: data.p_objects.map((obj) => obj.name),
    },
  });

  const allObjectsToDelete: string[] = [];

  for (const obj of data.p_objects) {
    const path = getS3Path(data.p_org_class_id, data.p_path, obj.name, obj.type);

    if (obj.type === 'file') {
      allObjectsToDelete.push(path);
      continue;
    }

    // 使用 Promise 等待 Stream 完成搜尋
    const folderContents = await new Promise<string[]>((resolve, reject) => {
      const tempPaths: string[] = [];
      const minioClient = api.getMinIOClient();
      const stream = minioClient.listObjectsV2(env.S3_BUCKET, path, true);

      stream.on('data', (item) => {
        if (item.name) tempPaths.push(item.name);
      });

      stream.on('error', (err) => {
        console.error('Error listing objects:', err);
        reject(err);
      });

      stream.on('end', () => {
        resolve(tempPaths);
      });
    });

    // 將找到的資料夾內容加入總清單
    allObjectsToDelete.push(...folderContents);
  }

  // 2. 最後執行一次性批次刪除 (效能較好)
  if (allObjectsToDelete.length > 0) {
    // 注意：若檔案數量極大 (超過 1000)，MinIO Client 通常會自動處理分批，
    // 但若遇到問題，可考慮手動用 lodash.chunk 分批處理。
    const minioClient = api.getMinIOClient();
    await minioClient.removeObjects(env.S3_BUCKET, allObjectsToDelete);
  }

  getStorageObjects().refresh();
});

export const getStorageFile = command(getStorageFileSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  const fileInfo = await api.postgrest.getFirst({
    endpoint: GET_STORAGE_FILE,
    token: token,
    schema: storageObjectSchema,
    params: {
      p_org_class_id: data.p_org_class_id,
      p_path: data.p_path,
      p_name: data.p_name,
    },
  });
  if (!fileInfo) {
    throw error(404, 'File not found');
  }

  const objectPath = getS3Path(data.p_org_class_id, data.p_path, data.p_name, 'file');
  const minioClient = api.getMinIOClient();
  const link = await minioClient.presignedGetObject(
    env.S3_BUCKET,
    objectPath,
    dayjs.duration({ hours: 1 }).asSeconds(),
  );

  return link;
});
