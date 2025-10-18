<!-- src/routes/auth/callback/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let status = '驗證中...';
	let error: string | null = null;

	onMount(async () => {
		try {
			// Better-Auth 會自動處理 OAuth 回調
			// 檢查 URL 參數中的錯誤
			const params = new URLSearchParams(window.location.search);
			const errorParam = params.get('error');
			console.log(params);

			if (errorParam) {
				throw new Error(params.get('error_description') || errorParam);
			}

			// 等待一下讓 session 更新
			await new Promise((resolve) => setTimeout(resolve, 500));

			// 檢查 session
			const session = await authClient.getSession();
			console.log('Current session:', session);

			if (session) {
				status = '登入成功!即將跳轉...';
				setTimeout(() => {
					goto('/');
				}, 1000);
			} else {
				throw new Error('無法取得登入資訊');
			}
		} catch (err: any) {
			console.error('認證錯誤:', err);
			status = '登入失敗';
			error = err.message;

			setTimeout(() => {
				goto('/login');
			}, 3000);
		}
	});
</script>

<div class="container">
	<div class="card">
		<h1>{status}</h1>

		{#if error}
			<p class="error">{error}</p>
			<p>將在 3 秒後返回登入頁...</p>
		{:else}
			<div class="spinner"></div>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #f5f5f5;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: center;
		max-width: 400px;
	}

	.error {
		color: #ef4444;
		margin-top: 1rem;
	}

	.spinner {
		border: 3px solid #f3f3f3;
		border-top: 3px solid #3b82f6;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin: 1rem auto;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
