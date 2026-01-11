/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// Siren format types
export interface ISirenLink {
	rel: string[];
	href: string;
	type?: string;
}

export interface ISirenEntity {
	class: string[];
	rel?: string[];
	properties: IDataObject;
	links?: ISirenLink[];
	entities?: ISirenEntity[];
	actions?: ISirenAction[];
}

export interface ISirenAction {
	name: string;
	method: string;
	href: string;
	type?: string;
	fields?: ISirenField[];
}

export interface ISirenField {
	name: string;
	type: string;
	value?: string;
}

export interface ISirenResponse {
	class: string[];
	properties: IDataObject;
	entities?: ISirenEntity[];
	links: ISirenLink[];
	actions?: ISirenAction[];
}

// Asset types
export interface IAssetMetadata {
	'dc:title'?: string;
	'dc:description'?: string;
	'dc:format'?: string;
	'dc:creator'?: string;
	'dc:modified'?: string;
	'dc:created'?: string;
	'dam:size'?: number;
	'dam:sha1'?: string;
	[key: string]: unknown;
}

export interface IAsset {
	path: string;
	name: string;
	title?: string;
	metadata: IAssetMetadata;
	renditions?: IRendition[];
}

export interface IRendition {
	name: string;
	path: string;
	mimeType: string;
	size?: number;
}

// Folder types
export interface IFolder {
	path: string;
	name: string;
	title?: string;
	properties: IDataObject;
	children?: IFolderChild[];
}

export interface IFolderChild {
	name: string;
	path: string;
	type: 'asset' | 'folder';
}

// Content Fragment types
export interface IContentFragmentElement {
	name: string;
	value: string | string[] | IDataObject;
	type: string;
}

export interface IContentFragment {
	path: string;
	title: string;
	description?: string;
	model: string;
	elements: IContentFragmentElement[];
	variations?: IContentFragmentVariation[];
	tags?: string[];
}

export interface IContentFragmentVariation {
	name: string;
	title: string;
	description?: string;
	elements: IContentFragmentElement[];
}

// Content Fragment Model types
export interface IContentFragmentModelField {
	name: string;
	label: string;
	type: string;
	required: boolean;
	multiValue: boolean;
	defaultValue?: unknown;
}

export interface IContentFragmentModel {
	path: string;
	title: string;
	description?: string;
	fields: IContentFragmentModelField[];
}

// GraphQL types
export interface IGraphQLResponse {
	data?: IDataObject;
	errors?: IGraphQLError[];
}

export interface IGraphQLError {
	message: string;
	locations?: Array<{
		line: number;
		column: number;
	}>;
	path?: string[];
	extensions?: IDataObject;
}

export interface IPersistedQuery {
	path: string;
	query: string;
	createdAt?: string;
	modifiedAt?: string;
}

// Page types
export interface IPage {
	path: string;
	name: string;
	title: string;
	template?: string;
	properties: IDataObject;
	children?: IPage[];
}

// Comment types
export interface IComment {
	id: string;
	assetPath: string;
	message: string;
	author: string;
	createdAt: string;
	replies?: IComment[];
	annotationData?: IDataObject;
}

// Workflow types
export interface IWorkflowModel {
	id: string;
	title: string;
	description?: string;
	path: string;
}

export interface IWorkflowInstance {
	id: string;
	modelId: string;
	payloadPath: string;
	status: 'RUNNING' | 'COMPLETED' | 'ABORTED' | 'SUSPENDED';
	startTime: string;
	endTime?: string;
	initiator: string;
	workItems?: IWorkItem[];
}

export interface IWorkItem {
	id: string;
	title: string;
	assignee?: string;
	status: string;
	createdAt: string;
}

// Tag types
export interface ITag {
	tagId: string;
	namespace: string;
	path: string;
	title: string;
	description?: string;
	count?: number;
	children?: ITag[];
}

// User types
export interface IUser {
	id: string;
	path: string;
	givenName?: string;
	familyName?: string;
	email?: string;
	groups?: string[];
	properties: IDataObject;
}

// Group types
export interface IGroup {
	id: string;
	path: string;
	name: string;
	members?: string[];
}

// Replication types
export interface IReplicationAgent {
	id: string;
	name: string;
	enabled: boolean;
	transportUri: string;
}

export interface IReplicationQueueItem {
	id: string;
	path: string;
	action: 'ACTIVATE' | 'DEACTIVATE';
	time: string;
	userId: string;
	status: 'QUEUED' | 'PROCESSING' | 'DELIVERED' | 'ERROR';
}

// Webhook/Trigger types
export interface IAemWebhookPayload {
	eventType: string;
	path: string;
	timestamp: string;
	userId: string;
	properties?: IDataObject;
}

// API Response types
export interface IAemError {
	class?: string;
	message: string;
	path?: string;
	statusCode?: number;
}

// Token cache interface
export interface ITokenCache {
	accessToken: string;
	expiresAt: number;
}

// Resource and operation type definitions
export type AemResource =
	| 'asset'
	| 'folder'
	| 'contentFragment'
	| 'contentFragmentModel'
	| 'graphql'
	| 'page'
	| 'comment'
	| 'workflow'
	| 'tag'
	| 'user'
	| 'replication';

export type AssetOperation =
	| 'get'
	| 'getAll'
	| 'create'
	| 'update'
	| 'updateBinary'
	| 'delete'
	| 'copy'
	| 'move'
	| 'getRenditions'
	| 'createRendition'
	| 'deleteRendition';

export type FolderOperation =
	| 'get'
	| 'getAll'
	| 'create'
	| 'update'
	| 'delete'
	| 'copy'
	| 'move';

export type ContentFragmentOperation =
	| 'get'
	| 'getAll'
	| 'create'
	| 'update'
	| 'delete'
	| 'getVariations'
	| 'createVariation'
	| 'publish'
	| 'unpublish';

export type ContentFragmentModelOperation =
	| 'get'
	| 'getAll'
	| 'getFields';

export type GraphQlOperation =
	| 'query'
	| 'queryPersisted'
	| 'listPersistedQueries'
	| 'createPersistedQuery'
	| 'deletePersistedQuery';

export type PageOperation =
	| 'get'
	| 'create'
	| 'update'
	| 'delete'
	| 'copy'
	| 'move'
	| 'publish'
	| 'unpublish'
	| 'lock'
	| 'unlock';

export type CommentOperation =
	| 'getAll'
	| 'create'
	| 'delete'
	| 'reply';

export type WorkflowOperation =
	| 'getAll'
	| 'start'
	| 'getInstances'
	| 'getInstance'
	| 'terminate'
	| 'complete';

export type TagOperation =
	| 'get'
	| 'getAll'
	| 'create'
	| 'delete'
	| 'getTagged';

export type UserOperation =
	| 'get'
	| 'getAll'
	| 'create'
	| 'update'
	| 'delete'
	| 'getGroups'
	| 'addToGroup'
	| 'removeFromGroup';

export type ReplicationOperation =
	| 'activate'
	| 'deactivate'
	| 'getQueue'
	| 'clearQueue';
