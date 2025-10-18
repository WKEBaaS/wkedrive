<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import Frown from '@lucide/svelte/icons/frown';
</script>

<div class="bg-secondary flex min-h-screen w-full flex-col items-center justify-center px-4">
	<div class="space-y-4 text-center">
		<Frown class="text-gray-400" size="16rem" />
		<h1 class="text-[120px] leading-none font-light text-gray-400">
			{page.status}
		</h1>
		<Button href="/" variant="link" class="mb-4 text-2xl font-light text-gray-400">Go Back Home</Button>
		<p class="mx-auto max-w-md text-gray-500">
			{page.error?.message}
		</p>
	</div>
</div>
