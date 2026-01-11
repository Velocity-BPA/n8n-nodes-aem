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

export async function executeReplicationOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'activate') {
		// Activate (publish) content
		const path = this.getNodeParameter('path', i) as string;
		const options = this.getNodeParameter('options', i, {}) as IDataObject;

		const agentId = (options.agentId as string) || 'publish';
		const deep = options.deep as boolean;
		const modifiedOnly = options.modifiedOnly as boolean;
		const suppressVersions = options.suppressVersions as boolean;

		const body: IDataObject = {
			path,
			cmd: 'Activate',
			agentId,
		};

		if (deep) {
			body.deep = 'true';
		}
		if (modifiedOnly) {
			body.onlyModified = 'true';
		}
		if (suppressVersions) {
			body.suppressVersions = 'true';
		}

		await aemSlingPostRequest.call(this, '/bin/replicate', body);

		responseData = {
			success: true,
			action: 'activate',
			path,
			agentId,
			deep: deep || false,
		};
	} else if (operation === 'deactivate') {
		// Deactivate (unpublish) content
		const path = this.getNodeParameter('path', i) as string;
		const options = this.getNodeParameter('options', i, {}) as IDataObject;

		const agentId = (options.agentId as string) || 'publish';
		const deep = options.deep as boolean;

		const body: IDataObject = {
			path,
			cmd: 'Deactivate',
			agentId,
		};

		if (deep) {
			body.deep = 'true';
		}

		await aemSlingPostRequest.call(this, '/bin/replicate', body);

		responseData = {
			success: true,
			action: 'deactivate',
			path,
			agentId,
			deep: deep || false,
		};
	} else if (operation === 'getQueue') {
		// Get replication queue
		const agentId = this.getNodeParameter('agentId', i, 'publish') as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;

		const response = await aemHttpRequest.call(
			this,
			'GET',
			`/etc/replication/agents.author/${agentId}.queue.json`,
		);

		const queueItems: IDataObject[] = [];
		if (response && response.queue && Array.isArray(response.queue)) {
			for (const item of response.queue as IDataObject[]) {
				queueItems.push({
					path: item.path,
					action: item.action,
					type: item.type,
					time: item.time,
					userId: item.userId,
					...item,
				});
			}
		} else if (response && typeof response === 'object') {
			// Handle different response formats
			for (const key of Object.keys(response)) {
				if (key.startsWith('jcr:') || key.startsWith('sling:')) continue;
				const item = response[key] as IDataObject;
				if (item && typeof item === 'object') {
					queueItems.push({
						id: key,
						...item,
					});
				}
			}
		}

		if (returnAll) {
			responseData = queueItems;
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			responseData = queueItems.slice(0, limit);
		}

		// Add queue metadata
		responseData = {
			agentId,
			itemCount: queueItems.length,
			items: responseData,
		};
	} else if (operation === 'clearQueue') {
		// Clear replication queue
		const agentId = this.getNodeParameter('agentId', i, 'publish') as string;

		await aemSlingPostRequest.call(
			this,
			`/etc/replication/agents.author/${agentId}`,
			{
				'cmd': 'clear',
			},
		);

		responseData = {
			success: true,
			action: 'clearQueue',
			agentId,
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
