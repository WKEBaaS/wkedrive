import { MEGABYTE } from '$lib/components/ui/file-drop-zone';
import * as v from 'valibot';

export const uploadFileSchema = v.object({
	files: v.array(
		v.pipe(
			v.file(),
			v.maxSize(10 * MEGABYTE),
		),
	),
});

export type UploadFile = v.InferInput<typeof uploadFileSchema>;
