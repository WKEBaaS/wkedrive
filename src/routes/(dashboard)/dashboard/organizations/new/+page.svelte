<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { createOrganizationSchema } from '$lib/schemas';
	import { toast } from 'svelte-sonner';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();

	const { form, errors, message, enhance } = superForm(data.createOrganizationForm, {
		validators: valibotClient(createOrganizationSchema),
		onError: ({ result }) => {
			toast.error('Error', { description: result.error.message });
		},
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success('Success', { description: 'Organization created successfully' });
			}
		},
		delayMs: 100,
	});
</script>

<div class="mx-4 space-y-4">
	<form method="POST" action="?/createOrganization" use:enhance>
		<Field.Set>
			<Field.Legend>Organization Details</Field.Legend>
			<Field.Description>Enter the organization information.</Field.Description>
			{#if $message}
				<div>{$message}</div>
			{/if}
			<Field.Group>
				<Field.Field>
					<Field.Label for="name">Name</Field.Label>
					<Input
						id="name"
						name="name"
						autocomplete="off"
						placeholder="Enter organization name"
						bind:value={$form.name}
					/>
					<Field.Description>The name of the organization.</Field.Description>
					{#if $errors.name}
						<Field.Error>{$errors.name}</Field.Error>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.Label for="description">Description</Field.Label>
					<Input
						id="description"
						name="description"
						autocomplete="off"
						placeholder="Enter description"
						bind:value={$form.description}
					/>
					<Field.Description>A brief description of the organization.</Field.Description>
					{#if $errors.description}
						<Field.Error>{$errors.description}</Field.Error>
					{/if}
				</Field.Field>
				<Field.Field orientation="horizontal">
					<Button type="submit">Submit</Button>
					<Button variant="outline" type="button">Cancel</Button>
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</form>
	<SuperDebug data={$form} />
</div>
