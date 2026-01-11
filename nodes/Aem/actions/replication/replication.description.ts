/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const replicationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['replication'],
			},
		},
		options: [
			{
				name: 'Activate',
				value: 'activate',
				description: 'Replicate content to publish instance',
				action: 'Activate content',
			},
			{
				name: 'Clear Queue',
				value: 'clearQueue',
				description: 'Clear the replication queue',
				action: 'Clear replication queue',
			},
			{
				name: 'Deactivate',
				value: 'deactivate',
				description: 'Remove content from publish instance',
				action: 'Deactivate content',
			},
			{
				name: 'Get Queue',
				value: 'getQueue',
				description: 'Get replication queue status',
				action: 'Get replication queue',
			},
		],
		default: 'activate',
	},
];

export const replicationFields: INodeProperties[] = [
	// ----------------------------------
	//         replication: activate / deactivate
	// ----------------------------------
	{
		displayName: 'Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/mysite/en/page',
		description: 'Content path to replicate',
		displayOptions: {
			show: {
				resource: ['replication'],
				operation: ['activate', 'deactivate'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['replication'],
				operation: ['activate', 'deactivate'],
			},
		},
		options: [
			{
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				default: 'publish',
				description: 'Replication agent identifier',
			},
			{
				displayName: 'Deep',
				name: 'deep',
				type: 'boolean',
				default: false,
				description: 'Whether to include child content in replication',
			},
			{
				displayName: 'Modified Only',
				name: 'modifiedOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to only replicate modified content',
			},
			{
				displayName: 'Suppress Versions',
				name: 'suppressVersions',
				type: 'boolean',
				default: false,
				description: 'Whether to suppress version creation during replication',
			},
		],
	},

	// ----------------------------------
	//         replication: getQueue
	// ----------------------------------
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		default: 'publish',
		description: 'Replication agent identifier',
		displayOptions: {
			show: {
				resource: ['replication'],
				operation: ['getQueue', 'clearQueue'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all queue items or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['replication'],
				operation: ['getQueue'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['replication'],
				operation: ['getQueue'],
				returnAll: [false],
			},
		},
	},
];
