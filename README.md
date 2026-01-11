# n8n-nodes-aem

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Adobe Experience Manager (AEM) providing enterprise-grade content management automation. This integration enables content teams, developers, and marketers to automate asset management, content fragment operations, page publishing, GraphQL queries, and headless content delivery across both AEM 6.5 and AEM as a Cloud Service deployments.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![AEM](https://img.shields.io/badge/Adobe-Experience%20Manager-red)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **11 Resource Categories** with 70+ operations for complete AEM automation
- **Dual Authentication Support** - Basic Auth (AEM 6.5) and OAuth 2.0 (Cloud Service)
- **Digital Asset Management** - Full DAM operations including renditions and metadata
- **Content Fragments** - Create, update, and manage headless content
- **GraphQL Integration** - Execute queries and manage persisted queries
- **Page Management** - Full page lifecycle with publish/unpublish workflows
- **Workflow Automation** - Start, monitor, and control AEM workflows
- **User & Group Management** - Manage users and group memberships
- **Replication Control** - Activate/deactivate content to publish instances
- **Event Triggers** - Poll-based triggers for content changes

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-aem` and install

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-aem
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-aem.zip
cd n8n-nodes-aem

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aem

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-aem %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### AEM 6.5 (Basic Authentication)

| Field | Description |
|-------|-------------|
| Deployment Type | Select "AEM 6.5" |
| AEM Host | Your AEM instance URL (e.g., `https://author.example.com`) |
| Username | AEM username |
| Password | AEM password |

### AEM as a Cloud Service (OAuth 2.0)

| Field | Description |
|-------|-------------|
| Deployment Type | Select "Cloud Service" |
| AEM Host | Cloud Service URL (e.g., `https://author-p12345-e67890.adobeaemcloud.com`) |
| Client ID | Service Account Client ID |
| Client Secret | Service Account Client Secret |
| Technical Account ID | Technical Account ID from Adobe Developer Console |
| Organization ID | Adobe Organization ID |
| IMS Host | Adobe IMS host (default: `ims-na1.adobelogin.com`) |
| Meta Scopes | Required scopes for API access |

To obtain Cloud Service credentials:
1. Navigate to Adobe Developer Console
2. Create a project and add AEM API
3. Generate OAuth Server-to-Server credentials
4. Download the service credentials JSON file

## Resources & Operations

### Asset
- `get` - Get asset metadata by path
- `getAll` - List all assets in a folder
- `create` - Create/upload a new asset
- `update` - Update asset metadata
- `updateBinary` - Update asset binary file
- `delete` - Delete an asset
- `copy` - Copy asset to new location
- `move` - Move asset to new location
- `getRenditions` - List all renditions
- `createRendition` - Create a new rendition
- `deleteRendition` - Delete a rendition

### Folder
- `get` - Get folder metadata
- `getAll` - List all subfolders
- `create` - Create a new folder
- `update` - Update folder properties
- `delete` - Delete a folder
- `copy` - Copy folder
- `move` - Move folder

### Content Fragment
- `get` - Get content fragment
- `getAll` - List content fragments
- `create` - Create content fragment
- `update` - Update fragment elements
- `delete` - Delete fragment
- `getVariations` - List variations
- `createVariation` - Create variation
- `publish` - Publish fragment
- `unpublish` - Unpublish fragment

### Content Fragment Model
- `get` - Get model definition
- `getAll` - List all models
- `getFields` - Get field definitions

### GraphQL
- `query` - Execute GraphQL query
- `queryPersisted` - Execute persisted query
- `listPersistedQueries` - List persisted queries
- `createPersistedQuery` - Create persisted query
- `deletePersistedQuery` - Delete persisted query

### Page
- `get` - Get page content
- `create` - Create new page
- `update` - Update page properties
- `delete` - Delete page
- `copy` - Copy page
- `move` - Move page
- `publish` - Publish page
- `unpublish` - Unpublish page
- `lock` - Lock page
- `unlock` - Unlock page

### Comment
- `getAll` - List comments on asset
- `create` - Add comment
- `delete` - Delete comment
- `reply` - Reply to comment

### Workflow
- `getAll` - List workflow models
- `start` - Start workflow
- `getInstances` - List running instances
- `getInstance` - Get instance details
- `terminate` - Terminate workflow
- `complete` - Complete workflow step

### Tag
- `get` - Get tag details
- `getAll` - List tags in namespace
- `create` - Create tag
- `delete` - Delete tag
- `getTagged` - Get tagged content

### User
- `get` - Get user details
- `getAll` - List users
- `create` - Create user
- `update` - Update user
- `delete` - Delete user
- `getGroups` - Get user's groups
- `addToGroup` - Add to group
- `removeFromGroup` - Remove from group

### Replication
- `activate` - Publish content
- `deactivate` - Unpublish content
- `getQueue` - Get queue status
- `clearQueue` - Clear queue

## Trigger Node

The AEM Trigger node supports polling-based triggers for:

- Asset created/modified/deleted
- Content Fragment created/modified
- Page created/modified/published/unpublished
- Workflow completed/failed

Configure watch paths and filters to monitor specific content areas.

## Usage Examples

### Upload an Asset

```json
{
  "resource": "asset",
  "operation": "create",
  "folderPath": "/content/dam/myproject",
  "fileName": "hero-image.jpg",
  "binaryPropertyName": "data"
}
```

### Execute GraphQL Query

```json
{
  "resource": "graphql",
  "operation": "query",
  "endpoint": "mysite",
  "query": "{ articleList { items { _path title author } } }"
}
```

### Publish a Page

```json
{
  "resource": "page",
  "operation": "publish",
  "pagePath": "/content/mysite/en/about"
}
```

## AEM Concepts

### Assets HTTP API
The Assets HTTP API provides RESTful access to AEM Assets using Siren hypermedia format. All asset operations use paths starting with `/content/dam`.

### Content Fragments
Content Fragments are structured content pieces with models defining their schema. They support variations for channel-specific content and are used for headless content delivery.

### GraphQL API
AEM's GraphQL API enables efficient content delivery for headless applications. Persisted queries improve performance by caching query definitions.

### Replication
Replication syncs content between author and publish instances. Activation publishes content; deactivation removes it from publish.

## Error Handling

The node handles common AEM errors:
- **401 Unauthorized**: Invalid credentials or expired token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource already exists
- **500 Server Error**: AEM internal error

Enable "Continue on Fail" to process all items even when errors occur.

## Security Best Practices

1. Use service accounts with minimal required permissions
2. Store credentials securely using n8n's credential management
3. For Cloud Service, use OAuth 2.0 instead of Developer Tokens in production
4. Regularly rotate credentials and review access permissions
5. Use environment variables for sensitive configuration

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/Velocity-BPA/n8n-nodes-aem/issues)
- Documentation: [AEM API Documentation](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/developing/aem-apis.html)
- Email: support@velobpa.com

## Acknowledgments

- [Adobe Experience Manager](https://business.adobe.com/products/experience-manager/adobe-experience-manager.html)
- [n8n](https://n8n.io/) - Workflow automation platform
- [n8n Community](https://community.n8n.io/) - Community support and resources
