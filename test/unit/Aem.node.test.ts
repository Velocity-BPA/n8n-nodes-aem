/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Aem } from '../../nodes/Aem/Aem.node';
import { AemTrigger } from '../../nodes/Aem/AemTrigger.node';

describe('AEM Node', () => {
	let aemNode: Aem;

	beforeEach(() => {
		aemNode = new Aem();
	});

	describe('Node Description', () => {
		it('should have correct display name', () => {
			expect(aemNode.description.displayName).toBe('Adobe Experience Manager');
		});

		it('should have correct name', () => {
			expect(aemNode.description.name).toBe('aem');
		});

		it('should have aemApi credential', () => {
			expect(aemNode.description.credentials).toEqual([
				{ name: 'aemApi', required: true },
			]);
		});

		it('should have all resources defined', () => {
			const resourceProperty = aemNode.description.properties.find(
				(p) => p.name === 'resource'
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');

			const resources = (resourceProperty?.options as { value: string }[]).map(
				(o) => o.value
			);
			expect(resources).toContain('asset');
			expect(resources).toContain('folder');
			expect(resources).toContain('contentFragment');
			expect(resources).toContain('contentFragmentModel');
			expect(resources).toContain('graphql');
			expect(resources).toContain('page');
			expect(resources).toContain('comment');
			expect(resources).toContain('workflow');
			expect(resources).toContain('tag');
			expect(resources).toContain('user');
			expect(resources).toContain('replication');
		});
	});
});

describe('AEM Trigger Node', () => {
	let triggerNode: AemTrigger;

	beforeEach(() => {
		triggerNode = new AemTrigger();
	});

	describe('Node Description', () => {
		it('should have correct display name', () => {
			expect(triggerNode.description.displayName).toBe('AEM Trigger');
		});

		it('should have correct name', () => {
			expect(triggerNode.description.name).toBe('aemTrigger');
		});

		it('should have polling enabled', () => {
			expect(triggerNode.description.polling).toBe(true);
		});

		it('should have all events defined', () => {
			const eventProperty = triggerNode.description.properties.find(
				(p) => p.name === 'event'
			);
			expect(eventProperty).toBeDefined();
			expect(eventProperty?.type).toBe('options');

			const events = (eventProperty?.options as { value: string }[]).map(
				(o) => o.value
			);
			expect(events).toContain('asset.created');
			expect(events).toContain('asset.modified');
			expect(events).toContain('asset.deleted');
			expect(events).toContain('page.created');
			expect(events).toContain('page.modified');
			expect(events).toContain('page.published');
			expect(events).toContain('workflow.completed');
		});
	});
});
