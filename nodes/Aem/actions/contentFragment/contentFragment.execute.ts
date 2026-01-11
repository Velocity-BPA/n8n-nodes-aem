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
	aemAssetsApiRequest,
	aemApiRequestAllItems,
	aemHttpRequest,
	processAemResponse,
	normalizePath,
} from '../../transport/GenericFunctions';
import type { ISirenResponse } from '../../types/AemTypes';

export async function executeContentFragmentOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		// Get content fragment
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		const response = (await aemAssetsApiRequest.call(
			this,
			'GET',
			normalizedPath,
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'getAll') {
		// List content fragments
		const folderPath = this.getNodeParameter('folderPath', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const normalizedPath = normalizePath(folderPath);
		const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

		const allItems = await aemApiRequestAllItems.call(this, normalizedPath);

		// Filter to content fragments only
		let fragments = allItems.filter((item) => {
			const classes = item.class as string[] | undefined;
			return classes?.includes('assets/contentfragment') || 
				item['jcr:primaryType'] === 'dam:Asset' && item['contentFragment'] === true;
		});

		// Filter by model if specified
		if (additionalOptions.modelPath) {
			fragments = fragments.filter(
				(item) => item['cq:model'] === additionalOptions.modelPath,
			);
		}

		if (returnAll) {
			responseData = fragments;
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			responseData = fragments.slice(0, limit);
		}
	} else if (operation === 'create') {
		// Create content fragment
		const parentFolder = this.getNodeParameter('parentFolder', i) as string;
		const name = this.getNodeParameter('name', i) as string;
		const title = this.getNodeParameter('title', i) as string;
		const model = this.getNodeParameter('model', i) as string;
		const description = this.getNodeParameter('description', i, '') as string;
		const elements = this.getNodeParameter('elements', i, {}) as IDataObject;
		const tags = this.getNodeParameter('tags', i, '') as string;

		const normalizedParent = normalizePath(parentFolder);

		const body: IDataObject = {
			class: 'assets/contentfragment',
			properties: {
				name,
				'jcr:title': title,
				'cq:model': model,
			},
		};

		if (description) {
			(body.properties as IDataObject)['jcr:description'] = description;
		}

		if (tags) {
			(body.properties as IDataObject)['cq:tags'] = tags.split(',').map((t) => t.trim());
		}

		// Add elements
		if (elements.elementValues && Array.isArray(elements.elementValues)) {
			const elementsObj: IDataObject = {};
			for (const elem of elements.elementValues as IDataObject[]) {
				elementsObj[elem.name as string] = elem.value;
			}
			(body.properties as IDataObject).elements = elementsObj;
		}

		const response = (await aemAssetsApiRequest.call(
			this,
			'POST',
			normalizedParent,
			body,
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'update') {
		// Update content fragment
		const path = this.getNodeParameter('path', i) as string;
		const title = this.getNodeParameter('title', i, '') as string;
		const description = this.getNodeParameter('description', i, '') as string;
		const elements = this.getNodeParameter('elements', i, {}) as IDataObject;
		const tags = this.getNodeParameter('tags', i, '') as string;

		const normalizedPath = normalizePath(path);

		const properties: IDataObject = {};

		if (title) {
			properties['jcr:title'] = title;
		}
		if (description) {
			properties['jcr:description'] = description;
		}
		if (tags) {
			properties['cq:tags'] = tags.split(',').map((t) => t.trim());
		}

		// Add elements
		if (elements.elementValues && Array.isArray(elements.elementValues)) {
			const elementsObj: IDataObject = {};
			for (const elem of elements.elementValues as IDataObject[]) {
				elementsObj[elem.name as string] = elem.value;
			}
			properties.elements = elementsObj;
		}

		const response = (await aemAssetsApiRequest.call(
			this,
			'PUT',
			normalizedPath,
			{ properties },
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'delete') {
		// Delete content fragment
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		await aemAssetsApiRequest.call(this, 'DELETE', normalizedPath);

		responseData = { success: true, deletedPath: normalizedPath };
	} else if (operation === 'getVariations') {
		// Get variations
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		const response = (await aemAssetsApiRequest.call(
			this,
			'GET',
			`${normalizedPath}/jcr:content/data`,
		)) as ISirenResponse;

		// Extract variations from response
		const variations: IDataObject[] = [];
		if (response.entities) {
			for (const entity of response.entities) {
				if (entity.class?.includes('variation')) {
					variations.push(entity.properties);
				}
			}
		}

		responseData = variations;
	} else if (operation === 'createVariation') {
		// Create variation
		const path = this.getNodeParameter('path', i) as string;
		const variationName = this.getNodeParameter('variationName', i) as string;
		const variationTitle = this.getNodeParameter('variationTitle', i) as string;

		const normalizedPath = normalizePath(path);

		const body: IDataObject = {
			name: variationName,
			title: variationTitle,
		};

		responseData = await aemHttpRequest.call(
			this,
			'POST',
			`${normalizedPath}/jcr:content/data/${variationName}`,
			body,
		);
	} else if (operation === 'publish') {
		// Publish content fragment
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		responseData = await aemHttpRequest.call(
			this,
			'POST',
			'/bin/replicate.json',
			{
				cmd: 'Activate',
				path: normalizedPath,
			},
		);

		responseData = {
			success: true,
			action: 'publish',
			path: normalizedPath,
		};
	} else if (operation === 'unpublish') {
		// Unpublish content fragment
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		await aemHttpRequest.call(
			this,
			'POST',
			'/bin/replicate.json',
			{
				cmd: 'Deactivate',
				path: normalizedPath,
			},
		);

		responseData = {
			success: true,
			action: 'unpublish',
			path: normalizedPath,
		};
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
