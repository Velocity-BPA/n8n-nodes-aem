/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IPollFunctions,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type { ITokenCache, ISirenResponse } from '../types/AemTypes';

// Token cache for Cloud Service OAuth
const tokenCache: Map<string, ITokenCache> = new Map();

/**
 * Get an access token for AEM API requests
 * Returns Basic auth header for AEM 6.5 or Bearer token for Cloud Service
 */
export async function getAccessToken(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
): Promise<string> {
	const credentials = await this.getCredentials('aemApi');
	const deploymentType = credentials.deploymentType as string;

	if (deploymentType === 'aem65') {
		// Return base64 encoded basic auth
		const username = credentials.username as string;
		const password = credentials.password as string;
		const auth = Buffer.from(`${username}:${password}`).toString('base64');
		return `Basic ${auth}`;
	}

	// Cloud Service OAuth flow
	const cacheKey = `${credentials.clientId}-${credentials.orgId}`;
	const cached = tokenCache.get(cacheKey);
	
	// Return cached token if still valid (with 5 minute buffer)
	if (cached && cached.expiresAt > Date.now() + 300000) {
		return `Bearer ${cached.accessToken}`;
	}

	// Request new token
	const options: IRequestOptions = {
		method: 'POST',
		uri: `https://${credentials.imsHost}/ims/token/v3`,
		form: {
			grant_type: 'client_credentials',
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
			scope: credentials.scopes,
		},
		json: true,
	};

	try {
		const response = await this.helpers.request(options);
		
		// Cache the token
		tokenCache.set(cacheKey, {
			accessToken: response.access_token,
			expiresAt: Date.now() + (response.expires_in * 1000),
		});

		return `Bearer ${response.access_token}`;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Failed to obtain access token from Adobe IMS',
		});
	}
}

/**
 * Make a request to the AEM Assets HTTP API
 */
export async function aemAssetsApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	query?: IDataObject,
	binary?: Buffer,
): Promise<ISirenResponse | IDataObject> {
	const credentials = await this.getCredentials('aemApi');
	const authHeader = await getAccessToken.call(this);
	const aemHost = (credentials.aemHost as string).replace(/\/$/, '');

	// Ensure path starts with /api/assets
	let assetPath = path;
	if (!path.startsWith('/api/assets')) {
		assetPath = `/api/assets${path.startsWith('/') ? '' : '/'}${path}`;
	}
	
	// Add .json extension if not present
	if (!assetPath.endsWith('.json')) {
		assetPath = `${assetPath}.json`;
	}

	const options: IRequestOptions = {
		method,
		uri: `${aemHost}${assetPath}`,
		headers: {
			Authorization: authHeader,
			Accept: 'application/json',
		},
		json: true,
	};

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	if (body && method !== 'GET') {
		options.body = body;
		options.headers!['Content-Type'] = 'application/json';
	}

	if (binary) {
		options.headers!['Content-Type'] = 'application/octet-stream';
		options.body = binary;
		options.json = false;
	}

	try {
		const response = await this.helpers.request(options);
		
		// Check for error in Siren response
		if (response?.properties?.statusCode >= 400) {
			throw new NodeApiError(this.getNode(), response as JsonObject, {
				message: response.properties.message || 'AEM API error',
				httpCode: String(response.properties.statusCode),
			});
		}
		
		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `AEM Assets API request failed: ${(error as Error).message}`,
		});
	}
}

/**
 * Make a request to the AEM Sling POST servlet
 */
export async function aemSlingPostRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
	path: string,
	formData: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('aemApi');
	const authHeader = await getAccessToken.call(this);
	const aemHost = (credentials.aemHost as string).replace(/\/$/, '');

	const options: IRequestOptions = {
		method: 'POST',
		uri: `${aemHost}${path}`,
		headers: {
			Authorization: authHeader,
		},
		formData,
		json: true,
	};

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `AEM Sling POST request failed: ${(error as Error).message}`,
		});
	}
}

/**
 * Make a GraphQL request to AEM
 */
export async function aemGraphQlRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	endpoint: string,
	query: string,
	variables?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('aemApi');
	const authHeader = await getAccessToken.call(this);
	const aemHost = (credentials.aemHost as string).replace(/\/$/, '');

	const graphqlEndpoint = endpoint === 'global'
		? '/content/_cq_graphql/global/endpoint.json'
		: `/content/_cq_graphql/${endpoint}/endpoint.json`;

	const options: IRequestOptions = {
		method: 'POST',
		uri: `${aemHost}${graphqlEndpoint}`,
		headers: {
			Authorization: authHeader,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: {
			query,
			variables: variables || {},
		},
		json: true,
	};

	try {
		const response = await this.helpers.request(options);

		if (response.errors && response.errors.length > 0) {
			throw new NodeApiError(this.getNode(), response as JsonObject, {
				message: response.errors[0].message,
				description: 'GraphQL query error',
			});
		}

		return response.data || response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `AEM GraphQL request failed: ${(error as Error).message}`,
		});
	}
}

