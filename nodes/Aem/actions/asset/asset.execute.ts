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
	aemUploadBinary,
	processAemResponse,
	normalizePath,
	getNameFromPath,
} from '../../transport/GenericFunctions';
import type { ISirenResponse } from '../../types/AemTypes';

export async function executeAssetOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		// Get asset metadata
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		const response = (await aemAssetsApiRequest.call(
			this,
			'GET',
			normalizedPath,
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'getAll') {
		// List assets in folder
		const folderPath = this.getNodeParameter('folderPath', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const normalizedPath = normalizePath(folderPath);

		const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;
		const query: IDataObject = {};

		if (additionalOptions.orderBy) {
			query.orderby = additionalOptions.orderBy;
		}
		if (additionalOptions.orderDirection) {
			query.orderby = `${query.orderby || 'name'} ${additionalOptions.orderDirection}`;
		}

		if (returnAll) {
			responseData = await aemApiRequestAllItems.call(this, normalizedPath, query);
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			responseData = await aemApiRequestAllItems.call(this, normalizedPath, query, limit);
		}
	} else if (operation === 'create') {
		// Upload new asset
		const destinationFolder = this.getNodeParameter('destinationFolder', i) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		const fileName = this.getNodeParameter('fileName', i) as string;
		const overwrite = this.getNodeParameter('overwrite', i, false) as boolean;
		const metadata = this.getNodeParameter('metadata', i, {}) as IDataObject;

		const normalizedFolder = normalizePath(destinationFolder);

		// Get binary data
		const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
		const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
		const mimeType = binaryData.mimeType || 'application/octet-stream';

		// Check if asset already exists
		if (!overwrite) {
			try {
				await aemAssetsApiRequest.call(this, 'GET', `${normalizedFolder}/${fileName}`);
				throw new NodeOperationError(
					this.getNode(),
					`Asset ${fileName} already exists. Enable overwrite to replace it.`,
					{ itemIndex: i },
				);
			} catch (error) {
				// Asset doesn't exist, continue with creation
				if ((error as NodeOperationError).message?.includes('already exists')) {
					throw error;
				}
			}
		}

		// Upload the asset
		responseData = await aemUploadBinary.call(
			this,
			`${normalizedFolder}/*`,
			buffer,
			mimeType,
			fileName,
		);

		// Update metadata if provided
		if (metadata.metadataValues && Array.isArray((metadata.metadataValues as IDataObject[]))) {
			const metadataObj: IDataObject = {};
			for (const item of (metadata.metadataValues as IDataObject[])) {
				metadataObj[item.property as string] = item.value;
			}

			await aemAssetsApiRequest.call(
				this,
				'PUT',
				`${normalizedFolder}/${fileName}`,
				{ properties: metadataObj },
			);
		}
	} else if (operation === 'update') {
		// Update asset metadata
		const path = this.getNodeParameter('path', i) as string;
		const metadata = this.getNodeParameter('metadata', i, {}) as IDataObject;
		const normalizedPath = normalizePath(path);

		const metadataObj: IDataObject = {};
		if (metadata.metadataValues && Array.isArray((metadata.metadataValues as IDataObject[]))) {
			for (const item of (metadata.metadataValues as IDataObject[])) {
				metadataObj[item.property as string] = item.value;
			}
		}

		const response = (await aemAssetsApiRequest.call(
			this,
			'PUT',
			normalizedPath,
			{ properties: metadataObj },
		)) as ISirenResponse;

		responseData = processAemResponse(response);
	} else if (operation === 'updateBinary') {
		// Update asset binary
		const path = this.getNodeParameter('path', i) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		const normalizedPath = normalizePath(path);

		const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
		const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
		const mimeType = binaryData.mimeType || 'application/octet-stream';
		const fileName = binaryData.fileName || getNameFromPath(path);

		responseData = await aemUploadBinary.call(
			this,
			normalizedPath,
			buffer,
			mimeType,
			fileName,
		);
	} else if (operation === 'delete') {
		// Delete asset
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		await aemAssetsApiRequest.call(this, 'DELETE', normalizedPath);

		responseData = { success: true, deletedPath: normalizedPath };
	} else if (operation === 'copy') {
		// Copy asset
		const path = this.getNodeParameter('path', i) as string;
		const destination = this.getNodeParameter('destination', i) as string;
		const newName = this.getNodeParameter('newName', i, '') as string;
		const overwrite = this.getNodeParameter('overwrite', i, false) as boolean;

		const normalizedPath = normalizePath(path);
		const normalizedDest = normalizePath(destination);
		const assetName = newName || getNameFromPath(path);

		const formData: IDataObject = {
			':operation': 'copy',
			':dest': `${normalizedDest}/${assetName}`,
			':replace': overwrite.toString(),
		};

		await aemSlingPostRequest.call(this, normalizedPath, formData);

		responseData = {
			success: true,
			sourcePath: normalizedPath,
			destinationPath: `${normalizedDest}/${assetName}`,
		};
	} else if (operation === 'move') {
		// Move asset
		const path = this.getNodeParameter('path', i) as string;
		const destination = this.getNodeParameter('destination', i) as string;
		const newName = this.getNodeParameter('newName', i, '') as string;
		const overwrite = this.getNodeParameter('overwrite', i, false) as boolean;

		const normalizedPath = normalizePath(path);
		const normalizedDest = normalizePath(destination);
		const assetName = newName || getNameFromPath(path);

		const formData: IDataObject = {
			':operation': 'move',
			':dest': `${normalizedDest}/${assetName}`,
			':replace': overwrite.toString(),
		};

		await aemSlingPostRequest.call(this, normalizedPath, formData);

		responseData = {
			success: true,
			sourcePath: normalizedPath,
			destinationPath: `${normalizedDest}/${assetName}`,
		};
	} else if (operation === 'getRenditions') {
		// Get asset renditions
		const path = this.getNodeParameter('path', i) as string;
		const normalizedPath = normalizePath(path);

		const response = (await aemAssetsApiRequest.call(
			this,
			'GET',
			`${normalizedPath}/renditions`,
		)) as ISirenResponse;

		responseData = response.entities
			? response.entities.map((e) => e.properties)
			: [];
	} else if (operation === 'createRendition') {
		// Create rendition
		const path = this.getNodeParameter('path', i) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		const renditionName = this.getNodeParameter('renditionName', i) as string;

		const normalizedPath = normalizePath(path);

		const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
		const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
		const mimeType = binaryData.mimeType || 'application/octet-stream';

		responseData = await aemUploadBinary.call(
			this,
			`${normalizedPath}/renditions/${renditionName}`,
			buffer,
			mimeType,
			renditionName,
		);
	} else if (operation === 'deleteRendition') {
		// Delete rendition
		const path = this.getNodeParameter('path', i) as string;
		const renditionName = this.getNodeParameter('renditionName', i) as string;

		const normalizedPath = normalizePath(path);

		await aemAssetsApiRequest.call(
			this,
			'DELETE',
			`${normalizedPath}/renditions/${renditionName}`,
		);

		responseData = {
			success: true,
			assetPath: normalizedPath,
			deletedRendition: renditionName,
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
