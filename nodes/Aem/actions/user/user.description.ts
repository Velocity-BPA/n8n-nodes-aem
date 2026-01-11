/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Add to Group',
				value: 'addToGroup',
				description: 'Add a user to a group',
				action: 'Add user to group',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new user',
				action: 'Create user',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a user',
				action: 'Delete user',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get user details',
				action: 'Get user',
			},
			{
				name: 'Get Groups',
				value: 'getGroups',
				description: 'Get groups for a user',
				action: 'Get user groups',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many users',
				action: 'Get many users',
			},
			{
				name: 'Remove from Group',
				value: 'removeFromGroup',
				description: 'Remove a user from a group',
				action: 'Remove user from group',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update user properties',
				action: 'Update user',
			},
		],
		default: 'get',
	},
];

export const userFields: INodeProperties[] = [
	// ----------------------------------
	//         user: get
	// ----------------------------------
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'admin',
		description: 'The user identifier',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get', 'update', 'delete', 'getGroups', 'addToGroup', 'removeFromGroup'],
			},
		},
	},

	// ----------------------------------
	//         user: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getAll'],
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
				resource: ['user'],
				operation: ['getAll'],
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
				resource: ['user'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Group',
				name: 'group',
				type: 'string',
				default: '',
				description: 'Filter by group membership',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Search query to filter users',
			},
		],
	},

	// ----------------------------------
	//         user: create
	// ----------------------------------
	{
		displayName: 'User ID',
		name: 'newUserId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'john.doe',
		description: 'The user identifier for the new user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: {
			password: true,
		},
		required: true,
		default: '',
		description: 'Password for the new user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Given Name',
		name: 'givenName',
		type: 'string',
		default: '',
		description: 'First name of the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Family Name',
		name: 'familyName',
		type: 'string',
		default: '',
		description: 'Last name of the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		description: 'Email address of the user',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'About Me',
				name: 'aboutMe',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'User description or bio',
			},
			{
				displayName: 'Disabled',
				name: 'disabled',
				type: 'boolean',
				default: false,
				description: 'Whether the user account is disabled',
			},
		],
	},

	// ----------------------------------
	//         user: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'About Me',
				name: 'aboutMe',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'User description or bio',
			},
			{
				displayName: 'Disabled',
				name: 'disabled',
				type: 'boolean',
				default: false,
				description: 'Whether the user account is disabled',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address of the user',
			},
			{
				displayName: 'Family Name',
				name: 'familyName',
				type: 'string',
				default: '',
				description: 'Last name of the user',
			},
			{
				displayName: 'Given Name',
				name: 'givenName',
				type: 'string',
				default: '',
				description: 'First name of the user',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'New password for the user',
			},
		],
	},

	// ----------------------------------
	//         user: addToGroup / removeFromGroup
	// ----------------------------------
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'administrators',
		description: 'The group identifier',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['addToGroup', 'removeFromGroup'],
			},
		},
	},
];
