export type Headers = { [key: string]: string };
export interface Response {
	readonly body: string;
	readonly bodyUsed: boolean;
	readonly headers: { [key: string]: string };
	readonly ok: boolean;
	readonly status: number;
	readonly statusText: string;
	readonly type: "basic" | "cors" | "error" | "opaque" | "opaqueredirect";
	readonly url: string;
}
export interface RequestOptions {
	method?: "GET" | "POST" | "DELETE" | "HEAD" | "PUT" | "PATCH";
	headers?: Headers;
	body?: unknown;
	mode?: "cors" | "no-cors" | "same-origin";
	credentials?: "omit" | "same-origin" | "include";
	cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
	referer?: string;
	referrerPolicy?:
		| "no-referrer"
		| "no-referrer-when-downgrade"
		| "same-origin"
		| "origin"
		| "strict-origin"
		| "origin-when-cross-origin"
		| "strict-origin-when-cross-origin"
		| "unsafe-url";
	keepalive?: boolean;
}
export async function fetch(resource: string, options?: RequestOptions): Promise<Response> {
	return new Promise((resolve, reject) => {
		xpcall(() => {
			options = options || {};
			options.headers = options.headers || {};
			if (options.credentials === "omit") {
				delete options.headers.Authorization;
				delete options.headers["Proxy-Authorization"];
				delete options.headers["Set-Cookie"];
			}
			if (options.mode !== undefined) {
				options.headers["mode"] = options.mode;
			}
			if (options.referrerPolicy !== undefined) {
				options.headers["Referrer-Policy"] = options.referrerPolicy;
			}
			if (options.referer !== undefined) {
				options.headers["Referer"] = options.referer;
			}
			if (options.cache !== undefined) {
				options.headers["Cache-Control"] = options.cache;
			}
			if (options.keepalive !== undefined) {
				options.headers["Keep-Alive"] = game.GetService("HttpService").JSONEncode(options.keepalive);
			}
			if (!typeIs(options.body, "string") && options.body !== undefined) {
				options.body = game.GetService("HttpService").JSONEncode([options.body]);
			}
			const req = game.GetService("HttpService").RequestAsync({
				Method: options.method,
				Url: resource,
				Body: <string | undefined>options.body,
				Headers: options.headers,
			});
			let HttpType = "basic";
			if (options.mode === "cors") {
				HttpType = "cors";
			} else if (options.mode === "no-cors") {
				HttpType = "opaque";
			}
			resolve({
				body: req.Body,
				bodyUsed: options.body !== undefined,
				headers: req.Headers,
				ok: req.Success,
				status: req.StatusCode,
				statusText: req.StatusMessage,
				type: <"basic" | "cors" | "error" | "opaque" | "opaqueredirect">HttpType,
				url: resource,
			});
		}, reject);
	});
}
