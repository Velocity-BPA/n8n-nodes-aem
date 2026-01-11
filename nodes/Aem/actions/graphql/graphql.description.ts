/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';

export const graphqlOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['graphql'],
			},
		},
		options: [
			{
				name: 'Create Persisted Query',
				value: 'createPersistedQuery',
				description: 'Create a new persisted GraphQL query',
				action: 'Create a persisted query',
			},
			{
				name: 'Delete Persisted Query',
				value: 'deletePersistedQuery',
				description: 'Delete a persisted query',
				action: 'Delete a persisted query',
			},
			{
				name: 'Execute Query',
				value: 'query',
				description: 'Execute a GraphQL query',
				action: 'Execute a query',
			},
			{
				name: 'Execute Persisted Query',
				value: 'queryPersisted',
				description: 'Execute a persisted GraphQL query',
				action: 'Execute a persisted query',
			},
			{
				name: 'List Persisted Queries',
				value: 'listPersistedQueries',
				description: 'List all persisted queries',
				action: 'List persisted queries',
			},
		],
		default: 'query',
	},
];

export const graphqlFields: INodeProperties[] = [
	// ----------------------------------
	//         graphql: endpoint
	// ----------------------------------
	{
		displayName: 'Endpoint',
		name: 'endpoint',
		type: 'string',
		required: true,
		default: 'global',
		placeholder: 'global or site-name',
		description: 'The GraphQL endpoint name (global or site-specific)',
		displayOptions: {
			show: {
				resource: ['graphql'],
				operation: ['query', 'listPersistedQueries', 'createPersistedQuery'],
			},
		},
	},

	// ----------------------------------
	//         graphql: query
	// ----------------------------------
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		placeholder: '{ articleList { items { _path title } } }',
		description: 'The GraphQL query to execute',
		typeOptions: {
			rows: 10,
		},
		displayOptions: {
			show: {
				resource: ['graphql'],
				operation: ['query', 'createPersistedQuery'],
			},
		},
	},

	// ----------------------------------
	//         graphql: variables
	// ----------------------------------
	{
		displayName: 'Variables',
		name: 'variables',
		type: 'json',
		default: '{}',
		placeholder: '{"id": "123"}',
		description: 'Variables to pass to the GraphQL query',
		displayOptions: {
			show: {
				resource: ['graphql'],
				operation: ['query', 'queryPersisted'],
			},
		},
	},

	// ----------------------------------
	//         graphql: operation name
	// ----------------------------------
	{
		displayName: 'Operation Name',
		name: 'operationName',
		type: 'string',
		default: '',
		placeholder: 'GetArticles',
		description: 'The operation name (for multi-operation documents)',
		displayOptions: {
			show: {
				resource: ['graphql'],
				operation: ['query'],
			},
		},
	},

	// ----------------------------------
	//         graphql: persisted query
	// ----------------------------------
	{
		displayName: 'Persisted Query Path',
		name: 'persistedQueryPath',
		type: 'string',
		required: true,
		default: '',
		placeholder: '/mysite/get-articles',
		description: 'The path to the persisted query',
		displayOptions: {
			show: {
				resource: ['graphql'],
				operation: ['queryPersisted', 'deletePersistedQuery'],
			},
		},
	},

	// ----------------------------------
	//         graphql: create persisted
	// ----------------------------------
	{
		displayName: 'Query Name',
		name: 'queryName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'get-articles',
		description: 'The name for the persisted query',
		displayOptions: {
			show: {
				resource: ['graphql'],
				operation: ['createPersistedQuery'],
			},
		},
	},
];
