/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class AemApi implements ICredentialType {
	name = 'aemApi';
	displayName = 'Adobe Experience Manager API';
	documentationUrl = 'https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/assets/assets-http-api.html';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Deployment Type',
			name: 'deploymentType',
			type: 'options',
			options: [
				{
					name: 'AEM 6.5 (On-Premise/Managed Services)',
					value: 'aem65',
				},
				{
					name: 'AEM as a Cloud Service',
					value: 'cloudService',
				},
			],
			default: 'aem65',
			description: 'The type of AEM deployment',
		},
		{
			displayName: 'AEM Host URL',
			name: 'aemHost',
			type: 'string',
			default: '',
			placeholder: 'https://author-p12345-e67890.adobeaemcloud.com',
			required: true,
			description: 'The AEM instance URL (without trailing slash)',
		},
		// AEM 6.5 Basic Auth fields
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					deploymentType: ['aem65'],
				},
			},
			description: 'The AEM username for Basic Authentication',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					deploymentType: ['aem65'],
				},
			},
			description: 'The AEM password for Basic Authentication',
		},
		// Cloud Service OAuth fields
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					deploymentType: ['cloudService'],
				},
			},
			description: 'The OAuth Client ID from Adobe Developer Console',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					deploymentType: ['cloudService'],
				},
			},
			description: 'The OAuth Client Secret from Adobe Developer Console',
		},
		{
			displayName: 'Technical Account ID',
			name: 'technicalAccountId',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					deploymentType: ['cloudService'],
				},
			},
			description: 'The Technical Account ID from Adobe Developer Console',
		},
		{
			displayName: 'Organization ID',
			name: 'orgId',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					deploymentType: ['cloudService'],
				},
			},
			description: 'The Adobe Organization ID (IMS Org ID)',
		},
		{
			displayName: 'IMS Host',
			name: 'imsHost',
			type: 'string',
			default: 'ims-na1.adobelogin.com',
			displayOptions: {
				show: {
					deploymentType: ['cloudService'],
				},
			},
			description: 'The Adobe IMS host for authentication',
		},
		{
			displayName: 'Scopes',
			name: 'scopes',
			type: 'string',
			default: 'AdobeID,openid,read_organizations,additional_info.projectedProductContext',
			displayOptions: {
				show: {
					deploymentType: ['cloudService'],
				},
			},
			description: 'The OAuth scopes required for API access',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const deploymentType = credentials.deploymentType as string;

		if (deploymentType === 'aem65') {
			// Basic Authentication for AEM 6.5
			const username = credentials.username as string;
			const password = credentials.password as string;
			const auth = Buffer.from(`${username}:${password}`).toString('base64');
			
			if (!requestOptions.headers) {
				requestOptions.headers = {};
			}
			requestOptions.headers.Authorization = `Basic ${auth}`;
		}
		// For Cloud Service, the access token is obtained via pre-request hook
		// and added to the request in GenericFunctions.ts
		
		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.aemHost}}',
			url: '/api/assets.json',
			method: 'GET',
			qs: {
				limit: 1,
			},
		},
	};
}
