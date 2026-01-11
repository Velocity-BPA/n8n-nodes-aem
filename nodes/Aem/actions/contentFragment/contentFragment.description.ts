/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const contentFragmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contentFragment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new content fragment',
				action: 'Create a content fragment',
			},
			{
				name: 'Create Variation',
				value: 'createVariation',
				description: 'Create a new variation',
				action: 'Create a variation',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a content fragment',
				action: 'Delete a content fragment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a content fragment',
				action: 'Get a content fragment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List content fragments in a folder',
				action: 'Get many content fragments',
			},
			{
				name: 'Get Variations',
				value: 'getVariations',
				description: 'List all variations',
				action: 'Get variations',
			},
			{
				name: 'Publish',
				value: 'publish',
				description: 'Publish a content fragment',
				action: 'Publish a content fragment',
			},
			{
				name: 'Unpublish',
				value: 'unpublish',
				description: 'Unpublish a content fragment',
				action: 'Unpublish a content fragment',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update content fragment elements',
				action: 'Update a content fragment',
			},
		],
		default: 'get',
	},
];

export const contentFragmentFields: INodeProperties[] = [
	// ----------------------------------
	//         contentFragment: get
	// ----------------------------------
	{
		displayName: 'Fragment Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/fragments/my-article',
		description: 'The path to the content fragment',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['get', 'update', 'delete', 'getVariations', 'createVariation', 'publish', 'unpublish'],
			},
		},
	},

	// ----------------------------------
	//         contentFragment: getAll
	// ----------------------------------
	{
		displayName: 'Folder Path',
		name: 'folderPath',
		type: 'string',
		required: true,
		default: '/content/dam',
		placeholder: '/content/dam/myproject/fragments',
		description: 'The folder path to list content fragments from',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
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
				resource: ['contentFragment'],
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
				resource: ['contentFragment'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},

	// ----------------------------------
	//         contentFragment: create
	// ----------------------------------
	{
		displayName: 'Parent Folder',
		name: 'parentFolder',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/fragments',
		description: 'The folder where the content fragment will be created',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Fragment Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my-article',
		description: 'The name for the new content fragment',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
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
		placeholder: 'My Article',
		description: 'The title for the content fragment',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Model Path',
		name: 'model',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/conf/myproject/settings/dam/cfm/models/article',
		description: 'The path to the Content Fragment Model',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		placeholder: 'Description of the content fragment',
		description: 'The description for the content fragment',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['create', 'update'],
			},
		},
	},

	// ----------------------------------
	//         contentFragment: elements
	// ----------------------------------
	{
		displayName: 'Elements',
		name: 'elements',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Element',
		description: 'Content fragment element values',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				name: 'elementValues',
				displayName: 'Element',
				values: [
					{
						displayName: 'Element Name',
						name: 'name',
						type: 'string',
						default: '',
						placeholder: 'main',
						description: 'The element name as defined in the model',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The element value',
						typeOptions: {
							rows: 4,
						},
					},
				],
			},
		],
	},

	// ----------------------------------
	//         contentFragment: variations
	// ----------------------------------
	{
		displayName: 'Variation Name',
		name: 'variationName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'web',
		description: 'The name for the variation',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['createVariation'],
			},
		},
	},
	{
		displayName: 'Variation Title',
		name: 'variationTitle',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Web Version',
		description: 'The display title for the variation',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['createVariation'],
			},
		},
	},

	// ----------------------------------
	//         contentFragment: tags
	// ----------------------------------
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		default: '',
		placeholder: 'namespace:tag1, namespace:tag2',
		description: 'Comma-separated list of tags',
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['create', 'update'],
			},
		},
	},

	// ----------------------------------
	//         contentFragment: additional options
	// ----------------------------------
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['contentFragment'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Filter by Model',
				name: 'modelPath',
				type: 'string',
				default: '',
				placeholder: '/conf/myproject/settings/dam/cfm/models/article',
				description: 'Filter content fragments by model',
			},
			{
				displayName: 'Include Subfolders',
				name: 'recursive',
				type: 'boolean',
				default: false,
				description: 'Whether to include content fragments from subfolders',
			},
		],
	},
];
