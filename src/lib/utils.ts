import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
