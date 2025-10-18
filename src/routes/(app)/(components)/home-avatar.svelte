<script lang="ts">
	import GoogleLogo from '$lib/components/icons/google.svelte';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	const session = authClient.useSession();
</script>

{#if $session.data}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Avatar.Root>
				<Avatar.Image src="#" alt="@shadcn" />
				<Avatar.Fallback>{$session?.data?.user?.name.slice(0, 2)}</Avatar.Fallback>
			</Avatar.Root>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Group>
				<DropdownMenu.GroupHeading>My Account</DropdownMenu.GroupHeading>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<Button
						onclick={async () => {
							await authClient.signOut();
						}}
					>登出</Button>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<Button
		onclick={async () => {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: page.url.origin,
			});
		}}
	>
		<GoogleLogo class="mr-2 h-4 w-4" />
		登入
	</Button>
{/if}
