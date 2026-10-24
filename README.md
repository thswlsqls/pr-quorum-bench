# pr-quorum-bench

A tiny JSON notes API built on `node:http`, with HMAC-signed bearer tokens.
No runtime dependencies.

## Run

```sh
TOKEN_SECRET=change-me npm start
```

Notes are kept in `data/notes.json` (override with `NOTES_FILE`) and
survive restarts.

## Endpoints

All endpoints need `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/notes?page=1&size=20` | List your notes, paginated |
| POST | `/notes` | Create a note: `{ "text": "..." }` |
| GET | `/notes/:id` | Read one of your notes |
| PATCH | `/notes/:id` | Edit one of your notes: `{ "text": "..." }` |
| DELETE | `/notes/:id` | Delete one of your notes |

## Test

```sh
npm test
```
