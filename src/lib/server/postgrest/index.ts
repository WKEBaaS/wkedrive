import { error } from '@sveltejs/kit';

export class PostgrestClient {
	private baseURL: URL;

	constructor(baseURL: string | URL) {
		this.baseURL = new URL(baseURL);
	}

	/**
	 * 核心的 fetch 方法，處理認證和錯誤
	 */
	private async fetchWithAuth(
		endpoint: string,
		jwt: string | undefined,
		options: RequestInit = {},
	) {
		// 確保 endpoint 是相對路徑
		const url = new URL(endpoint.replace(/^\//, ''), this.baseURL);

		const headers = new Headers(options.headers || {});

		// 注入 PostgREST 需要的 JWT 認證
		if (jwt) {
			headers.set('Authorization', `Bearer ${jwt}`);
		}

		// PostgREST 偏好 'application/json'
		headers.set('Content-Type', 'application/json');
		headers.set('Accept', 'application/json');

		const response = await fetch(url.toString(), {
			...options,
			headers,
		});

		if (!response.ok) {
			// 嘗試解析 PostgREST 的錯誤訊息
			const errorData = await response.json().catch(() => ({}));
			console.error('PostgREST Error:', errorData);

			// 拋出 SvelteKit 的 HTTPError，這會自動回傳正確的 status code
			throw error(response.status, errorData.message || 'API request failed');
		}

		if (response.status === 204 || response.status === 202) {
			// No Content or Accepted
			return null;
		}

		// 成功，回傳 JSON
		return response.json();
	}

	// --- 公開的 API 方法 ---

	/**
	 * 執行 GET 請求
	 * @param endpoint - 例如 "/organizations"
	 * @param jwt - 用戶的 JWT
	 */
	public get<T>(endpoint: string, jwt: string): Promise<T> {
		return this.fetchWithAuth(endpoint, jwt, {
			method: 'GET',
		});
	}

	/**
	 * 執行 POST 請求
	 * @param endpoint - 例如 "/posts"
	 * @param jwt - 用戶的 JWT
	 * @param data - 要傳送的 JS 物件
	 */
	public post<T>(endpoint: string, jwt: string, data: object): Promise<T> {
		return this.fetchWithAuth(endpoint, jwt, {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	// 你可以繼續加入 patch, delete...
	public patch<T>(endpoint: string, jwt: string, data: object): Promise<T> {
		return this.fetchWithAuth(endpoint, jwt, {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	}
}
