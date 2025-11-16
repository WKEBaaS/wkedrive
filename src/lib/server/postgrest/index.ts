import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { POSTGREST_ERROR_TYPE, postgrestErrorSchema } from './error';

export class PostgrestClient {
	private baseURL: URL;

	constructor(baseURL: string | URL) {
		this.baseURL = new URL(baseURL);
	}

	/**
	 * 核心的 fetch 方法，處理認證和錯誤
	 * @param endpoint - 基礎 API 路徑 (e.g., "/posts")
	 * @param token - 用戶的 JWT
	 * @param options - 標準的 RequestInit 選項
	 * @param params - (可選) 要附加到 URL 的查詢參數
	 */
	private async fetchWithAuth<T>(
		endpoint: string,
		token: string | null,
		options: RequestInit = {},
		params?: Record<string, string>,
	): Promise<T> {
		let urlString = endpoint;

		// 處理 URL 查詢參數
		if (params && Object.keys(params).length > 0) {
			const searchParams = new URLSearchParams(params);
			const queryString = searchParams.toString();

			// 檢查 endpoint 是否已包含 '?'
			if (urlString.includes('?')) {
				urlString += '&' + queryString;
			} else {
				urlString += '?' + queryString;
			}
		}

		// 確保 endpoint 是相對路徑，並與 baseURL 組合
		// 使用已經處理過 params 的 urlString
		const url = new URL(urlString.replace(/^\//, ''), this.baseURL);

		const headers = new Headers(options.headers || {});

		// 注入 PostgREST 需要的 JWT 認證
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
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
			const errorData = await response.json();
			const parsed = await v.safeParseAsync(postgrestErrorSchema, errorData);

			if (!parsed.success) {
				console.error('PostgREST Error Parsing Failed:', parsed.issues);
				throw error(500, 'Internal Server Error');
			}

			// Start with "PT" mean custom HTTP status code return in Transaction
			if (parsed.output.code.startsWith('PT')) {
				throw error(response.status, {
					type: POSTGREST_ERROR_TYPE,
					message: parsed.output.message,
					details: parsed.output.details,
					hint: parsed.output.hint,
					status: response.status,
				});
			}

			console.error('PostgrestClient internal error:', {
				message: parsed.output.message,
				details: parsed.output.details,
				hint: parsed.output.hint,
				code: parsed.output.code,
			});

			throw error(500, 'Internal Server Error');
		}

		if (response.status === 204 || response.status === 202) {
			// No Content or Accepted
			return null as T;
		}

		// 成功，回傳 JSON (類型為 T)
		return response.json();
	}

	// --- 公開的 API 方法 ---

	/**
	 * 執行 GET 請求
	 * @param endpoint - 例如 "/organizations"
	 * @param token - (可選) 用戶的 JWT
	 * @param params - (可選) URL 查詢參數
	 */
	public get<T>(endpoint: string, token: string | null, params?: Record<string, string>): Promise<T> {
		// 直接將 params 傳遞給 fetchWithAuth
		return this.fetchWithAuth<T>(
			endpoint,
			token,
			{ method: 'GET' },
			params,
		);
	}

	/**
	 * 執行 GET 請求並只取回第一筆資料
	 * @param endpoint - 例如 "/posts"
	 * @param token - 用戶的 JWT
	 * @param params - URL 查詢參數 (會自動被覆蓋加上 limit=1)
	 */
	public async getFirst<T>(endpoint: string, token: string | null, params?: Record<string, string>): Promise<T> {
		// 仍然需要在這裡準備 allParams，這是這個方法的特定業務邏輯
		const allParams = {
			...params,
			limit: '1',
		};

		// 假設回傳的是 T 類型的陣列 (e.g., Post[])
		const data = await this.fetchWithAuth<T[]>(
			endpoint,
			token,
			{ method: 'GET' },
			allParams,
		);

		// 增加 Array.isArray 檢查，使程式更健壯
		if (Array.isArray(data) && data.length > 0) {
			return data[0]; // 回傳 T 類型的單一物件 (e.g., Post)
		} else {
			throw error(404, 'No data found');
		}
	}

	/**
	 * 執行 POST 請求
	 * @param endpoint - 例如 "/posts"
	 * @param token - 用戶的 JWT
	 * @param data - 要傳送的 JS 物件
	 */
	public post<T>(endpoint: string, token: string | null, data: object): Promise<T> {
		return this.fetchWithAuth(endpoint, token, {
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

export { POSTGREST_ERROR_TYPE, PostgrestError } from './error';
