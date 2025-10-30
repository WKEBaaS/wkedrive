import { env } from '$env/dynamic/private';
import { s3Client } from '$lib/s3-client';
import { type Actions, error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { uploadFileSchema } from './schema';

export const load: PageServerLoad = async () => {
	return {
		uploadFileForm: await superValidate(valibot(uploadFileSchema)),
	};
};

export const actions = {
	uploadFile: async ({ request, locals }) => {
		if (!locals.session) {
			error(401, 'Unauthorized');
		}

		const form = await superValidate(request, valibot(uploadFileSchema));
		if (!form.valid) {
			return fail(401, { form });
		}

		try {
			for (const file of form.data.files) {
				const buffer = Buffer.from(await file.arrayBuffer());
				await s3Client.putObject(env.S3_BUCKET, file.name, buffer);
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			return fail(500, { form });
		}

		form.data.files = [];
		return { form };
	},
} satisfies Actions;
