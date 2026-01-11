/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const assetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		options: [
			{
				name: 'Copy',
				value: 'copy',
				description: 'Copy an asset to a new location',
				action: 'Copy an asset',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Upload a new asset',
				action: 'Create an asset',
			},
			{
				name: 'Create Rendition',
				value: 'createRendition',
				description: 'Create a new rendition for an asset',
				action: 'Create a rendition',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an asset',
				action: 'Delete an asset',
			},
			{
				name: 'Delete Rendition',
				value: 'deleteRendition',
				description: 'Delete an asset rendition',
				action: 'Delete a rendition',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get asset metadata',
				action: 'Get an asset',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List assets in a folder',
				action: 'Get many assets',
			},
			{
				name: 'Get Renditions',
				value: 'getRenditions',
				description: 'List all renditions of an asset',
				action: 'Get renditions',
			},
			{
				name: 'Move',
				value: 'move',
				description: 'Move an asset to a new location',
				action: 'Move an asset',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update asset metadata',
				action: 'Update an asset',
			},
			{
				name: 'Update Binary',
				value: 'updateBinary',
				description: 'Update asset binary file',
				action: 'Update asset binary',
			},
		],
		default: 'get',
	},
];

export const assetFields: INodeProperties[] = [
	// ----------------------------------
	//         asset: get
	// ----------------------------------
	{
		displayName: 'Asset Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/images/hero.jpg',
		description: 'The path to the asset in the DAM',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['get', 'update', 'updateBinary', 'delete', 'copy', 'move', 'getRenditions', 'createRendition', 'deleteRendition'],
			},
		},
	},

	// ----------------------------------
	//         asset: getAll
	// ----------------------------------
	{
		displayName: 'Folder Path',
		name: 'folderPath',
		type: 'string',
		required: true,
		default: '/content/dam',
		placeholder: '/content/dam/myproject/images',
		description: 'The folder path to list assets from',
		displayOptions: {
			show: {
				resource: ['asset'],
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
				resource: ['asset'],
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
				resource: ['asset'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},

	// ----------------------------------
	//         asset: create
	// ----------------------------------
	{
		displayName: 'Destination Folder',
		name: 'destinationFolder',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/images',
		description: 'The folder path where the asset will be created',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Input Data Field Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'The name of the input field containing the binary file data',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create', 'updateBinary', 'createRendition'],
			},
		},
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'image.jpg',
		description: 'The name for the new asset file',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create'],
			},
		},
	},

	// ----------------------------------
	//         asset: update
	// ----------------------------------
	{
		displayName: 'Metadata',
		name: 'metadata',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Metadata',
		description: 'Asset metadata properties to update',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['update', 'create'],
			},
		},
		options: [
			{
				name: 'metadataValues',
				displayName: 'Metadata',
				values: [
					{
						displayName: 'Property',
						name: 'property',
						type: 'string',
						default: '',
						placeholder: 'dc:title',
						description: 'The metadata property name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The metadata property value',
					},
				],
			},
		],
	},

	// ----------------------------------
	//         asset: copy/move
	// ----------------------------------
	{
		displayName: 'Destination Path',
		name: 'destination',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/dam/myproject/archive',
		description: 'The destination folder path',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['copy', 'move'],
			},
		},
	},
	{
		displayName: 'New Name',
		name: 'newName',
		type: 'string',
		default: '',
		placeholder: 'new-image-name.jpg',
		description: 'Optional new name for the asset (leave empty to keep original)',
		displayOptions: {
			show: {
				resource: ['asset'],
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
				resource: ['asset'],
				operation: ['copy', 'move', 'create'],
			},
		},
	},

	// ----------------------------------
	//         asset: renditions
	// ----------------------------------
	{
		displayName: 'Rendition Name',
		name: 'renditionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'cq5dam.thumbnail.140.100.png',
		description: 'The name of the rendition',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['createRendition', 'deleteRendition'],
			},
		},
	},

	// ----------------------------------
	//         asset: additional options
	// ----------------------------------
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Include Subfolders',
				name: 'recursive',
				type: 'boolean',
				default: false,
				description: 'Whether to include assets from subfolders',
			},
			{
				displayName: 'Filter by MIME Type',
				name: 'mimeType',
				type: 'string',
				default: '',
				placeholder: 'image/jpeg',
				description: 'Filter assets by MIME type',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'options',
				options: [
					{ name: 'Name', value: 'name' },
					{ name: 'Modified Date', value: 'jcr:lastModified' },
					{ name: 'Created Date', value: 'jcr:created' },
					{ name: 'Title', value: 'dc:title' },
				],
				default: 'name',
				description: 'Order the results by a property',
			},
			{
				displayName: 'Order Direction',
				name: 'orderDirection',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'asc',
				description: 'The sort direction',
			},
		],
	},
];
