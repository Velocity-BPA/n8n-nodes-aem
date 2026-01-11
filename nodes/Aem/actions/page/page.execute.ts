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
	normalizePath,
	getNameFromPath,
} from '../../transport/GenericFunctions';

export async function executePageOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		// Get page content
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const normalizedPath = normalizePath(pagePath);

		responseData = await aemHttpRequest.call(
			this,
			'GET',
			`${normalizedPath}.infinity.json`,
		);
	} else if (operation === 'create') {
		// Create new page
		const parentPath = this.getNodeParameter('parentPath', i) as string;
		const pageName = this.getNodeParameter('pageName', i) as string;
		const title = this.getNodeParameter('title', i) as string;
		const template = this.getNodeParameter('template', i) as string;
		const properties = this.getNodeParameter('properties', i, {}) as IDataObject;

		const normalizedParent = normalizePath(parentPath);

		const formData: IDataObject = {
			':nameHint': pageName,
			'./jcr:primaryType': 'cq:Page',
			'./jcr:content/jcr:primaryType': 'cq:PageContent',
			'./jcr:content/jcr:title': title,
			'./jcr:content/cq:template': template,
			'./jcr:content/sling:resourceType': template.replace('/conf/', '').replace('/settings/wcm/templates/', '/components/'),
		};

		// Add additional properties
		if (properties.propertyValues && Array.isArray(properties.propertyValues)) {
			for (const prop of properties.propertyValues as IDataObject[]) {
				formData[`./jcr:content/${prop.name}`] = prop.value;
			}
		}

		await aemSlingPostRequest.call(this, `${normalizedParent}/*`, formData);

		responseData = {
			success: true,
			path: `${normalizedParent}/${pageName}`,
			title,
		};
	} else if (operation === 'update') {
		// Update page properties
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const title = this.getNodeParameter('title', i, '') as string;
		const properties = this.getNodeParameter('properties', i, {}) as IDataObject;

		const normalizedPath = normalizePath(pagePath);

		const formData: IDataObject = {};

		if (title) {
			formData['./jcr:title'] = title;
		}

		// Add additional properties
		if (properties.propertyValues && Array.isArray(properties.propertyValues)) {
			for (const prop of properties.propertyValues as IDataObject[]) {
				formData[`./${prop.name}`] = prop.value;
			}
		}

		await aemSlingPostRequest.call(this, `${normalizedPath}/jcr:content`, formData);

		responseData = {
			success: true,
			path: normalizedPath,
		};
	} else if (operation === 'delete') {
		// Delete page
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const normalizedPath = normalizePath(pagePath);

		const formData: IDataObject = {
			':operation': 'delete',
		};

		await aemSlingPostRequest.call(this, normalizedPath, formData);

		responseData = { success: true, deletedPath: normalizedPath };
	} else if (operation === 'copy') {
		// Copy page
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const destination = this.getNodeParameter('destination', i) as string;
		const newName = this.getNodeParameter('newName', i, '') as string;
		const options = this.getNodeParameter('options', i, {}) as IDataObject;

		const normalizedPath = normalizePath(pagePath);
		const normalizedDest = normalizePath(destination);
		const name = newName || getNameFromPath(pagePath);

		const formData: IDataObject = {
			':operation': 'copy',
			':dest': `${normalizedDest}/${name}`,
			':replace': (options.overwrite || false).toString(),
		};

		if (options.shallow) {
			formData[':applyTo'] = normalizedPath;
		}

		await aemSlingPostRequest.call(this, normalizedPath, formData);

		responseData = {
			success: true,
			sourcePath: normalizedPath,
			destinationPath: `${normalizedDest}/${name}`,
		};
	} else if (operation === 'move') {
		// Move page
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const destination = this.getNodeParameter('destination', i) as string;
		const newName = this.getNodeParameter('newName', i, '') as string;

		const normalizedPath = normalizePath(pagePath);
		const normalizedDest = normalizePath(destination);
		const name = newName || getNameFromPath(pagePath);

		const formData: IDataObject = {
			':operation': 'move',
			':dest': `${normalizedDest}/${name}`,
		};

		await aemSlingPostRequest.call(this, normalizedPath, formData);

		responseData = {
			success: true,
			sourcePath: normalizedPath,
			destinationPath: `${normalizedDest}/${name}`,
		};
	} else if (operation === 'publish') {
		// Publish page
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const options = this.getNodeParameter('options', i, {}) as IDataObject;
		const normalizedPath = normalizePath(pagePath);

		await aemHttpRequest.call(
			this,
			'POST',
			'/bin/replicate.json',
			{
				cmd: 'Activate',
				path: normalizedPath,
				shallow: options.shallow || false,
			},
		);

		responseData = {
			success: true,
			action: 'publish',
			path: normalizedPath,
		};
	} else if (operation === 'unpublish') {
		// Unpublish page
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const normalizedPath = normalizePath(pagePath);

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
	} else if (operation === 'lock') {
		// Lock page
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const normalizedPath = normalizePath(pagePath);

		await aemHttpRequest.call(
			this,
			'POST',
			`${normalizedPath}/jcr:content.lock.json`,
		);

		responseData = {
			success: true,
			action: 'lock',
			path: normalizedPath,
		};
	} else if (operation === 'unlock') {
		// Unlock page
		const pagePath = this.getNodeParameter('pagePath', i) as string;
		const normalizedPath = normalizePath(pagePath);

		await aemHttpRequest.call(
			this,
			'POST',
			`${normalizedPath}/jcr:content.unlock.json`,
		);

		responseData = {
			success: true,
			action: 'unlock',
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
