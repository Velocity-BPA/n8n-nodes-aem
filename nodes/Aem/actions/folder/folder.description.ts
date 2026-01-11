/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const folderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['folder'],
			},
		},
		options: [
			{
				name: 'Copy',
				value: 'copy',
				description: 'Copy a folder to a new location',
				action: 'Copy a folder',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new folder',
				action: 'Create a folder',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a folder',
				action: 'Delete a folder',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get folder metadata and children',
				action: 'Get a folder',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List all subfolders',
				action: 'Get many folders',
			},
			{
				name: 'Move',
				value: 'move',
				description: 'Move a folder to a new location',
				action: 'Move a folder',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update folder properties',
				action: 'Update a folder',
			},
		],
		default: 'get',
	},
];

export const folderFields: INodeProperties[] = [
	// ----------------------------------
	//         folder: get
	// ----------------------------------
	{
		displayName: 'Folder Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '/content/dam',
		placeholder: '/content/dam/myproject/images',
		description: 'The path to the folder in the DAM',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['get', 'update', 'delete', 'copy', 'move'],
			},
		},
	},

	// ----------------------------------
	//         folder: getAll
	// ----------------------------------
	{
		displayName: 'Parent Folder Path',
		name: 'parentPath',
		type: 'string',
		required: true,
		default: '/content/dam',
		placeholder: '/content/dam/myproject',
		description: 'The parent folder path to list subfolders from',
		displayOptions: {
			show: {
				resource: ['folder'],
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
				resource: ['folder'],
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
				resource: ['folder'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},

	// ----------------------------------
	//         folder: create
	// ----------------------------------
	{
		displayName: 'Parent Folder',
		name: 'parentFolder',
		type: 'string',
		required: true,
		default: '/content/dam',
		placeholder: '/content/dam/myproject',
		description: 'The parent folder where the new folder will be created',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Folder Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'new-folder',
		description: 'The name for the new folder',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Folder Title',
		name: 'title',
		type: 'string',
		default: '',
		placeholder: 'New Folder',
		description: 'The display title for the new folder',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['create', 'update'],
			},
		},
	},

	// ----------------------------------
	//         folder: update
	// ----------------------------------
	{
		displayName: 'Properties',
		name: 'properties',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Property',
		description: 'Folder properties to update',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['update', 'create'],
			},
		},
		options: [
			{
				name: 'propertyValues',
				displayName: 'Property',
				values: [
					{
						displayName: 'Property Name',
						name: 'name',
						type: 'string',
						default: '',
						placeholder: 'jcr:description',
						description: 'The property name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The property value',
					},
				],
			},
		],
	},

	// ----------------------------------
	//         folder: copy/move
	// ----------------------------------
	{
		displayName: 'Destination Path',
		name: 'destination',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/archive',
		description: 'The destination parent folder path',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['copy', 'move'],
			},
		},
	},
	{
		displayName: 'New Name',
		name: 'newName',
		type: 'string',
		default: '',
		placeholder: 'renamed-folder',
		description: 'Optional new name for the folder (leave empty to keep original)',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['copy', 'move'],
			},
		},
	},
	{
		displayName: 'Overwrite',
		name: 'overwrite',
		type: 'boolean',
		default: false,
		description: 'Whether to overwrite if the destination already exists',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['copy', 'move'],
			},
		},
	},

	// ----------------------------------
	//         folder: delete
	// ----------------------------------
	{
		displayName: 'Delete Contents',
		name: 'deleteContents',
		type: 'boolean',
		default: false,
		description: 'Whether to delete all contents of the folder (required for non-empty folders)',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['delete'],
			},
		},
	},

	// ----------------------------------
	//         folder: additional options
	// ----------------------------------
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Include Nested',
				name: 'recursive',
				type: 'boolean',
				default: false,
				description: 'Whether to include nested subfolders',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'options',
				options: [
					{ name: 'Name', value: 'name' },
					{ name: 'Modified Date', value: 'jcr:lastModified' },
					{ name: 'Created Date', value: 'jcr:created' },
					{ name: 'Title', value: 'jcr:title' },
				],
				default: 'name',
				description: 'Order the results by a property',
			},
		],
	},
];
