import { getContext, setContext } from 'svelte';

export class StoragePathStore {
	private path: string = $state('/');

	constructor(initialPath?: string) {
		if (!initialPath) {
			initialPath = '/';
		}
		this.path = initialPath;
	}

	getPath(): string {
		return this.path;
	}
	setPath(newPath?: string): void {
		if (!newPath) {
			newPath = '/';
		}
		this.path = newPath;
	}
}

const STORAGE_PATH_STORE_KEY = Symbol('StoragePathStore');

export function setStoragePathStore(store: StoragePathStore, key = STORAGE_PATH_STORE_KEY) {
	setContext(key, store);
}

export function getStoragePathStore(key = STORAGE_PATH_STORE_KEY): StoragePathStore {
	return getContext(key);
}
