<script lang="ts">
	import { cn } from '$src/lib/utils';
	import { getFileIcon } from './get-file-icon';

	interface FileIconProps {
		name: string;
		class?: string;
	}

	let { name, class: className }: FileIconProps = $props();
	const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
	const icon = getFileIcon(extension);
</script>

<icon.icon class={cn(icon.color, className)} />