/**
 * Make a general HTTP request to AEM
 */
export async function aemHttpRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('aemApi');
	const authHeader = await getAccessToken.call(this);
	const aemHost = (credentials.aemHost as string).replace(/\/$/, '');

	const options: IRequestOptions = {
		method,
		uri: `${aemHost}${path}`,
		headers: {
			Authorization: authHeader,
			Accept: 'application/json',
		},
		json: true,
	};

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	if (body && method !== 'GET') {
		options.body = body;
		options.headers!['Content-Type'] = 'application/json';
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `AEM HTTP request failed: ${(error as Error).message}`,
		});
	}
}

/**
 * Fetch all items using pagination
 */
export async function aemApiRequestAllItems(
	this: IExecuteFunctions | IPollFunctions,
	path: string,
	query: IDataObject = {},
	limit?: number,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let offset = 0;
	const pageSize = 100;
	let hasMoreItems = true;

	while (hasMoreItems) {
		const response = (await aemAssetsApiRequest.call(this, 'GET', path, undefined, {
			...query,
			offset,
			limit: pageSize,
		})) as ISirenResponse;

		if (!response.entities || response.entities.length === 0) {
			hasMoreItems = false;
			break;
		}

		for (const entity of response.entities) {
			returnData.push(entity.properties);
			
			if (limit && returnData.length >= limit) {
				return returnData.slice(0, limit);
			}
		}

		offset += pageSize;

		// Check if we've retrieved all items
		if (response.entities.length < pageSize) {
			hasMoreItems = false;
		}
	}

	return returnData;
}

/**
 * Upload binary data to AEM
 */
export async function aemUploadBinary(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	path: string,
	binaryData: Buffer,
	mimeType: string,
	fileName: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('aemApi');
	const authHeader = await getAccessToken.call(this);
	const aemHost = (credentials.aemHost as string).replace(/\/$/, '');

	const options: IRequestOptions = {
		method: 'POST',
		uri: `${aemHost}${path}`,
		headers: {
			Authorization: authHeader,
		},
		formData: {
			file: {
				value: binaryData,
				options: {
					filename: fileName,
					contentType: mimeType,
				},
			},
		},
		json: true,
	};

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `AEM binary upload failed: ${(error as Error).message}`,
		});
	}
}

/**
 * Handle AEM API response and extract relevant data
 */
export function processAemResponse(response: ISirenResponse): IDataObject {
	const result: IDataObject = {
		...response.properties,
	};

	if (response.entities) {
		result.children = response.entities.map((entity) => ({
			...entity.properties,
			class: entity.class,
			links: entity.links,
		}));
	}

	if (response.links) {
		result._links = response.links;
	}

	return result;
}

/**
 * Sleep function for rate limiting
 */
export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	initialDelay: number = 1000,
): Promise<T> {
	let lastError: Error | undefined;
	
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			
			// Check if we should retry (429 or 503)
			const statusCode = (error as NodeApiError).httpCode;
			if (statusCode !== '429' && statusCode !== '503') {
				throw error;
			}
			
			const delay = Math.min(Math.pow(2, i) * initialDelay, 60000);
			await sleep(delay);
		}
	}
	
	throw lastError;
}

/**
 * Normalize path by ensuring it starts with / and doesn't end with /
 */
export function normalizePath(path: string): string {
	let normalized = path.trim();
	
	if (!normalized.startsWith('/')) {
		normalized = `/${normalized}`;
	}
	
	if (normalized.endsWith('/') && normalized.length > 1) {
		normalized = normalized.slice(0, -1);
	}
	
	return normalized;
}

/**
 * Get parent path from a full path
 */
export function getParentPath(path: string): string {
	const normalized = normalizePath(path);
	const lastSlashIndex = normalized.lastIndexOf('/');
	
	if (lastSlashIndex <= 0) {
		return '/';
	}
	
	return normalized.substring(0, lastSlashIndex);
}

/**
 * Get name from a full path
 */
export function getNameFromPath(path: string): string {
	const normalized = normalizePath(path);
	const lastSlashIndex = normalized.lastIndexOf('/');
	
	return normalized.substring(lastSlashIndex + 1);
}
