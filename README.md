# Mapping API

Environments: 

```
R7PLATFORM_MAPPING_API_DB_HOST=localhost
R7PLATFORM_MAPPING_API_DB_PORT=5433
R7PLATFORM_MAPPING_API_DB_NAME=xxxxx
R7PLATFORM_MAPPING_API_DB_SCHEMA=xxxx
R7PLATFORM_MAPPING_API_DB_USER=xxxx
R7PLATFORM_MAPPING_API_DB_PASSWORD=xxxxxx
R7PLATFORM_MAPPING_API_DB_POOL_MAX=500
R7PLATFORM_MAPPING_API_DB_POOL_MIN=0

R7PLATFORM_MAPPING_API_PORT=3000
R7PLATFORM_MAPPING_API_LOGIN_ENDPOINT=http://localhost:3001/login

NODE_ENV=development
```

# Run

```
NODE_ENV=development \
R7PLATFORM_MAPPING_API_DB_HOST=localhost \
R7PLATFORM_MAPPING_API_DB_NAME=test \
R7PLATFORM_MAPPING_API_DB_SCHEMA=test \
R7PLATFORM_MAPPING_API_DB_USER=test \
R7PLATFORM_MAPPING_API_DB_PASSWORD=test \
R7PLATFORM_MAPPING_API_SECRET_KEY=yQPaQEhRKkC971hiyOye0HLiliKePJDR \
R7PLATFORM_MAPPING_API_LOGIN_ENDPOINT=http://localhost:3001/login \
npm start
```

# Build

```
npm run build
```
