import { command, form, getRequestEvent, query } from '$app/server';
import { env } from '$env/dynamic/private';
import { displaySize } from '$lib/components/ui/file-drop-zone';
import * as api from '$lib/server';
import {
  createStorageFolderSchema,
  deleteStorageObjectsSchema,
  getStorageFileSchema,
  storageObjectSchema,
  uploadStorageFileSchema,
} from '$src/lib/schemas';
import { error, invalid } from '@sveltejs/kit';
import { PostgrestClientError } from '@wke-baas/postgrest-client';
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
import { errorToObject, getS3Path } from '../utils';
import type { APIResponse } from './types';
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

    return { success: true } as APIResponse;
  } catch (e) {
    if (e instanceof PostgrestClientError) {
      switch (e.status) {
        case 409:
          invalid(issue.p_name(`A folder with this name already exists.`));
      }
    }

    return errorToObject(e);
  }
});

export const uploadStorageFile = form(uploadStorageFileSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  const { p_file, ...body } = data;
  try {
    await api.postgrest.post({
      endpoint: CREATE_STORAGE_FILE,
      token: token,
      data: {
        ...body,
        p_etag: null,
        p_size: displaySize(p_file.size),
      },
    });

    // Upload to S3 / MinIO
    const buffer = Buffer.from(await data.p_file.arrayBuffer());
    const objectPath = getS3Path(data.p_org_class_id, data.p_path, data.p_file.name, 'file');
    const minioClient = api.getMinIOClient();

    await minioClient.putObject(env.S3_BUCKET, objectPath, buffer, data.p_file.size, {
      'Content-Type': data.p_file.type,
      'Content-Length': data.p_file.size,
    });
  } catch (e) {
    return errorToObject(e);
  }

  return { success: true } as APIResponse;
});

export const deleteStorageObjects = command(deleteStorageObjectsSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  // TODO: This api should returns deleted objects, currently not implemented
  try {
    await api.postgrest.post({
      endpoint: DELETE_STORAGE_OBJECTS,
      token: token,
      data: {
        p_org_class_id: data.p_org_class_id,
        p_path: data.p_path,
        p_names: data.p_objects.map((obj) => obj.name),
      },
    });
  } catch (err) {
    return errorToObject(err);
  }

  const allObjectsToDelete: string[] = [];

  for (const obj of data.p_objects) {
    const path = getS3Path(data.p_org_class_id, data.p_path, obj.name, obj.type);

    if (obj.type === 'file') {
      allObjectsToDelete.push(path);
      continue;
    }

    // 使用 Promise 等待 Stream 完成搜尋
    try {
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
    } catch (err) {
      return errorToObject(err);
    }
  }

  // 2. 最後執行一次性批次刪除 (效能較好)
  if (allObjectsToDelete.length > 0) {
    // 注意：若檔案數量極大 (超過 1000)，MinIO Client 通常會自動處理分批，
    // 但若遇到問題，可考慮手動用 lodash.chunk 分批處理。
    const minioClient = api.getMinIOClient();
    await minioClient.removeObjects(env.S3_BUCKET, allObjectsToDelete);
  }

  getStorageObjects().refresh();

  return { success: true } as APIResponse;
});

export const getStorageFile = command(getStorageFileSchema, async (data) => {
  const event = getRequestEvent();
  const token = await api.auth.fetchToken(event);

  let fileInfo;
  try {
    fileInfo = await api.postgrest.getFirst({
      endpoint: GET_STORAGE_FILE,
      token: token,
      schema: storageObjectSchema,
      params: { p_org_class_id: data.p_org_class_id, p_path: data.p_path, p_name: data.p_name },
    });
  } catch (err) {
    return errorToObject(err);
  }
  if (!fileInfo) {
    return { success: false, message: 'File not found' } as APIResponse;
  }

  const objectPath = getS3Path(data.p_org_class_id, data.p_path, data.p_name, 'file');
  const minioClient = api.getMinIOClient();
  const link = await minioClient.presignedGetObject(
    env.S3_BUCKET,
    objectPath,
    dayjs.duration({ hours: 1 }).asSeconds(),
  );

  return {
    success: true,
    data: {
      link,
    },
  } as APIResponse<{ link: string }>;
});
