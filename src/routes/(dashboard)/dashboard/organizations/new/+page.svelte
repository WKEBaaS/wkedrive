<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { createOrganizationSchema } from '$lib/schemas';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();

	const { form, errors, message, enhance } = superForm(data.createOrganizationForm, {
		validators: valibotClient(createOrganizationSchema),
		onError: ({ result }) => {
			toast.error('Error', { description: result.error.message });
		},
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
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
					<Field.Label for="org_name">Name</Field.Label>
					<Input
						id="org_name"
						name="p_name"
						placeholder="Enter organization name"
						bind:value={$form.p_name}
					/>
					<Field.Description>The name of the organization.</Field.Description>
					{#if $errors.p_name}
						<Field.Error>{$errors.p_name}</Field.Error>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.Label for="org_description">Description</Field.Label>
					<Input
						id="org_description"
						name="p_description"
						placeholder="Enter description"
						bind:value={$form.p_description}
					/>
					<Field.Description>A brief description of the organization.</Field.Description>
					{#if $errors.p_description}
						<Field.Error>{$errors.p_description}</Field.Error>
					{/if}
				</Field.Field>
				<Field.Field orientation="horizontal">
					<Button type="submit">Submit</Button>
					<Button variant="outline" type="button">Cancel</Button>
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</form>
</div>
