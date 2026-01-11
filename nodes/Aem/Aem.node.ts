/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

// Resource descriptions
import { assetOperations, assetFields } from './actions/asset/asset.description';
import { folderOperations, folderFields } from './actions/folder/folder.description';
import { contentFragmentOperations, contentFragmentFields } from './actions/contentFragment/contentFragment.description';
import { contentFragmentModelOperations, contentFragmentModelFields } from './actions/contentFragmentModel/contentFragmentModel.description';
import { graphqlOperations, graphqlFields } from './actions/graphql/graphql.description';
import { pageOperations, pageFields } from './actions/page/page.description';
import { commentOperations, commentFields } from './actions/comment/comment.description';
import { workflowOperations, workflowFields } from './actions/workflow/workflow.description';
import { tagOperations, tagFields } from './actions/tag/tag.description';
import { userOperations, userFields } from './actions/user/user.description';
import { replicationOperations, replicationFields } from './actions/replication/replication.description';

// Resource executors
import { executeAssetOperation } from './actions/asset/asset.execute';
import { executeFolderOperation } from './actions/folder/folder.execute';
import { executeContentFragmentOperation } from './actions/contentFragment/contentFragment.execute';
import { executeContentFragmentModelOperation } from './actions/contentFragmentModel/contentFragmentModel.execute';
import { executeGraphQlOperation } from './actions/graphql/graphql.execute';
import { executePageOperation } from './actions/page/page.execute';
import { executeCommentOperation } from './actions/comment/comment.execute';
import { executeWorkflowOperation } from './actions/workflow/workflow.execute';
import { executeTagOperation } from './actions/tag/tag.execute';
import { executeUserOperation } from './actions/user/user.execute';
import { executeReplicationOperation } from './actions/replication/replication.execute';

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

export class Aem implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adobe Experience Manager',
		name: 'aem',
		icon: 'file:aem.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Adobe Experience Manager API',
		defaults: {
			name: 'Adobe Experience Manager',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'aemApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Asset',
						value: 'asset',
					},
					{
						name: 'Comment',
						value: 'comment',
					},
					{
						name: 'Content Fragment',
						value: 'contentFragment',
					},
					{
						name: 'Content Fragment Model',
						value: 'contentFragmentModel',
					},
					{
						name: 'Folder',
						value: 'folder',
					},
					{
						name: 'GraphQL',
						value: 'graphql',
					},
					{
						name: 'Page',
						value: 'page',
					},
					{
						name: 'Replication',
						value: 'replication',
					},
					{
						name: 'Tag',
						value: 'tag',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Workflow',
						value: 'workflow',
					},
				],
				default: 'asset',
			},
			// Operations
			...assetOperations,
			...folderOperations,
			...contentFragmentOperations,
			...contentFragmentModelOperations,
			...graphqlOperations,
			...pageOperations,
			...commentOperations,
			...workflowOperations,
			...tagOperations,
			...userOperations,
			...replicationOperations,
			// Fields
			...assetFields,
			...folderFields,
			...contentFragmentFields,
			...contentFragmentModelFields,
			...graphqlFields,
			...pageFields,
			...commentFields,
			...workflowFields,
			...tagFields,
			...userFields,
			...replicationFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log licensing notice once per node load
		logLicensingNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let executionResult: INodeExecutionData[];

				switch (resource) {
					case 'asset':
						executionResult = await executeAssetOperation.call(this, operation, i);
						break;
					case 'folder':
						executionResult = await executeFolderOperation.call(this, operation, i);
						break;
					case 'contentFragment':
						executionResult = await executeContentFragmentOperation.call(this, operation, i);
						break;
					case 'contentFragmentModel':
						executionResult = await executeContentFragmentModelOperation.call(this, operation, i);
						break;
					case 'graphql':
						executionResult = await executeGraphQlOperation.call(this, operation, i);
						break;
					case 'page':
						executionResult = await executePageOperation.call(this, operation, i);
						break;
					case 'comment':
						executionResult = await executeCommentOperation.call(this, operation, i);
						break;
					case 'workflow':
						executionResult = await executeWorkflowOperation.call(this, operation, i);
						break;
					case 'tag':
						executionResult = await executeTagOperation.call(this, operation, i);
						break;
					case 'user':
						executionResult = await executeUserOperation.call(this, operation, i);
						break;
					case 'replication':
						executionResult = await executeReplicationOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...executionResult);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
