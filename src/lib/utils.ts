import { type ClassValue, clsx } from 'clsx';
import { toast } from 'svelte-sonner';
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

export function toastFormError(result: {
	type: 'error';
	status?: number;
	error: App.Error | Error | {
		message: string;
	};
}) {
	if (result.error instanceof Error) {
		toast.error(result.error.message);
		return;
	}

	if ('type' in result.error) {
		const err = result.error as App.Error;
		const toastDescriptionLines = [];

		if (err.status !== undefined) {
			toastDescriptionLines.push(`Code: ${err.status}`);
		}
		if (err.details) {
			toastDescriptionLines.push(`Details: ${err.details}`);
		}
		if (err.hint) {
			toastDescriptionLines.push(`Hint: ${err.hint}`);
		}

		toast.error(`Error ${err.message}`, {
			description: toastDescriptionLines.join('\n') || 'N/A',
		});
	} else {
		toast.error(`Error: ${result.error.message}`);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
