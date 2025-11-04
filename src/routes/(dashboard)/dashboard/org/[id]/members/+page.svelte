<script lang="ts">
	let { data } = $props();
</script>

<div class="text-xl font-bold mb-4">Organization Members</div>
{#each data.members as member (member.id)}
	<div class="p-4 mb-2 border rounded">
		<h3 class="text-lg font-semibold">{member.name}</h3>
		<p class="text-sm text-gray-600">{member.email}</p>
	</div>
{/each}
