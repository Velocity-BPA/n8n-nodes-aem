/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	aemHttpRequest,
	aemSlingPostRequest,
} from '../../transport/GenericFunctions';

export async function executeTagOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		// Get tag details
		const tagId = this.getNodeParameter('tagId', i) as string;

		// Convert tag ID to path (namespace:tag -> /content/cq:tags/namespace/tag)
		const tagPath = tagId.includes(':')
			? `/content/cq:tags/${tagId.replace(':', '/')}`
			: `/content/cq:tags/${tagId}`;

		responseData = await aemHttpRequest.call(
			this,
			'GET',
			`${tagPath}.json`,
		);

		responseData = {
			tagId,
			path: tagPath,
			...responseData,
		};
	} else if (operation === 'getAll') {
		// List tags in namespace
		const namespace = this.getNodeParameter('namespace', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		const response = await aemHttpRequest.call(
			this,
			'GET',
			`/content/cq:tags/${namespace}.infinity.json`,
		);

		// Extract tags from response
		const tags: IDataObject[] = [];
		if (response && typeof response === 'object') {
			const extractTags = (obj: IDataObject, prefix: string) => {
				for (const key of Object.keys(obj)) {
					if (key.startsWith('jcr:') || key.startsWith('sling:') || key.startsWith('cq:')) continue;
					const tag = obj[key] as IDataObject;
					if (tag && typeof tag === 'object' && tag['jcr:primaryType'] === 'cq:Tag') {
						const tagId = prefix ? `${namespace}:${prefix}/${key}` : `${namespace}:${key}`;
						tags.push({
							tagId,
							name: key,
							title: tag['jcr:title'] || key,
							description: tag['jcr:description'],
							...tag,
						});
						// Recursively extract subtags
						extractTags(tag, prefix ? `${prefix}/${key}` : key);
					}
				}
			};
			extractTags(response, '');
		}

		if (returnAll) {
			responseData = tags;
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			responseData = tags.slice(0, limit);
		}
	} else if (operation === 'create') {
		// Create tag
		const tagId = this.getNodeParameter('tagId', i) as string;
		const title = this.getNodeParameter('title', i) as string;
		const description = this.getNodeParameter('description', i, '') as string;

		// Parse tag ID
		const [namespace, ...tagParts] = tagId.split(':');
		const tagName = tagParts.join(':').replace(/\//g, '/');
		const tagPath = `/content/cq:tags/${namespace}/${tagName.replace(/:/g, '/')}`;

		const body: IDataObject = {
			'./jcr:primaryType': 'cq:Tag',
			'./jcr:title': title,
			':name': tagName.split('/').pop(),
		};

		if (description) {
			body['./jcr:description'] = description;
		}

		// Ensure parent path exists
		const parentPath = tagPath.substring(0, tagPath.lastIndexOf('/'));
		await aemSlingPostRequest.call(this, parentPath, body);

		responseData = {
			success: true,
			tagId,
			title,
			description,
			path: tagPath,
		};
	} else if (operation === 'delete') {
		// Delete tag
		const tagId = this.getNodeParameter('tagId', i) as string;

		const tagPath = tagId.includes(':')
			? `/content/cq:tags/${tagId.replace(':', '/')}`
			: `/content/cq:tags/${tagId}`;

		await aemSlingPostRequest.call(this, tagPath, {
			':operation': 'delete',
		});

		responseData = {
			success: true,
			action: 'delete',
			tagId,
		};
	} else if (operation === 'getTagged') {
		// Get content tagged with a specific tag
		const tagId = this.getNodeParameter('tagId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const searchPath = (filters.searchPath as string) || '/content';
		const resourceType = filters.resourceType as string;

		// Build query
		const query: IDataObject = {
			'type': 'cq:Page',
			'path': searchPath,
			'property': 'jcr:content/cq:tags',
			'property.value': tagId,
			'p.limit': returnAll ? -1 : (this.getNodeParameter('limit', i, 50) as number),
		};

		if (resourceType) {
			query['property.2_property'] = 'jcr:content/sling:resourceType';
			query['property.2_property.value'] = resourceType;
		}

		const response = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			query,
		);

		responseData = (response.hits as IDataObject[]) || [];
	} else {
		throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
