/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IHookFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

import { aemHttpRequest } from './transport/GenericFunctions';

// Runtime licensing notice (logged once)
let licensingNoticeLogged = false;
function logLicensingNotice(): void {
	if (!licensingNoticeLogged) {
		console.warn(
			'[Velocity BPA Licensing Notice] This n8n node is licensed under the Business Source License 1.1 (BSL 1.1). ' +
			'Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA. ' +
			'For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.'
		);
		licensingNoticeLogged = true;
	}
}

export class AemTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AEM Trigger',
		name: 'aemTrigger',
		icon: 'file:aem.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger workflows on Adobe Experience Manager events',
		defaults: {
			name: 'AEM Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'aemApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Trigger Mode',
				name: 'triggerMode',
				type: 'options',
				options: [
					{
						name: 'Polling',
						value: 'polling',
						description: 'Poll AEM for changes at regular intervals',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Receive events from AEM via webhook (requires AEM configuration)',
					},
				],
				default: 'polling',
				description: 'How to trigger the workflow',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Asset Created',
						value: 'asset.created',
						description: 'Triggers when a new asset is uploaded',
					},
					{
						name: 'Asset Modified',
						value: 'asset.modified',
						description: 'Triggers when an asset is modified',
					},
					{
						name: 'Asset Deleted',
						value: 'asset.deleted',
						description: 'Triggers when an asset is deleted',
					},
					{
						name: 'Content Fragment Created',
						value: 'contentFragment.created',
						description: 'Triggers when a new content fragment is created',
					},
					{
						name: 'Content Fragment Modified',
						value: 'contentFragment.modified',
						description: 'Triggers when a content fragment is modified',
					},
					{
						name: 'Page Created',
						value: 'page.created',
						description: 'Triggers when a new page is created',
					},
					{
						name: 'Page Modified',
						value: 'page.modified',
						description: 'Triggers when a page is modified',
					},
					{
						name: 'Page Published',
						value: 'page.published',
						description: 'Triggers when a page is published',
					},
					{
						name: 'Page Unpublished',
						value: 'page.unpublished',
						description: 'Triggers when a page is unpublished',
					},
					{
						name: 'Workflow Completed',
						value: 'workflow.completed',
						description: 'Triggers when a workflow completes',
					},
					{
						name: 'Workflow Failed',
						value: 'workflow.failed',
						description: 'Triggers when a workflow fails',
					},
				],
				default: 'asset.created',
				description: 'The event to listen for',
			},
			{
				displayName: 'Watch Path',
				name: 'watchPath',
				type: 'string',
				default: '/content/dam',
				description: 'The path to watch for changes',
				displayOptions: {
					show: {
						triggerMode: ['polling'],
					},
				},
			},
			{
				displayName: 'Include Subfolders',
				name: 'includeSubfolders',
				type: 'boolean',
				default: true,
				description: 'Whether to include changes in subfolders',
				displayOptions: {
					show: {
						triggerMode: ['polling'],
					},
				},
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						triggerMode: ['polling'],
					},
				},
				options: [
					{
						displayName: 'MIME Type',
						name: 'mimeType',
						type: 'string',
						default: '',
						placeholder: 'image/*',
						description: 'Filter by MIME type pattern',
					},
					{
						displayName: 'Name Pattern',
						name: 'namePattern',
						type: 'string',
						default: '',
						placeholder: '*.jpg',
						description: 'Filter by name pattern (glob)',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Webhooks need to be configured in AEM
				// This just validates the connection
				try {
					await aemHttpRequest.call(this, 'GET', '/bin/querybuilder.json', undefined, { 'p.limit': 0 });
					return true;
				} catch {
					return false;
				}
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Webhook creation in AEM requires OSGi configuration
				// Return true as we assume the webhook is configured
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Webhook deletion in AEM requires OSGi configuration
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		logLicensingNotice();

		const req = this.getRequestObject();
		const body = req.body as IDataObject;

		// Parse AEM event payload
		const eventType = body.eventType as string;
		const path = body.path as string;
		const timestamp = body.timestamp as string;
		const userId = body.userId as string;
		const properties = body.properties as IDataObject || {};

		return {
			workflowData: [
				this.helpers.returnJsonArray([
					{
						eventType,
						path,
						timestamp,
						userId,
						properties,
						...body,
					},
				]),
			],
		};
	}

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		logLicensingNotice();

		const event = this.getNodeParameter('event') as string;
		const watchPath = this.getNodeParameter('watchPath') as string;
		const includeSubfolders = this.getNodeParameter('includeSubfolders') as boolean;
		const filters = this.getNodeParameter('filters', {}) as IDataObject;

		// Get the last poll time from workflow static data
		const workflowStaticData = this.getWorkflowStaticData('node');
		const lastPollTime = (workflowStaticData.lastPollTime as string) || new Date(Date.now() - 60000).toISOString();

		// Update last poll time
		workflowStaticData.lastPollTime = new Date().toISOString();

		// Build query based on event type
		const [resourceType, action] = event.split('.');
		let query: IDataObject = {};
		let searchPath = watchPath;

		switch (resourceType) {
			case 'asset':
				query = {
					'path': searchPath,
					'type': 'dam:Asset',
					'p.limit': -1,
				};
				if (action === 'created') {
					query['daterange.property'] = 'jcr:created';
					query['daterange.lowerBound'] = lastPollTime;
				} else if (action === 'modified') {
					query['daterange.property'] = 'jcr:content/jcr:lastModified';
					query['daterange.lowerBound'] = lastPollTime;
				}
				break;
			case 'contentFragment':
				query = {
					'path': searchPath,
					'type': 'dam:Asset',
					'property': 'jcr:content/contentFragment',
					'property.value': 'true',
					'p.limit': -1,
				};
				if (action === 'created') {
					query['daterange.property'] = 'jcr:created';
					query['daterange.lowerBound'] = lastPollTime;
				} else if (action === 'modified') {
					query['daterange.property'] = 'jcr:content/jcr:lastModified';
					query['daterange.lowerBound'] = lastPollTime;
				}
				break;
			case 'page':
				searchPath = watchPath.startsWith('/content/dam') ? '/content' : watchPath;
				query = {
					'path': searchPath,
					'type': 'cq:Page',
					'p.limit': -1,
				};
				if (action === 'created') {
					query['daterange.property'] = 'jcr:content/jcr:created';
					query['daterange.lowerBound'] = lastPollTime;
				} else if (action === 'modified') {
					query['daterange.property'] = 'jcr:content/cq:lastModified';
					query['daterange.lowerBound'] = lastPollTime;
				} else if (action === 'published') {
					query['daterange.property'] = 'jcr:content/cq:lastReplicated';
					query['daterange.lowerBound'] = lastPollTime;
					query['property'] = 'jcr:content/cq:lastReplicationAction';
					query['property.value'] = 'Activate';
				} else if (action === 'unpublished') {
					query['daterange.property'] = 'jcr:content/cq:lastReplicated';
					query['daterange.lowerBound'] = lastPollTime;
					query['property'] = 'jcr:content/cq:lastReplicationAction';
					query['property.value'] = 'Deactivate';
				}
				break;
			case 'workflow':
				query = {
					'path': '/var/workflow/instances',
					'type': 'cq:Workflow',
					'p.limit': -1,
				};
				if (action === 'completed') {
					query['property'] = 'status';
					query['property.value'] = 'COMPLETED';
					query['daterange.property'] = 'endTime';
					query['daterange.lowerBound'] = lastPollTime;
				} else if (action === 'failed') {
					query['property'] = 'status';
					query['property.value'] = 'ABORTED';
					query['daterange.property'] = 'endTime';
					query['daterange.lowerBound'] = lastPollTime;
				}
				break;
			default:
				return null;
		}

		// Handle subfolder option
		if (!includeSubfolders) {
			query['path.flat'] = 'true';
		}

		// Execute query
		const response = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			query,
		);

		const hits = (response.hits as IDataObject[]) || [];

		// Apply filters
		let filteredHits = hits;
		if (filters.mimeType) {
			const mimePattern = new RegExp((filters.mimeType as string).replace('*', '.*'));
			filteredHits = filteredHits.filter((hit) => {
				const jcrContent = hit['jcr:content'] as IDataObject | undefined;
				const metadata = jcrContent?.metadata as IDataObject | undefined;
				const mimeType = metadata?.['dc:format'] || hit['dc:format'] || '';
				return mimePattern.test(mimeType as string);
			});
		}
		if (filters.namePattern) {
			const namePattern = new RegExp((filters.namePattern as string).replace('*', '.*'));
			filteredHits = filteredHits.filter((hit) => {
				const name = hit.name || (hit.path as string)?.split('/').pop() || '';
				return namePattern.test(name as string);
			});
		}

		if (filteredHits.length === 0) {
			return null;
		}

		// Format results
		const results = filteredHits.map((hit) => ({
			eventType: event,
			path: hit.path,
			name: hit.name || (hit.path as string)?.split('/').pop(),
			timestamp: new Date().toISOString(),
			...hit,
		}));

		return [this.helpers.returnJsonArray(results)];
	}
}
