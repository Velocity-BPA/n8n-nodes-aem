/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const workflowOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['workflow'],
			},
		},
		options: [
			{
				name: 'Complete Step',
				value: 'complete',
				description: 'Complete a workflow step',
				action: 'Complete a workflow step',
			},
			{
				name: 'Get Instance',
				value: 'getInstance',
				description: 'Get workflow instance details',
				action: 'Get workflow instance',
			},
			{
				name: 'Get Many Instances',
				value: 'getInstances',
				description: 'List running workflow instances',
				action: 'Get many workflow instances',
			},
			{
				name: 'Get Many Models',
				value: 'getAll',
				description: 'List available workflow models',
				action: 'Get many workflow models',
			},
			{
				name: 'Start',
				value: 'start',
				description: 'Start a workflow instance',
				action: 'Start a workflow',
			},
			{
				name: 'Terminate',
				value: 'terminate',
				description: 'Terminate a running workflow',
				action: 'Terminate a workflow',
			},
		],
		default: 'getAll',
	},
];

export const workflowFields: INodeProperties[] = [
	{
		displayName: 'Model ID',
		name: 'modelId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/var/workflow/models/request_for_activation',
		description: 'The workflow model identifier',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['start'],
			},
		},
	},
	{
		displayName: 'Payload Path',
		name: 'payloadPath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/asset.jpg',
		description: 'The content path for the workflow payload',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['start'],
			},
		},
	},
	{
		displayName: 'Instance ID',
		name: 'instanceId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/var/workflow/instances/server0/2024-01-15/workflow_123',
		description: 'The workflow instance identifier',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['getInstance', 'terminate', 'complete'],
			},
		},
	},
	{
		displayName: 'Work Item ID',
		name: 'workItemId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'node1_workitem',
		description: 'The work item to complete',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['complete'],
			},
		},
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		default: '',
		placeholder: 'Approved for publishing',
		description: 'Comment for the workflow action',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['start', 'terminate', 'complete'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['getAll', 'getInstances'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 20,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['getAll', 'getInstances'],
				returnAll: [false],
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
				resource: ['workflow'],
				operation: ['getInstances'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Running', value: 'RUNNING' },
					{ name: 'Completed', value: 'COMPLETED' },
					{ name: 'Aborted', value: 'ABORTED' },
					{ name: 'Suspended', value: 'SUSPENDED' },
				],
				default: 'RUNNING',
				description: 'Filter by workflow status',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				description: 'Filter by workflow model path',
			},
		],
	},
];
