# API Standardization Guide

## Overview

All API routes should follow a **consistent format** for responses, error handling, and logging to ensure maintainability and production monitoring.

## Standard Response Format

### Success Response
```typescript
{
  success: true,
  data: { ... },           // The actual payload
  requestId: "req_xxx",   // For tracing
  timestamp: "2026-01-13T..." // ISO timestamp
}
```

### Error Response
```typescript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE",      // Optional error code
  requestId: "req_xxx",    // For tracing
  timestamp: "2026-01-13T..." // ISO timestamp
}
```

## Implementation Pattern

### 1. Import Required Utilities

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  handleDatabaseError,
  validateRequiredFields,
} from '@/lib/api/error-handler';
```

### 2. Basic Route Structure

```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Validate input
    const requiredFields = { id: searchParams.get('id') };
    const validation = validateRequiredFields(requiredFields);
    if (!validation.valid) {
      logger.apiRequest({
        method: 'GET',
        url: request.url,
        statusCode: 400,
        duration: Date.now() - startTime,
        requestId,
      });
      return createErrorResponse(validation.message, 400, requestId);
    }

    // 2. Perform operation
    logger.debug('Fetching resource', { id: requiredFields.id, requestId });
    
    const result = await fetchDataFromDatabase(requiredFields.id);

    // 3. Log success
    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'GET',
      url: request.url,
      statusCode: 200,
      duration,
      requestId,
    });

    // 4. Return standardized success
    return createSuccessResponse(result, requestId);
    
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Log error with full context
    logger.error('API error', error, {
      url: request.url,
      requestId,
    });

    logger.apiRequest({
      method: 'GET',
      url: request.url,
      statusCode: 500,
      duration,
      requestId,
      error,
    });

    // Handle database errors specifically
    if (error.code) {
      return handleDatabaseError(error, requestId);
    }

    return createErrorResponse(
      error.message || 'Internal server error',
      500,
      requestId
    );
  }
}
```

### 3. POST Route with Validation

```typescript
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { title, description, status } = body;

    // Validate required fields
    const validation = validateRequiredFields({ title, description });
    if (!validation.valid) {
      return createErrorResponse(validation.message, 400, requestId);
    }

    // Additional validation
    if (title.length > 255) {
      return createErrorResponse('Title must be 255 characters or less', 400, requestId);
    }

    // Database operation
    const dbStartTime = Date.now();
    const result = await sql`
      INSERT INTO items (title, description, status)
      VALUES (${title}, ${description}, ${status || 'draft'})
      RETURNING *
    `;
    const dbDuration = Date.now() - dbStartTime;

    logger.dbQuery('INSERT INTO items', dbDuration);

    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'POST',
      url: request.url,
      statusCode: 201,
      duration,
      requestId,
    });

    return createSuccessResponse(result[0], requestId, 201);

  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Failed to create item', error, { requestId });

    logger.apiRequest({
      method: 'POST',
      url: request.url,
      statusCode: 500,
      duration,
      requestId,
      error,
    });

    // Handle specific database errors
    if (error.code === '23505') {
      return createErrorResponse('Item already exists', 409, requestId);
    }

    return createErrorResponse(
      'Failed to create item',
      500,
      requestId
    );
  }
}
```

## Production Logging

### Logger Functions

#### Basic Logging
```typescript
logger.debug('Debug info', { context: 'value' });  // Development only
logger.info('Important event', { userId: '123' });
logger.warn('Warning condition', { errorCount: 5 });
logger.error('Error occurred', error, { requestId });
```

#### API Request Logging
```typescript
logger.apiRequest({
  method: 'POST',
  url: '/api/users',
  statusCode: 201,
  duration: 156,      // milliseconds
  requestId: 'req_xxx',
  userId: 'user_123', // Optional
  error: error,       // Optional - for failed requests
});
```

#### Database Query Logging
```typescript
const startTime = Date.now();
const result = await sql`SELECT * FROM users WHERE id = ${id}`;
const duration = Date.now() - startTime;

logger.dbQuery('SELECT FROM users', duration);
```

#### External API Logging
```typescript
logger.externalApi({
  service: 'Coze',
  endpoint: '/chat',
  method: 'POST',
  statusCode: 200,
  duration: 1234,
  error: error,  // Optional
});
```

#### Authentication Events
```typescript
logger.auth('login', userId, { ip: request.ip });
logger.auth('failed_login', undefined, { username, ip: request.ip });
logger.auth('logout', userId);
```

## Error Handling Best Practices

### 1. Use Parameterized Queries (Security)
```typescript
// ✅ GOOD - Parameterized
const result = await sql`
  SELECT * FROM users WHERE id = ${userId}
`;

