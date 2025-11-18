<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	const paths = $derived.by(() => {
		const path = page.params.path;
		if (!path) {
			return [];
		}
		const segments = path.split('/');
		return segments.map((segment, index) => ({
			name: segment,
			path: segments.slice(0, index + 1).join('/'),
		}));
	});
</script>

<div class="flex items-center space-x-2 text-sm">
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href={`/dashboard/org/${page.params.org_class_id}/storage`}>/</Breadcrumb.Link>
			</Breadcrumb.Item>
			{#each paths as segment (segment.path)}
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Link href={`/dashboard/org/${page.params.org_class_id}/storage/${segment.path}`}>{
						segment.name
					}</Breadcrumb.Link>
				</Breadcrumb.Item>
			{/each}
		</Breadcrumb.List>
	</Breadcrumb.Root>
</div>
