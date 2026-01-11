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
	aemHttpRequest,
	aemSlingPostRequest,
} from '../../transport/GenericFunctions';

export async function executeUserOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		// Get user details
		const userId = this.getNodeParameter('userId', i) as string;

		responseData = await aemHttpRequest.call(
			this,
			'GET',
			`/home/users/${userId.charAt(0)}/${userId}.json`,
		);

		// Fallback to search if direct path fails
		if (!responseData || (responseData as IDataObject).error) {
			const searchResponse = await aemHttpRequest.call(
				this,
				'GET',
				'/bin/querybuilder.json',
				undefined,
				{
					'path': '/home/users',
					'type': 'rep:User',
					'property': 'rep:authorizableId',
					'property.value': userId,
					'p.limit': 1,
				},
			);

			if (searchResponse.hits && (searchResponse.hits as IDataObject[]).length > 0) {
				const hit = (searchResponse.hits as IDataObject[])[0];
				responseData = await aemHttpRequest.call(
					this,
					'GET',
					`${hit.path}.json`,
				);
			}
		}

		responseData = {
			userId,
			...responseData,
		};
	} else if (operation === 'getAll') {
		// List users
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = {
			'path': '/home/users',
			'type': 'rep:User',
			'p.limit': returnAll ? -1 : (this.getNodeParameter('limit', i, 50) as number),
		};

		if (filters.group) {
			query['group.property'] = 'rep:members';
			query['group.property.value'] = `/home/groups/*/${filters.group}`;
		}

		if (filters.query) {
			query['fulltext'] = filters.query;
		}

		const response = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			query,
		);

		const users: IDataObject[] = [];
		if (response.hits) {
			for (const hit of response.hits as IDataObject[]) {
				users.push({
					userId: hit['rep:authorizableId'] || hit.name,
					path: hit.path,
					...hit,
				});
			}
		}

		responseData = users;
	} else if (operation === 'create') {
		// Create user
		const userId = this.getNodeParameter('newUserId', i) as string;
		const password = this.getNodeParameter('password', i) as string;
		const givenName = this.getNodeParameter('givenName', i, '') as string;
		const familyName = this.getNodeParameter('familyName', i, '') as string;
		const email = this.getNodeParameter('email', i, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = {
			':name': userId,
			'rep:password': password,
			'jcr:primaryType': 'rep:User',
		};

		if (givenName) {
			body['profile/givenName'] = givenName;
		}
		if (familyName) {
			body['profile/familyName'] = familyName;
		}
		if (email) {
			body['profile/email'] = email;
		}
		if (additionalFields.aboutMe) {
			body['profile/aboutMe'] = additionalFields.aboutMe;
		}
		if (additionalFields.disabled !== undefined) {
			body['rep:disabled'] = additionalFields.disabled ? 'Account disabled' : '';
		}

		await aemSlingPostRequest.call(this, '/libs/granite/security/post/authorizables', body);

		responseData = {
			success: true,
			userId,
			givenName,
			familyName,
			email,
		};
	} else if (operation === 'update') {
		// Update user
		const userId = this.getNodeParameter('userId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		// Find user path
		const searchResponse = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			{
				'path': '/home/users',
				'type': 'rep:User',
				'property': 'rep:authorizableId',
				'property.value': userId,
				'p.limit': 1,
			},
		);

		if (!searchResponse.hits || (searchResponse.hits as IDataObject[]).length === 0) {
			throw new NodeOperationError(this.getNode(), `User not found: ${userId}`, {
				itemIndex: i,
			});
		}

		const userPath = (searchResponse.hits as IDataObject[])[0].path as string;

		const body: IDataObject = {};

		if (updateFields.givenName !== undefined) {
			body['profile/givenName'] = updateFields.givenName;
		}
		if (updateFields.familyName !== undefined) {
			body['profile/familyName'] = updateFields.familyName;
		}
		if (updateFields.email !== undefined) {
			body['profile/email'] = updateFields.email;
		}
		if (updateFields.aboutMe !== undefined) {
			body['profile/aboutMe'] = updateFields.aboutMe;
		}
		if (updateFields.password) {
			body['rep:password'] = updateFields.password;
		}
		if (updateFields.disabled !== undefined) {
			body['rep:disabled'] = updateFields.disabled ? 'Account disabled' : '';
		}

		await aemSlingPostRequest.call(this, userPath, body);

		responseData = {
			success: true,
			userId,
			...updateFields,
		};
	} else if (operation === 'delete') {
		// Delete user
		const userId = this.getNodeParameter('userId', i) as string;

		// Find user path
		const searchResponse = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			{
				'path': '/home/users',
				'type': 'rep:User',
				'property': 'rep:authorizableId',
				'property.value': userId,
				'p.limit': 1,
			},
		);

		if (!searchResponse.hits || (searchResponse.hits as IDataObject[]).length === 0) {
			throw new NodeOperationError(this.getNode(), `User not found: ${userId}`, {
				itemIndex: i,
			});
		}

		const userPath = (searchResponse.hits as IDataObject[])[0].path as string;

		await aemSlingPostRequest.call(this, userPath, {
			':operation': 'delete',
		});

		responseData = {
			success: true,
			action: 'delete',
			userId,
		};
	} else if (operation === 'getGroups') {
		// Get groups for user
		const userId = this.getNodeParameter('userId', i) as string;

		// Find user path
		const searchResponse = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			{
				'path': '/home/users',
				'type': 'rep:User',
				'property': 'rep:authorizableId',
				'property.value': userId,
				'p.limit': 1,
			},
		);

		if (!searchResponse.hits || (searchResponse.hits as IDataObject[]).length === 0) {
			throw new NodeOperationError(this.getNode(), `User not found: ${userId}`, {
				itemIndex: i,
			});
		}

		const userPath = (searchResponse.hits as IDataObject[])[0].path as string;

		// Get user's groups
		const userDetails = await aemHttpRequest.call(
			this,
			'GET',
			`${userPath}.json`,
		);

		const groups: IDataObject[] = [];
		if (userDetails['rep:groups']) {
			const groupPaths = Array.isArray(userDetails['rep:groups'])
				? userDetails['rep:groups']
				: [userDetails['rep:groups']];

			for (const groupPath of groupPaths as string[]) {
				try {
					const groupDetails = await aemHttpRequest.call(
						this,
						'GET',
						`${groupPath}.json`,
					);
					groups.push({
						groupId: groupDetails['rep:authorizableId'] || groupPath.split('/').pop(),
						path: groupPath,
						...groupDetails,
					});
				} catch {
					groups.push({
						path: groupPath,
						groupId: groupPath.split('/').pop(),
					});
				}
			}
		}

		responseData = groups;
	} else if (operation === 'addToGroup') {
		// Add user to group
		const userId = this.getNodeParameter('userId', i) as string;
		const groupId = this.getNodeParameter('groupId', i) as string;

		// Find group path
		const groupSearch = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			{
				'path': '/home/groups',
				'type': 'rep:Group',
				'property': 'rep:authorizableId',
				'property.value': groupId,
				'p.limit': 1,
			},
		);

		if (!groupSearch.hits || (groupSearch.hits as IDataObject[]).length === 0) {
			throw new NodeOperationError(this.getNode(), `Group not found: ${groupId}`, {
				itemIndex: i,
			});
		}

		const groupPath = (groupSearch.hits as IDataObject[])[0].path as string;

		// Find user path
		const userSearch = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			{
				'path': '/home/users',
				'type': 'rep:User',
				'property': 'rep:authorizableId',
				'property.value': userId,
				'p.limit': 1,
			},
		);

		if (!userSearch.hits || (userSearch.hits as IDataObject[]).length === 0) {
			throw new NodeOperationError(this.getNode(), `User not found: ${userId}`, {
				itemIndex: i,
			});
		}

		const userPath = (userSearch.hits as IDataObject[])[0].path as string;

		// Add member to group
		await aemSlingPostRequest.call(this, groupPath, {
			'addMembers': userPath,
		});

		responseData = {
			success: true,
			action: 'addToGroup',
			userId,
			groupId,
		};
	} else if (operation === 'removeFromGroup') {
		// Remove user from group
		const userId = this.getNodeParameter('userId', i) as string;
		const groupId = this.getNodeParameter('groupId', i) as string;

		// Find group path
		const groupSearch = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			{
				'path': '/home/groups',
				'type': 'rep:Group',
				'property': 'rep:authorizableId',
				'property.value': groupId,
				'p.limit': 1,
			},
		);

		if (!groupSearch.hits || (groupSearch.hits as IDataObject[]).length === 0) {
			throw new NodeOperationError(this.getNode(), `Group not found: ${groupId}`, {
				itemIndex: i,
			});
		}

		const groupPath = (groupSearch.hits as IDataObject[])[0].path as string;

		// Find user path
		const userSearch = await aemHttpRequest.call(
			this,
			'GET',
			'/bin/querybuilder.json',
			undefined,
			{
				'path': '/home/users',
				'type': 'rep:User',
				'property': 'rep:authorizableId',
				'property.value': userId,
				'p.limit': 1,
			},
		);

		if (!userSearch.hits || (userSearch.hits as IDataObject[]).length === 0) {
			throw new NodeOperationError(this.getNode(), `User not found: ${userId}`, {
				itemIndex: i,
			});
		}

		const userPath = (userSearch.hits as IDataObject[])[0].path as string;

		// Remove member from group
		await aemSlingPostRequest.call(this, groupPath, {
			'removeMembers': userPath,
		});

		responseData = {
			success: true,
			action: 'removeFromGroup',
			userId,
			groupId,
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
