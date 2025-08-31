# Mappls OAuth Integration Fix

## Problem Fixed

The Mappls API OAuth token generation was failing due to:
1. **Incorrect OAuth endpoint**: Was using `/advancedmaps/v1/oauth/token` instead of `/security/oauth/token`
2. **Improper authorization header format**: Was using `Bearer {token}` instead of `{token_type} {access_token}`
3. **Missing error handling**: API errors weren't properly logged and handled

## Changes Made

### 1. Updated OAuth Endpoint
```typescript
// ❌ Before (incorrect)
const response = await fetch(`${MAPPLS_API_BASE}/advancedmaps/v1/oauth/token`, { ... });

// ✅ After (correct)
const response = await fetch(`${MAPPLS_API_BASE}/security/oauth/token`, { ... });
```

### 2. Fixed Authorization Header Format
```typescript
// ❌ Before (incorrect)
'Authorization': `Bearer ${token}`

// ✅ After (correct) 
'Authorization': `${tokenType} ${token}` // e.g., "bearer {access_token}"
```

### 3. Enhanced Error Handling
- Added detailed error logging for OAuth failures
- Added configuration validation
- Added proper error responses with details

### 4. Added Configuration Validation
- Checks for missing environment variables
- Provides clear error messages for configuration issues

## Environment Variables Required

Create a `.env.local` file with the following variables:

```bash
# OAuth Credentials (server-side only)
MAPPLS_CLIENT_ID=your-client-id-here
MAPPLS_CLIENT_SECRET=your-client-secret-here

# Public API Keys (can be exposed to client-side)
NEXT_PUBLIC_MAPPLS_REST_API_KEY=your-rest-api-key-here
NEXT_PUBLIC_MAPPLS_MAP_API_KEY=your-map-api-key-here
```

## Testing the Fix

1. **Test OAuth Authentication**:
   ```bash
   curl http://localhost:3000/api/mappls/test-auth
   ```

2. **Test Places API**:
   ```bash
   curl "http://localhost:3000/api/mappls/places?category=COFFEE"
   ```

## Expected OAuth Response Format

The OAuth API now returns the correct format as documented:

```json
{
  "access_token": "348b5960-d661-4d61-a86c-a2895f79390b",
  "token_type": "bearer",
  "expires_in": 259199,
  "scope": "READ",
  "project_code": "prj1756574425i1498633824",
  "client_id": "96dHZVzsAuu1es7JC393-NUnhNcyBRWiL74rTERs1vybNoxmT10T2YlTa1BuMmVIYduZobr6i0lxNgJGE54kfM0W0bpUuLOw"
}
```

## API Usage Example

```typescript
// The token is now automatically managed and refreshed
const places = await searchIndorePlaces({
  location: '22.7196,75.8577',
  category: 'COFFEE',
  radius: 5000
});
```

## Key Benefits

1. **Automatic Token Management**: Tokens are cached and automatically refreshed
2. **Proper Error Handling**: Clear error messages for debugging
3. **Configuration Validation**: Ensures all required credentials are set
4. **Correct API Format**: Uses the documented OAuth 2.0 flow properly
