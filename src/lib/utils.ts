import { error } from '@sveltejs/kit';
import { PostgrestClientError } from '@wke-baas/postgrest-client';
import { type ClassValue, clsx } from 'clsx';
import { toast } from 'svelte-sonner';
import { twMerge } from 'tailwind-merge';
import type { APIResponse } from './remotes/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Helper Functions ---
/** 根據姓名獲取頭像的縮寫 */
export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getS3Path(orgClassId: string, path: string, name: string, type: 'folder' | 'file' = 'file') {
  let result = '';
  if (path === '/') {
    result = `org/${orgClassId}/${name}`;
  } else {
    result = `org/${orgClassId}/${path}/${name}`;
  }

  if (type === 'folder' && !result.endsWith('/')) {
    result += '/';
  }
  return result;
}

export function toastError(err: unknown) {
  console.log('Error Kind:', typeof err);
  if (err instanceof PostgrestClientError) {
    const description = [
      err.hint ? `Hint: ${err.hint}` : null,
      err.details ? `Details: ${err.details}` : null,
      err.code ? `Code: ${err.code}` : null,
    ]
      .filter(Boolean) // 移除 null/undefined
      .join('\n');
    toast.error(err.message, { description });
    return;
  }

  if (err instanceof Error) {
    toast.error(err.message);
    return;
  }

  if (typeof err === 'string') {
    toast.error(err);
    return;
  }

  toast.error('An unknown error occurred');
  console.error('Unknown error:', err);
}

export function errorToObject(err: unknown): APIResponse {
  if (err instanceof PostgrestClientError) {
    const description = [
      err.hint ? `Hint: ${err.hint}` : null,
      err.details ? `Details: ${err.details}` : null,
      err.code ? `Code: ${err.code}` : null,
    ]
      .filter(Boolean) // 移除 null/undefined
      .join('\n');

    return {
      success: false,
      message: err.message,
      description: description,
      status: err.status,
      code: err.code,
    };
  }

  if (err instanceof Error) {
    return {
      success: false,
      message: err.message,
      status: 500,
    };
  }

  if (typeof err === 'string') {
    return {
      success: false,
      message: err,
      status: 500,
    };
  }

  return {
    success: false,
    message: 'An unknown error occurred',
    status: 500,
  };
}

export function toSKError(err: unknown) {
  const obj = errorToObject(err);
  if (!obj.success) {
    error(obj.status || 500, {
      status: obj.status,
      message: obj.message,
      description: obj.description,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
