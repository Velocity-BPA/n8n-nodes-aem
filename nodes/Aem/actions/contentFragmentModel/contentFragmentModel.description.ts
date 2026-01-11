/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const contentFragmentModelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contentFragmentModel'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a content fragment model definition',
				action: 'Get a content fragment model',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List all content fragment models',
				action: 'Get many content fragment models',
			},
			{
				name: 'Get Fields',
				value: 'getFields',
				description: 'Get field definitions for a model',
				action: 'Get model fields',
			},
		],
		default: 'get',
	},
];

export const contentFragmentModelFields: INodeProperties[] = [
	{
		displayName: 'Model Path',
		name: 'modelPath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/conf/myproject/settings/dam/cfm/models/article',
		description: 'The path to the content fragment model',
		displayOptions: {
			show: {
				resource: ['contentFragmentModel'],
				operation: ['get', 'getFields'],
			},
		},
	},
	{
		displayName: 'Configuration Path',
		name: 'configPath',
		type: 'string',
		required: true,
		default: '/conf',
		placeholder: '/conf/myproject',
		description: 'The configuration path to list models from',
		displayOptions: {
			show: {
				resource: ['contentFragmentModel'],
				operation: ['getAll'],
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
				resource: ['contentFragmentModel'],
				operation: ['getAll'],
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
				resource: ['contentFragmentModel'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
];