// ❌ BAD - SQL Injection vulnerability
const result = await sql.unsafe(`
  SELECT * FROM users WHERE id = '${userId}'
`);
```

### 2. Handle Database Errors Specifically
```typescript
try {
  await sql`INSERT INTO ...`;
} catch (error: any) {
  // PostgreSQL error codes
  if (error.code === '23505') {
    return createErrorResponse('Duplicate entry', 409, requestId);
  }
  if (error.code === '23503') {
    return createErrorResponse('Foreign key violation', 400, requestId);
  }
  
  // Use helper
  return handleDatabaseError(error, requestId);
}
```

### 3. Log Before Returning Errors
```typescript
try {
  // ... operation
} catch (error) {
  // Always log errors
  logger.error('Operation failed', error, {
    requestId,
    userId,
    context: 'important context',
  });
  
  // Then return response
  return createErrorResponse('Operation failed', 500, requestId);
}
```

## Migration Checklist

When updating existing API routes:

- [ ] Import `logger` from `@/lib/logger`
- [ ] Import error-handler utilities from `@/lib/api/error-handler`
- [ ] Replace all `console.log/error` with `logger.debug/info/error`
- [ ] Add `requestId` tracking with `generateRequestId()`
- [ ] Add timing with `startTime` and `Date.now() - startTime`
- [ ] Use `createSuccessResponse()` for all success responses
- [ ] Use `createErrorResponse()` for all error responses
- [ ] Replace `sql.unsafe()` with parameterized queries using `sql\`...\``
- [ ] Add `logger.apiRequest()` at end of successful operations
- [ ] Add `logger.apiRequest()` in error handlers with error context
- [ ] Remove manual `NextResponse.json()` calls
- [ ] Add `export const revalidate = 0` for cache control

## Examples of Migrated Routes

### Before Migration
```typescript
export async function GET(request: NextRequest) {
  try {
    const result = await sql.unsafe(`SELECT * FROM users`);
    return NextResponse.json({ users: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### After Migration
```typescript
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const result = await sql`SELECT * FROM users`;
    
    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'GET',
      url: '/api/users',
      statusCode: 200,
      duration,
      requestId,
    });

    return createSuccessResponse({ users: result }, requestId);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Failed to fetch users', error, { requestId });
    
    logger.apiRequest({
      method: 'GET',
      url: '/api/users',
      statusCode: 500,
      duration,
      requestId,
      error,
    });

    return createErrorResponse('Failed to fetch users', 500, requestId);
  }
}
```

## Production Monitoring

### Vercel Logs
In production (Vercel), all logs from `logger` are output as **JSON** which can be:
- Viewed in Vercel dashboard
- Exported to external services (Datadog, LogDNA, etc.)
- Searched by `requestId`, `userId`, `url`, `statusCode`

### Example Production Log
```json
{
  "timestamp": "2026-01-13T10:30:45.123Z",
  "level": "error",
  "message": "Failed to create user",
  "requestId": "req_1705145445123_abc",
  "userId": "user_123",
  "url": "/api/users",
  "method": "POST",
  "statusCode": 500,
  "duration": 156,
  "error": {
    "message": "Database connection timeout",
    "code": "ETIMEDOUT"
  }
}
```

### Tracking Requests
Use `requestId` to trace a request across multiple logs:
```bash
# In Vercel logs, search for:
requestId: "req_1705145445123_abc"

# You'll see all logs for that request:
# - Initial request received
# - Database queries
# - External API calls
# - Final response
```

## Testing the Migration

1. **Local Testing**
```bash
npm run dev
# Check console output - should see colored logs
```

2. **Check Response Format**
```bash
curl http://localhost:3000/api/users
# Should return:
{
  "success": true,
  "data": { ... },
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

3. **Test Error Handling**
```bash
curl -X POST http://localhost:3000/api/users -d '{}'
# Should return:
{
  "success": false,
  "error": "Missing required fields: ...",
  "requestId": "req_xxx",
  "timestamp": "..."
}
```

4. **Check Production Logs**
After deployment to Vercel:
- Go to Vercel Dashboard → Your Project → Logs
- Filter by "error" level
- Search for specific `requestId`
- Verify JSON format

## Common Patterns

### Pagination
```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '50');
const offset = (page - 1) * limit;

const items = await sql`
  SELECT * FROM items
  ORDER BY created_at DESC
  LIMIT ${limit} OFFSET ${offset}
`;

return createSuccessResponse({
  items,
  pagination: {
    page,
    limit,
    hasMore: items.length === limit,
  }
}, requestId);
```

### Soft Delete
```typescript
await sql`
  UPDATE items
  SET deleted_at = NOW()
  WHERE id = ${id}
`;

logger.info('Item soft deleted', { itemId: id, requestId });
```

### Transaction Rollback
```typescript
try {
  await sql.begin(async (sql) => {
    await sql`INSERT INTO orders ...`;
    await sql`UPDATE inventory ...`;
  });
} catch (error) {
  logger.error('Transaction failed, rolled back', error, { requestId });
  return createErrorResponse('Transaction failed', 500, requestId);
}
```

## Next Steps

1. Update remaining API routes in priority order:
   - `/api/erp/hrm/*` (HR Management)
   - `/api/erp/projects/*` (Project Management)
   - `/api/crm/*` (CRM routes)
   - `/api/analytics/*` (Analytics)

2. Add tests for standardized responses

3. Monitor production logs for errors

4. Set up log aggregation (optional - Datadog, LogDNA)
