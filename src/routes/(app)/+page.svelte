<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Database from '@lucide/svelte/icons/database';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Users from '@lucide/svelte/icons/users';
</script>

<div class="flex flex-col min-h-[calc(100vh-14rem)]">
	<!-- Hero Section -->
	<section class="container px-4 py-24 md:py-32 mx-auto flex flex-col items-center text-center space-y-6">
		<Badge variant="secondary" class="rounded-full px-4 py-1">v0.0.1 Beta</Badge>

		<h1
			class="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
		>
			Secure Cloud Storage for <span class="text-foreground">Modern Teams</span>
		</h1>

		<p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
			WKE Drive provides a powerful, self-hostable Backend-as-a-Service solution with advanced
			multi-tenancy, granular RBAC, and object-based storage.
		</p>

		<div class="flex flex-col sm:flex-row gap-4 pt-4">
			<Button size="lg" href={resolve('/dashboard/organizations')} class="gap-2">
				Get Started <ArrowRight class="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="lg"
				href="https://github.com/youmin1017/WKE-BaaS"
				target="_blank"
				rel="noreferrer"
			>
				View on GitHub
			</Button>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="container px-4 py-16 mx-auto">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card.Root class="bg-card/50 backdrop-blur-sm border-muted">
				<Card.Header>
					<div
						class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary"
					>
						<Users class="h-6 w-6" />
					</div>
					<Card.Title>Multi-Tenancy</Card.Title>
					<Card.Description>Organization & Group Management</Card.Description>
				</Card.Header>
				<Card.Content class="text-muted-foreground">
					Isolate data and users securely with our robust multi-tenant architecture designed for
					scalable SaaS applications.
				</Card.Content>
			</Card.Root>

			<Card.Root class="bg-card/50 backdrop-blur-sm border-muted">
				<Card.Header>
					<div
						class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary"
					>
						<ShieldCheck class="h-6 w-6" />
					</div>
					<Card.Title>Advanced RBAC</Card.Title>
					<Card.Description>Fine-Grained Permissions</Card.Description>
				</Card.Header>
				<Card.Content class="text-muted-foreground">
					Define roles and permissions at the object level to ensure precise access control across
					your entire organization.
				</Card.Content>
			</Card.Root>

			<Card.Root class="bg-card/50 backdrop-blur-sm border-muted">
				<Card.Header>
					<div
						class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary"
					>
						<Database class="h-6 w-6" />
					</div>
					<Card.Title>Object Storage</Card.Title>
					<Card.Description>S3-Compatible Backend</Card.Description>
				</Card.Header>
				<Card.Content class="text-muted-foreground">
					Seamlessly upload, manage, and share files backed by high-performance storage with built-in
					metadata tracking.
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Tech Stack / Footer Note -->
	<section class="container px-4 py-24 mx-auto text-center border-t border-border">
		<h2 class="text-2xl font-semibold mb-8">Powered by Modern Technology</h2>
		<div class="flex flex-wrap justify-center gap-x-12 gap-y-8 text-muted-foreground">
			<div class="flex items-center gap-2">
				<span class="font-bold">SvelteKit 5</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="font-bold">Tailwind CSS v4</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="font-bold">Drizzle ORM</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="font-bold">Better-Auth</span>
			</div>
		</div>
	</section>
</div>