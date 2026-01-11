/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Add a comment to an asset',
				action: 'Create a comment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a comment',
				action: 'Delete a comment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List all comments on an asset',
				action: 'Get many comments',
			},
			{
				name: 'Reply',
				value: 'reply',
				description: 'Reply to an existing comment',
				action: 'Reply to a comment',
			},
		],
		default: 'getAll',
	},
];

export const commentFields: INodeProperties[] = [
	{
		displayName: 'Asset Path',
		name: 'assetPath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/images/hero.jpg',
		description: 'The path to the asset',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getAll', 'create'],
			},
		},
	},
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'comment-123',
		description: 'The comment identifier',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['delete', 'reply'],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'This is a comment',
		description: 'The comment message',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create', 'reply'],
			},
		},
	},
	{
		displayName: 'Annotation Data',
		name: 'annotationData',
		type: 'json',
		default: '{}',
		description: 'Optional annotation data for visual annotations (coordinates, etc.)',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create'],
			},
		},
	},
];
