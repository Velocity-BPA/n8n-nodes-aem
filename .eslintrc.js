module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'n8n-nodes-base'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:n8n-nodes-base/community',
		'prettier',
	],
	env: {
		node: true,
		es2019: true,
	},
	ignorePatterns: [
		'dist/**',
		'node_modules/**',
		'*.js',
		'!.eslintrc.js',
		'gulpfile.js',
		'test/**',
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'n8n-nodes-base/node-param-description-missing-final-period': 'off',
		'n8n-nodes-base/node-param-description-excess-final-period': 'off',
		'n8n-nodes-base/node-param-description-unneeded-backticks': 'off',
	},
};
