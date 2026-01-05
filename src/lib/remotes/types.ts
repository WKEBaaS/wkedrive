export type APIResponse<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  message: string;
  description?: string;
  code?: string;
  status?: number;
};
