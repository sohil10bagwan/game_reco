# API Documentation for Game Reco Frontend

This document describes the API endpoints that the Game Reco frontend expects from the backend server.

## Base URL

```
http://localhost:3000
```

Configure via `VITE_API_URL` environment variable.

---

## Endpoints

### 1. Get Game Recommendations

Get a list of games based on user's PC specifications and preferences.

**Endpoint**: `POST /api/recommend`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "ram": 16,
  "cpuLevel": 2,
  "gpuLevel": 3,
  "genre": "Action"
}
```

**Request Parameters**:

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `ram` | number | Yes | 4, 8, 16, 32 | RAM in GB |
| `cpuLevel` | number | Yes | 1, 2, 3 | CPU performance (1=Low, 2=Medium, 3=High) |
| `gpuLevel` | number | Yes | 1, 2, 3 | GPU performance (1=Low, 2=Medium, 3=High) |
| `genre` | string | Yes | Any genre string | Preferred game genre |

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Cyberpunk 2077",
    "genre": "RPG",
    "rating": 8.5,
    "image_url": "https://example.com/image.jpg",
    "description": "An open-world, action-adventure story set in Night City...",
    "trailer_url": "https://www.youtube.com/watch?v=...",
    "min_ram": 8,
    "min_cpu_level": 2,
    "min_gpu_level": 2
  },
  {
    "id": 2,
    "name": "The Witcher 3",
    "genre": "RPG",
    "rating": 9.3,
    "image_url": "https://example.com/image2.jpg",
    "description": "As war rages on throughout the Northern Realms...",
    "trailer_url": "https://www.youtube.com/watch?v=...",
    "min_ram": 6,
    "min_cpu_level": 2,
    "min_gpu_level": 2
  }
]
```

**Response Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | Unique game identifier |
| `name` | string | Yes | Game title |
| `genre` | string | Yes | Game genre |
| `rating` | number | Yes | Game rating (0-10) |
| `image_url` | string | No | URL to game thumbnail/cover image |
| `description` | string | No | Game description |
| `trailer_url` | string | No | YouTube or video URL |
| `min_ram` | number | Yes | Minimum RAM required (GB) |
| `min_cpu_level` | number | Yes | Minimum CPU level (1-3) |
| `min_gpu_level` | number | Yes | Minimum GPU level (1-3) |

**Error Responses**:

400 Bad Request:
```json
{
  "error": "Invalid parameters",
  "message": "RAM must be one of: 4, 8, 16, 32"
}
```

500 Internal Server Error:
```json
{
  "error": "Server error",
  "message": "Unable to fetch recommendations"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "ram": 16,
    "cpuLevel": 2,
    "gpuLevel": 3,
    "genre": "Action"
  }'
```

---

### 2. Get Game Details

Get detailed information about a specific game.

**Endpoint**: `GET /api/games/:id`

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Game ID |

**Request Headers**: None required

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Cyberpunk 2077",
  "genre": "RPG",
  "rating": 8.5,
  "image_url": "https://example.com/image.jpg",
  "description": "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality.",
  "trailer_url": "https://www.youtube.com/watch?v=8X2kIfS6fb8",
  "min_ram": 8,
  "min_cpu_level": 2,
  "min_gpu_level": 2
}
```

**Response Fields**: Same as recommendation endpoint

**Error Responses**:

404 Not Found:
```json
{
  "error": "Not found",
  "message": "Game with ID 999 not found"
}
```

500 Internal Server Error:
```json
{
  "error": "Server error",
  "message": "Unable to fetch game details"
}
```

**Example cURL**:
```bash
curl http://localhost:3000/api/games/1
```

---

## Data Formats

### Performance Levels

The frontend uses numeric values for CPU and GPU levels:

| Level | Numeric Value | Description |
|-------|---------------|-------------|
| Low | 1 | Entry-level/integrated hardware |
| Medium | 2 | Mid-range hardware |
| High | 3 | High-end/enthusiast hardware |

### RAM Values

Supported RAM values (in GB):
- 4
- 8
- 16
- 32

### Genre Values

Common genres (not limited to these):
- Action
- Adventure
- RPG
- Strategy
- FPS
- Sports
- Racing
- Simulation
- Horror
- Puzzle

### Rating Scale

Game ratings should be:
- Type: `number` (decimal)
- Range: 0.0 to 10.0
- Example: 8.5, 7.2, 9.1

### Image URLs

- Should be publicly accessible
- Recommended size: 400x225px (16:9 aspect ratio) minimum
- Supported formats: JPG, PNG, WebP
- Frontend includes fallback for missing images

### Video URLs

- YouTube URLs supported: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube short URLs: `https://youtu.be/VIDEO_ID`
- Frontend extracts video ID for embedding

