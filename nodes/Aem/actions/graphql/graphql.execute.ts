/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	aemGraphQlRequest,
	aemHttpRequest,
} from '../../transport/GenericFunctions';

export async function executeGraphQlOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'query') {
		// Execute GraphQL query
		const endpoint = this.getNodeParameter('endpoint', i) as string;
		const query = this.getNodeParameter('query', i) as string;
		const variablesJson = this.getNodeParameter('variables', i, '{}') as string;
		const operationName = this.getNodeParameter('operationName', i, '') as string;

		let variables: IDataObject = {};
		try {
			variables = JSON.parse(variablesJson) as IDataObject;
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid JSON in variables field',
				{ itemIndex: i },
			);
		}

		let fullQuery = query;
		if (operationName) {
			// Add operation name hint if needed
			fullQuery = query;
		}

		responseData = await aemGraphQlRequest.call(this, endpoint, fullQuery, variables);
	} else if (operation === 'queryPersisted') {
		// Execute persisted query
		const persistedQueryPath = this.getNodeParameter('persistedQueryPath', i) as string;
		const variablesJson = this.getNodeParameter('variables', i, '{}') as string;

		let variables: IDataObject = {};
		try {
			variables = JSON.parse(variablesJson) as IDataObject;
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid JSON in variables field',
				{ itemIndex: i },
			);
		}

		// Persisted queries use GET with encoded variables
		const queryParams: IDataObject = {};
		if (Object.keys(variables).length > 0) {
			queryParams.variables = JSON.stringify(variables);
		}

		responseData = await aemHttpRequest.call(
			this,
			'GET',
			`/graphql/execute.json${persistedQueryPath}`,
			undefined,
			queryParams,
		);
	} else if (operation === 'listPersistedQueries') {
		// List persisted queries
		const endpoint = this.getNodeParameter('endpoint', i) as string;

		responseData = await aemHttpRequest.call(
			this,
			'GET',
			`/graphql/list.json/${endpoint}`,
		);

		// Format the response
		if (responseData && (responseData as IDataObject).queries) {
			responseData = (responseData as IDataObject).queries as IDataObject[];
		}
	} else if (operation === 'createPersistedQuery') {
		// Create persisted query
		const endpoint = this.getNodeParameter('endpoint', i) as string;
		const queryName = this.getNodeParameter('queryName', i) as string;
		const query = this.getNodeParameter('query', i) as string;

		responseData = await aemHttpRequest.call(
			this,
			'PUT',
			`/graphql/persist.json/${endpoint}/${queryName}`,
			{ query },
		);

		responseData = {
			success: true,
			path: `/${endpoint}/${queryName}`,
			query,
		};
	} else if (operation === 'deletePersistedQuery') {
		// Delete persisted query
		const persistedQueryPath = this.getNodeParameter('persistedQueryPath', i) as string;

		await aemHttpRequest.call(
			this,
			'DELETE',
			`/graphql/persist.json${persistedQueryPath}`,
		);

		responseData = {
			success: true,
			deletedPath: persistedQueryPath,
		};
	} else {
		throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
