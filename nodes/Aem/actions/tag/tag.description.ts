/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tag'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new tag',
				action: 'Create a tag',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a tag',
				action: 'Delete a tag',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get tag details',
				action: 'Get a tag',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List all tags in a namespace',
				action: 'Get many tags',
			},
			{
				name: 'Get Tagged Content',
				value: 'getTagged',
				description: 'Get content tagged with a specific tag',
				action: 'Get tagged content',
			},
		],
		default: 'get',
	},
];

export const tagFields: INodeProperties[] = [
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'marketing:campaign/summer-2024',
		description: 'The tag identifier (namespace:tag/subtag)',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['get', 'delete', 'getTagged'],
			},
		},
	},
	{
		displayName: 'Namespace',
		name: 'namespace',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'marketing',
		description: 'The tag namespace',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['getAll', 'create'],
			},
		},
	},
	{
		displayName: 'Tag Name',
		name: 'tagName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'campaign/summer-2024',
		description: 'The tag name (can include hierarchy with /)',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Summer 2024 Campaign',
		description: 'The display title for the tag',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		placeholder: 'Tags for summer 2024 marketing campaign',
		description: 'The tag description',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['create'],
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
				resource: ['tag'],
				operation: ['getAll', 'getTagged'],
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
				resource: ['tag'],
				operation: ['getAll', 'getTagged'],
				returnAll: [false],
			},
		},
	},
];
