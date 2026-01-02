<script lang='ts'>
	import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { createOrganization } from '$src/lib/remotes/index.js';
  import { toast } from 'svelte-sonner';
</script>

<div class='mx-4 space-y-4'>
	<form
		{...createOrganization.enhance(async ({ form, submit }) => {
		  await submit();
		  if (createOrganization.result?.success) {
		    toast.success('Organization created successfully.');
		    form.reset();
		    goto(resolve(`/(dashboard)/dashboard/organizations`));
		  } else {
		    toast.error(createOrganization.result?.message || 'Failed to create organization.', {
		      description: createOrganization.result?.hint || '',
		    });
		  }
		})}
		oninput={() => createOrganization.validate()}
	>
		<Field.Set>
			<Field.Legend>Organization Details</Field.Legend>
			<Field.Description>Enter the organization information.</Field.Description>
			<Field.Group>
				<Field.Field>
					<Field.Label for='org_name'>Name</Field.Label>
					<Input id='org_name' {...createOrganization.fields.p_name.as('text')} />
					<Field.Description>The name of the organization.</Field.Description>
					{#each createOrganization.fields.p_name.issues() ?? [] as issue, index (index)}
						<Field.Error>{issue.message}</Field.Error>
					{/each}
				</Field.Field>
				<Field.Field>
					<Field.Label for='org_description'>Description</Field.Label>
					<Input id='org_description' {...createOrganization.fields.p_description.as('text')} />
					<Field.Description>A brief description of the organization.</Field.Description>
					{#each createOrganization.fields.p_description.issues() ?? [] as issue, index (index)}
						<Field.Error>{issue.message}</Field.Error>
					{/each}
				</Field.Field>
				<Field.Field orientation='horizontal'>
					<Button type='submit'>Submit</Button>
					<Button variant='outline' type='button'>Cancel</Button>
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</form>
</div>
