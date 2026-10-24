# pr-quorum-bench

A tiny JSON notes API built on `node:http`, with HMAC-signed bearer tokens.
Token lifetimes accept [`ms`](https://www.npmjs.com/package/ms) strings such as `15m`, `1h` or `7d`.

## Run

```sh
TOKEN_SECRET=change-me npm start
```

## Endpoints

All endpoints need `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/notes?page=1&size=20` | List your notes, paginated |
| POST | `/notes` | Create a note: `{ "text": "..." }` |
| GET | `/notes/:id` | Read one of your notes |
| DELETE | `/notes/:id` | Delete one of your notes |

## Test

```sh
npm test
```
