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
	normalizePath,
} from '../../transport/GenericFunctions';

export async function executeCommentOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[];

	if (operation === 'getAll') {
		// List comments on asset
		const assetPath = this.getNodeParameter('assetPath', i) as string;
		const normalizedPath = normalizePath(assetPath);

		const response = await aemHttpRequest.call(
			this,
			'GET',
			`${normalizedPath}/jcr:content/comments.infinity.json`,
		);

		// Extract comments from response
		const comments: IDataObject[] = [];
		if (response && typeof response === 'object') {
			for (const key of Object.keys(response)) {
				if (key.startsWith('jcr:') || key.startsWith('sling:')) continue;
				const comment = response[key] as IDataObject;
				if (comment && comment['jcr:primaryType'] === 'nt:unstructured') {
					comments.push({
						id: key,
						message: comment['message'],
						author: comment['author'],
						createdAt: comment['jcr:created'],
						...comment,
					});
				}
			}
		}

		responseData = comments;
	} else if (operation === 'create') {
		// Create comment
		const assetPath = this.getNodeParameter('assetPath', i) as string;
		const message = this.getNodeParameter('message', i) as string;
		const annotationDataJson = this.getNodeParameter('annotationData', i, '{}') as string;

		const normalizedPath = normalizePath(assetPath);

		let annotationData: IDataObject = {};
		try {
			annotationData = JSON.parse(annotationDataJson) as IDataObject;
		} catch {
			// Ignore invalid JSON
		}

		const formData: IDataObject = {
			'message': message,
			'jcr:primaryType': 'nt:unstructured',
			...annotationData,
		};

		const commentId = `comment-${Date.now()}`;
		await aemSlingPostRequest.call(
			this,
			`${normalizedPath}/jcr:content/comments/${commentId}`,
			formData,
		);

		responseData = {
			success: true,
			commentId,
			assetPath: normalizedPath,
			message,
		};
	} else if (operation === 'delete') {
		// Delete comment
		const commentId = this.getNodeParameter('commentId', i) as string;

		// Comment path includes the asset path - need to extract from commentId or require full path
		const formData: IDataObject = {
			':operation': 'delete',
		};

		await aemSlingPostRequest.call(this, commentId, formData);

		responseData = {
			success: true,
			deletedCommentId: commentId,
		};
	} else if (operation === 'reply') {
		// Reply to comment
		const commentId = this.getNodeParameter('commentId', i) as string;
		const message = this.getNodeParameter('message', i) as string;

		const replyId = `reply-${Date.now()}`;
		const formData: IDataObject = {
			'message': message,
			'jcr:primaryType': 'nt:unstructured',
		};

		await aemSlingPostRequest.call(
			this,
			`${commentId}/replies/${replyId}`,
			formData,
		);

		responseData = {
			success: true,
			replyId,
			parentCommentId: commentId,
			message,
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
