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
} from '../../transport/GenericFunctions';

export async function executeWorkflowOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'getAll') {
		// List workflow models
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		const response = await aemHttpRequest.call(
			this,
			'GET',
			'/var/workflow/models.infinity.json',
		);

		// Extract models from response
		const models: IDataObject[] = [];
		if (response && typeof response === 'object') {
			for (const key of Object.keys(response)) {
				if (key.startsWith('jcr:') || key.startsWith('sling:') || key.startsWith('rep:')) continue;
				const model = response[key] as IDataObject;
				if (model && model['jcr:primaryType'] === 'cq:WorkflowModel') {
					models.push({
						id: `/var/workflow/models/${key}`,
						name: key,
						title: model['jcr:title'] || key,
						description: model['jcr:description'],
						...model,
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
	} else if (operation === 'start') {
		// Start workflow
		const modelId = this.getNodeParameter('modelId', i) as string;
		const payloadPath = this.getNodeParameter('payloadPath', i) as string;
		const comment = this.getNodeParameter('comment', i, '') as string;

		const body: IDataObject = {
			model: modelId,
			payload: payloadPath,
			payloadType: 'JCR_PATH',
		};

		if (comment) {
			body.comment = comment;
		}

		responseData = await aemHttpRequest.call(
			this,
			'POST',
			'/etc/workflow/instances',
			body,
		);

		responseData = {
			success: true,
			modelId,
			payloadPath,
			...responseData,
		};
	} else if (operation === 'getInstances') {
		// List workflow instances
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = {};
		if (filters.status) {
			query.status = filters.status;
		}
		if (filters.model) {
			query.model = filters.model;
		}

		const response = await aemHttpRequest.call(
			this,
			'GET',
			'/var/workflow/instances.json',
			undefined,
			query,
		);

		// Extract instances
		const instances: IDataObject[] = [];
		if (Array.isArray(response)) {
			instances.push(...(response as IDataObject[]));
		} else if (response && typeof response === 'object') {
			for (const key of Object.keys(response)) {
				if (key.startsWith('jcr:') || key.startsWith('sling:')) continue;
				const instance = response[key] as IDataObject;
				if (instance) {
					instances.push({
						id: key,
						...instance,
					});
				}
			}
		}

		if (returnAll) {
			responseData = instances;
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			responseData = instances.slice(0, limit);
		}
	} else if (operation === 'getInstance') {
		// Get workflow instance
		const instanceId = this.getNodeParameter('instanceId', i) as string;

		responseData = await aemHttpRequest.call(
			this,
			'GET',
			`${instanceId}.json`,
		);
	} else if (operation === 'terminate') {
		// Terminate workflow
		const instanceId = this.getNodeParameter('instanceId', i) as string;
		const comment = this.getNodeParameter('comment', i, '') as string;

		const body: IDataObject = {
			action: 'ABORT',
		};

		if (comment) {
			body.comment = comment;
		}

		await aemHttpRequest.call(
			this,
			'POST',
			instanceId,
			body,
		);

		responseData = {
			success: true,
			action: 'terminate',
			instanceId,
		};
	} else if (operation === 'complete') {
		// Complete workflow step
		const instanceId = this.getNodeParameter('instanceId', i) as string;
		const workItemId = this.getNodeParameter('workItemId', i) as string;
		const comment = this.getNodeParameter('comment', i, '') as string;

		const body: IDataObject = {
			action: 'COMPLETE',
			item: workItemId,
		};

		if (comment) {
			body.comment = comment;
		}

		await aemHttpRequest.call(
			this,
			'POST',
			instanceId,
			body,
		);

		responseData = {
			success: true,
			action: 'complete',
			instanceId,
			workItemId,
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
