// src/lib/fileIcons.ts
import {
	File,
	FileArchive,
	FileAudio,
	FileCode,
	FileImage,
	FileJson,
	FilePlay,
	FileSpreadsheet,
	FileText,
	type Icon as LucideIcon,
} from '@lucide/svelte';

// 1. 定義單個配置的 Type
export type IconComponent = typeof LucideIcon;

export type FileTypeConfig = {
	icon: IconComponent;
	color: string;
};

// 2. 定義回傳結果的 Type
export type GetFileIconResult = {
	icon: IconComponent;
	color: string;
};

// 3. 合併後的 Map (Extension -> Config)
export const fileTypeMap: Record<string, FileTypeConfig> = {
	// Text & Code
	'.txt': { icon: FileText, color: 'text-gray-500' },
	'.md': { icon: FileText, color: 'text-slate-600' },
	'.json': { icon: FileJson, color: 'text-amber-500' },
	'.js': { icon: FileCode, color: 'text-yellow-500' },
	'.ts': { icon: FileCode, color: 'text-blue-600' },
	'.html': { icon: FileCode, color: 'text-orange-600' },
	'.css': { icon: FileCode, color: 'text-sky-500' },

	// Images
	'.jpg': { icon: FileImage, color: 'text-purple-600' },
	'.jpeg': { icon: FileImage, color: 'text-purple-600' },
	'.png': { icon: FileImage, color: 'text-purple-600' },
	'.gif': { icon: FileImage, color: 'text-purple-600' },
	'.svg': { icon: FileImage, color: 'text-indigo-600' },
	'.webp': { icon: FileImage, color: 'text-purple-600' },

	// Media
	'.mp3': { icon: FileAudio, color: 'text-pink-500' },
	'.wav': { icon: FileAudio, color: 'text-pink-500' },
	'.mp4': { icon: FilePlay, color: 'text-rose-500' },
	'.mov': { icon: FilePlay, color: 'text-rose-500' },

	// Documents
	'.pdf': { icon: File, color: 'text-red-600' },
	'.doc': { icon: FileText, color: 'text-blue-700' },
	'.docx': { icon: FileText, color: 'text-blue-700' },
	'.xls': { icon: FileSpreadsheet, color: 'text-emerald-600' },
	'.xlsx': { icon: FileSpreadsheet, color: 'text-emerald-600' },

	// Archives
	'.zip': { icon: FileArchive, color: 'text-orange-500' },
	'.rar': { icon: FileArchive, color: 'text-orange-500' },
	'.tar.gz': { icon: FileArchive, color: 'text-orange-500' },
};

// 4. 定義預設值
const defaultEntry: FileTypeConfig = {
	icon: File,
	color: 'text-gray-400',
};

// 5. 優化後的 Helper Function
export function getFileIcon(extension: string): GetFileIconResult {
	return fileTypeMap[extension] || defaultEntry;
}

export type FileIconSupportedExtensions = keyof typeof fileTypeMap;
