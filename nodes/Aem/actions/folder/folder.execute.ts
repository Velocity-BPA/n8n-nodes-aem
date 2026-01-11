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
	aemSlingPostRequest,
	processAemResponse,
	normalizePath,
	getNameFromPath,
} from '../../transport/GenericFunctions';
import type { ISirenResponse } from '../../types/AemTypes';

export async function executeFolderOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		// Get folder metadata and children
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		const response = (await aemAssetsApiRequest.call(
			this,
			'GET',
			normalizedPath,
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'getAll') {
		// List subfolders
		const parentPath = this.getNodeParameter('parentPath', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const normalizedPath = normalizePath(parentPath);

		const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;
		const query: IDataObject = {};

		if (additionalOptions.orderBy) {
			query.orderby = additionalOptions.orderBy;
		}

		const allItems = await aemApiRequestAllItems.call(this, normalizedPath, query);

		// Filter to only folders
		const folders = allItems.filter((item) => {
			const classes = item.class as string[] | undefined;
			return classes?.includes('assets/folder');
		});

		if (returnAll) {
			responseData = folders;
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			responseData = folders.slice(0, limit);
		}
	} else if (operation === 'create') {
		// Create new folder
		const parentFolder = this.getNodeParameter('parentFolder', i) as string;
		const name = this.getNodeParameter('name', i) as string;
		const title = this.getNodeParameter('title', i, '') as string;
		const properties = this.getNodeParameter('properties', i, {}) as IDataObject;

		const normalizedParent = normalizePath(parentFolder);

		const body: IDataObject = {
			class: 'assets/folder',
			properties: {
				name,
				'jcr:title': title || name,
			},
		};

		// Add additional properties
		if (properties.propertyValues && Array.isArray(properties.propertyValues)) {
			for (const prop of properties.propertyValues as IDataObject[]) {
				(body.properties as IDataObject)[prop.name as string] = prop.value;
			}
		}

		const response = (await aemAssetsApiRequest.call(
			this,
			'POST',
			normalizedParent,
			body,
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'update') {
		// Update folder properties
		const path = this.getNodeParameter('path', i) as string;
		const title = this.getNodeParameter('title', i, '') as string;
		const properties = this.getNodeParameter('properties', i, {}) as IDataObject;

		const normalizedPath = normalizePath(path);

		const propsToUpdate: IDataObject = {};

		if (title) {
			propsToUpdate['jcr:title'] = title;
		}

		// Add additional properties
		if (properties.propertyValues && Array.isArray(properties.propertyValues)) {
			for (const prop of properties.propertyValues as IDataObject[]) {
				propsToUpdate[prop.name as string] = prop.value;
			}
		}

		const response = (await aemAssetsApiRequest.call(
			this,
			'PUT',
			normalizedPath,
			{ properties: propsToUpdate },
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'delete') {
		// Delete folder
		const path = this.getNodeParameter('path', i) as string;
		const deleteContents = this.getNodeParameter('deleteContents', i, false) as boolean;

		const normalizedPath = normalizePath(path);

		if (deleteContents) {
			// Use Sling POST to delete with contents
			const formData: IDataObject = {
				':operation': 'delete',
			};
			await aemSlingPostRequest.call(this, normalizedPath, formData);
		} else {
			// Use Assets API delete (fails for non-empty folders)
			await aemAssetsApiRequest.call(this, 'DELETE', normalizedPath);
		}

		responseData = { success: true, deletedPath: normalizedPath };
	} else if (operation === 'copy') {
		// Copy folder
		const path = this.getNodeParameter('path', i) as string;
		const destination = this.getNodeParameter('destination', i) as string;
		const newName = this.getNodeParameter('newName', i, '') as string;
		const overwrite = this.getNodeParameter('overwrite', i, false) as boolean;

		const normalizedPath = normalizePath(path);
		const normalizedDest = normalizePath(destination);
		const folderName = newName || getNameFromPath(path);

		const formData: IDataObject = {
			':operation': 'copy',
			':dest': `${normalizedDest}/${folderName}`,
			':replace': overwrite.toString(),
		};

		await aemSlingPostRequest.call(this, normalizedPath, formData);

		responseData = {
			success: true,
			sourcePath: normalizedPath,
			destinationPath: `${normalizedDest}/${folderName}`,
		};
	} else if (operation === 'move') {
		// Move folder
		const path = this.getNodeParameter('path', i) as string;
		const destination = this.getNodeParameter('destination', i) as string;
		const newName = this.getNodeParameter('newName', i, '') as string;
		const overwrite = this.getNodeParameter('overwrite', i, false) as boolean;

		const normalizedPath = normalizePath(path);
		const normalizedDest = normalizePath(destination);
		const folderName = newName || getNameFromPath(path);

		const formData: IDataObject = {
			':operation': 'move',
			':dest': `${normalizedDest}/${folderName}`,
			':replace': overwrite.toString(),
		};

		await aemSlingPostRequest.call(this, normalizedPath, formData);

		responseData = {
			success: true,
			sourcePath: normalizedPath,
			destinationPath: `${normalizedDest}/${folderName}`,
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
