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
	normalizePath,
} from '../../transport/GenericFunctions';

export async function executeContentFragmentModelOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		// Get model definition
		const modelPath = this.getNodeParameter('modelPath', i) as string;
		const normalizedPath = normalizePath(modelPath);

		responseData = await aemHttpRequest.call(
			this,
			'GET',
			`${normalizedPath}.json`,
		);
	} else if (operation === 'getAll') {
		// List all models
		const configPath = this.getNodeParameter('configPath', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const normalizedPath = normalizePath(configPath);

		const response = await aemHttpRequest.call(
			this,
			'GET',
			`${normalizedPath}/settings/dam/cfm/models.infinity.json`,
		);

		// Extract models from response
		const models: IDataObject[] = [];
		if (response && typeof response === 'object') {
			for (const key of Object.keys(response)) {
				if (key.startsWith('jcr:') || key.startsWith('sling:')) continue;
				const item = response[key] as IDataObject;
				if (item && item['jcr:primaryType'] === 'cq:Template') {
					models.push({
						name: key,
						path: `${normalizedPath}/settings/dam/cfm/models/${key}`,
						...item,
					});
				}
			}
		}

		if (returnAll) {
			responseData = models;
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			responseData = models.slice(0, limit);
		}
	} else if (operation === 'getFields') {
		// Get model fields
		const modelPath = this.getNodeParameter('modelPath', i) as string;
		const normalizedPath = normalizePath(modelPath);

		const response = await aemHttpRequest.call(
			this,
			'GET',
			`${normalizedPath}/jcr:content.infinity.json`,
		);

		// Extract field definitions
		const fields: IDataObject[] = [];
		if (response && typeof response === 'object') {
			const items = (response as IDataObject).items as IDataObject;
			if (items) {
				for (const key of Object.keys(items)) {
					if (key.startsWith('jcr:') || key.startsWith('sling:')) continue;
					const field = items[key] as IDataObject;
					if (field) {
						fields.push({
							name: key,
							type: field.fieldType || field['metaType'],
							label: field.fieldLabel || field['jcr:title'],
							required: field.required || false,
							multiValue: field.multiField || false,
							...field,
						});
					}
				}
			}
		}

		responseData = fields;
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