---

## CORS Configuration

The backend must enable CORS for the frontend origin:

```javascript
// Example for Express.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  methods: ['GET', 'POST'],
  credentials: true
}));
```

For production:
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

---

## Error Handling

The frontend expects errors in this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

**Status Codes**:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (game doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

Recommended rate limits:
- `/api/recommend`: 10 requests per minute per IP
- `/api/games/:id`: 60 requests per minute per IP

---

## Testing

### Test Recommendation Endpoint

```bash
# Test valid request
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"ram": 16, "cpuLevel": 2, "gpuLevel": 3, "genre": "Action"}'

# Test invalid RAM
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"ram": 5, "cpuLevel": 2, "gpuLevel": 3, "genre": "Action"}'
```

### Test Game Details Endpoint

```bash
# Test existing game
curl http://localhost:3000/api/games/1

# Test non-existent game
curl http://localhost:3000/api/games/999999
```

---

## Sample Data

### Sample Games for Testing

```json
[
  {
    "id": 1,
    "name": "Stardew Valley",
    "genre": "Simulation",
    "rating": 9.1,
    "image_url": "https://via.placeholder.com/400x225/4B3D60/FFD700?text=Stardew+Valley",
    "description": "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.",
    "trailer_url": "https://www.youtube.com/watch?v=ot7uXNQskhs",
    "min_ram": 2,
    "min_cpu_level": 1,
    "min_gpu_level": 1
  },
  {
    "id": 2,
    "name": "The Witcher 3: Wild Hunt",
    "genre": "RPG",
    "rating": 9.3,
    "image_url": "https://via.placeholder.com/400x225/1a1a24/8338ec?text=The+Witcher+3",
    "description": "As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.",
    "trailer_url": "https://www.youtube.com/watch?v=c0i88t0Kacs",
    "min_ram": 8,
    "min_cpu_level": 2,
    "min_gpu_level": 2
  },
  {
    "id": 3,
    "name": "Hades",
    "genre": "Action",
    "rating": 9.0,
    "image_url": "https://via.placeholder.com/400x225/8B0000/FFD700?text=Hades",
    "description": "Defy the god of death as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion and Transistor.",
    "trailer_url": "https://www.youtube.com/watch?v=91t0ha9x0AE",
    "min_ram": 8,
    "min_cpu_level": 2,
    "min_gpu_level": 2
  }
]
```

---

## Implementation Checklist

Backend developers should ensure:

- [ ] POST `/api/recommend` endpoint implemented
- [ ] GET `/api/games/:id` endpoint implemented
- [ ] CORS enabled for frontend origin
- [ ] Error responses in correct format
- [ ] All required fields returned
- [ ] Performance levels use numeric values (1-3)
- [ ] Image URLs are accessible
- [ ] YouTube URLs properly formatted
- [ ] Rate limiting configured
- [ ] Database contains sample games

---

## Notes

1. **Image URLs**: If no image is provided, frontend shows a placeholder
2. **Trailer URLs**: Optional - frontend handles missing trailers gracefully
3. **Descriptions**: Can be long text - frontend handles overflow
4. **IDs**: Must be unique integers or strings
5. **Ratings**: Frontend formats to 1 decimal place for display

---

For questions or issues with the API integration, please contact the backend development team.
