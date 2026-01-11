/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const pageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['page'],
			},
		},
		options: [
			{
				name: 'Copy',
				value: 'copy',
				description: 'Copy a page to a new location',
				action: 'Copy a page',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new page',
				action: 'Create a page',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a page',
				action: 'Delete a page',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get page content and properties',
				action: 'Get a page',
			},
			{
				name: 'Lock',
				value: 'lock',
				description: 'Lock a page for editing',
				action: 'Lock a page',
			},
			{
				name: 'Move',
				value: 'move',
				description: 'Move a page to a new location',
				action: 'Move a page',
			},
			{
				name: 'Publish',
				value: 'publish',
				description: 'Publish a page',
				action: 'Publish a page',
			},
			{
				name: 'Unlock',
				value: 'unlock',
				description: 'Unlock a page',
				action: 'Unlock a page',
			},
			{
				name: 'Unpublish',
				value: 'unpublish',
				description: 'Unpublish a page',
				action: 'Unpublish a page',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update page properties',
				action: 'Update a page',
			},
		],
		default: 'get',
	},
];

export const pageFields: INodeProperties[] = [
	{
		displayName: 'Page Path',
		name: 'pagePath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/mysite/en/about',
		description: 'The path to the page',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['get', 'update', 'delete', 'copy', 'move', 'publish', 'unpublish', 'lock', 'unlock'],
			},
		},
	},
	{
		displayName: 'Parent Path',
		name: 'parentPath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/mysite/en',
		description: 'The parent page path',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Page Name',
		name: 'pageName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'about-us',
		description: 'The name for the new page',
		displayOptions: {
			show: {
				resource: ['page'],
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
		placeholder: 'About Us',
		description: 'The page title',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Template',
		name: 'template',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/conf/mysite/settings/wcm/templates/content-page',
		description: 'The page template path',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Destination Path',
		name: 'destination',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/content/mysite/en/archive',
		description: 'The destination parent path',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['copy', 'move'],
			},
		},
	},
	{
		displayName: 'New Name',
		name: 'newName',
		type: 'string',
		default: '',
		placeholder: 'renamed-page',
		description: 'Optional new name for the page',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['copy', 'move'],
			},
		},
	},
	{
		displayName: 'Properties',
		name: 'properties',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Property',
		description: 'Page properties to set',
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['create', 'update'],
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
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['page'],
				operation: ['copy', 'publish', 'delete'],
			},
		},
		options: [
			{
				displayName: 'Shallow',
				name: 'shallow',
				type: 'boolean',
				default: false,
				description: 'Whether to perform shallow operation (page only, not children)',
			},
			{
				displayName: 'Overwrite',
				name: 'overwrite',
				type: 'boolean',
				default: false,
				description: 'Whether to overwrite existing pages',
			},
		],
	},
];
