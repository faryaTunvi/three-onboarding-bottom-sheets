# Running the Backend Server

This guide covers everything you need to know about running the Go backend server.

## Quick Start

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Start the Server

```bash
go run main.go
```

The server will start on **http://localhost:8080** by default.

You should see output similar to:
```
[GIN-debug] Listening and serving HTTP on :8080
```

## Verification

Test that the server is running:

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"ok"}
```

## Configuration

### Change Port

Set the `PORT` environment variable:

```bash
PORT=3000 go run main.go
```

Or export it:
```bash
export PORT=3000
go run main.go
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |

## Running Options

### Option 1: Direct Run (Development)

```bash
cd backend
go run main.go
```

**Pros:**
- Quick to start
- No build artifacts
- Good for development

**Cons:**
- Slower startup
- Recompiles each time

### Option 2: Build and Run (Production-like)

```bash
cd backend
go build -o server
./server
```

**Pros:**
- Faster startup
- Can distribute binary
- Production-ready

**Cons:**
- Extra build step
- Creates binary file

### Option 3: With Auto-Reload (Development)

Install Air for hot reload:
```bash
go install github.com/cosmtrek/air@latest
```

Run with auto-reload:
```bash
cd backend
air
```

### Option 4: Background Process

Run in background:
```bash
cd backend
nohup go run main.go > server.log 2>&1 &
```

Check if running:
```bash
curl http://localhost:8080/health
```

Stop background process:
```bash
# Find process ID
lsof -i :8080

# Kill process
kill <PID>
```

## Using the Startup Script

From project root:

```bash
./start-dev.sh
```

This script will:
- Start the backend automatically
- Start Metro bundler
- Show your local IP address
- Handle cleanup on exit

## Checking Server Status

### Check if Port is in Use

```bash
lsof -i :8080
```

### View Server Logs

If running in foreground, logs appear in terminal.

If running in background:
```bash
tail -f server.log
```

### Test All Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Request magic link
curl -X POST http://localhost:8080/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check server responds
echo $?  # Should return 0
```

## Common Scenarios

### Running for Device Testing

When testing on a physical device, you need to use your computer's IP:

1. Find your local IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or use hostname
   hostname -I
   ```

2. Server is already accessible at this IP
3. Update frontend to use: `http://YOUR_IP:8080`

The server listens on all interfaces (0.0.0.0) by default.

### Running Multiple Instances

Run on different ports:

```bash
# Terminal 1
PORT=8080 go run main.go

# Terminal 2
PORT=8081 go run main.go
```

### Running with Logging

Enable verbose logging:

```bash
GIN_MODE=debug go run main.go
```

For production:
```bash
GIN_MODE=release go run main.go
```

## Troubleshooting

### Port Already in Use

**Error:**
```
bind: address already in use
```

**Solution:**
```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill <PID>

# Or use a different port
PORT=8081 go run main.go
```

### Missing Dependencies

**Error:**
```
package github.com/gin-gonic/gin is not in GOROOT
```

**Solution:**
```bash
cd backend
go mod download
go mod tidy
```

### Cannot Find main.go

**Error:**
```
stat main.go: no such file or directory
```

**Solution:**
Make sure you're in the backend directory:
```bash
cd /path/to/project/backend
go run main.go
```

### Permission Denied

**Error:**
```
permission denied
```

**Solution:**
```bash
# Make sure you have Go installed
go version

# Check file permissions
ls -la main.go

# Try with sudo (not recommended)
sudo go run main.go
```

### Connection Refused (Frontend)

**Issue:**
Frontend can't connect to backend.

**Solutions:**

1. **Verify server is running:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Check firewall:**
   - Mac: System Preferences → Security & Privacy → Firewall
   - Allow incoming connections for Go

3. **Update frontend API URL:**
   - Check `src/services/apiService.ts`
   - Use your local IP, not `localhost`

4. **Verify same network:**
   - Device and computer must be on same WiFi

## Server Output Explained

### Successful Startup

```
[GIN-debug] POST   /api/auth/request-link --> main.main.func1 (4 handlers)
[GIN-debug] GET    /api/auth/verify      --> main.main.func1 (4 handlers)
[GIN-debug] POST   /api/auth/refresh     --> main.main.func1 (4 handlers)
[GIN-debug] POST   /api/feedback/submit  --> main.main.func1 (5 handlers)
[GIN-debug] GET    /api/feedback/list    --> main.main.func1 (5 handlers)
[GIN-debug] Listening and serving HTTP on :8080
Server starting on port 8080
```

### Request Logs

```
[GIN] 2026/02/16 - 10:30:00 | 200 |     123.4µs |   192.168.1.100 | POST     "/api/auth/request-link"
```

Fields:
- `200` - HTTP status code
- `123.4µs` - Request duration
- `192.168.1.100` - Client IP
- `POST` - HTTP method
- `/api/auth/request-link` - Endpoint

### Feedback Slack Mock

```
📤 [MOCK SLACK] Message sent to #feedback:
📝 *New Feedback Received*
👤 User: 550e8400-e29b-41d4-a716-446655440000
📧 Email: test@example.com
📱 Platform: ios
💬 Feedback: Great app!
🕒 Time: 2026-02-16T10:30:00Z
```

## Stopping the Server

### Foreground Process

Press `Ctrl+C` in the terminal

### Background Process

```bash
# Find PID
lsof -i :8080

# Or use ps
ps aux | grep "go run main.go"

# Kill process
kill <PID>

# Force kill if needed
kill -9 <PID>
```

### Kill All Go Processes

```bash
killall go
```

**Warning:** This kills ALL Go processes!

## Production Deployment

### Build for Production

```bash
cd backend

# Build binary
CGO_ENABLED=0 go build -o server main.go

# Run binary
./server
```

### Using Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM golang:1.22-alpine
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o server main.go
EXPOSE 8080
CMD ["./server"]
```

Build and run:
```bash
docker build -t onboarding-backend .
docker run -p 8080:8080 onboarding-backend
```

### Using systemd (Linux)

Create `/etc/systemd/system/onboarding-backend.service`:
```ini
[Unit]
Description=Onboarding Backend Server
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/backend
ExecStart=/path/to/backend/server
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start onboarding-backend
sudo systemctl enable onboarding-backend
sudo systemctl status onboarding-backend
```

## Performance Tips

### 1. Use Release Mode

```bash
GIN_MODE=release go run main.go
```

### 2. Build with Optimizations

```bash
go build -ldflags="-s -w" -o server main.go
```

Flags:
- `-s` - Strip debug info
- `-w` - Strip DWARF tables

### 3. Monitor Resources

```bash
# CPU and memory usage
ps aux | grep server

# Detailed monitoring
top -pid <PID>
```

## Development Workflow

1. **Start backend:**
   ```bash
   cd backend
   go run main.go
   ```

2. **Keep terminal open** to see logs

3. **Make changes** to code

4. **Restart server:**
   - Press `Ctrl+C`
   - Run `go run main.go` again

5. **Or use Air** for auto-reload

## Testing the Server

### Manual Testing

See [../API_TESTING.md](../API_TESTING.md) for complete examples.

Quick test:
```bash
# Request magic link
curl -X POST http://localhost:8080/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should return token
```

### Automated Testing

```bash
cd backend
go test ./...
```

## Security Notes

### Development Mode

- Server accepts connections from any IP
- CORS allows all origins
- Detailed error messages
- Debug logs enabled

### Production Mode

Before deploying:

1. Set `GIN_MODE=release`
2. Configure specific CORS origins
3. Use environment variables for secrets
4. Enable HTTPS/TLS
5. Set up proper logging
6. Use rate limiting
7. Monitor for errors

## Getting Help

**Server won't start:**
1. Check if port 8080 is available
2. Verify Go is installed: `go version`
3. Check dependencies: `go mod download`

**Connection issues:**
1. Verify server is running: `curl localhost:8080/health`
2. Check firewall settings
3. Use correct IP address in frontend

**Performance issues:**
1. Check server logs
2. Monitor resource usage
3. Use release mode
4. Consider profiling

## Quick Reference

```bash
# Start server
cd backend && go run main.go

# Test health
curl http://localhost:8080/health

# Stop server
Ctrl+C

# Check if running
lsof -i :8080

# View logs (if background)
tail -f server.log

# Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

**Server URL:** http://localhost:8080 (or http://YOUR_IP:8080)

**Default Port:** 8080

**Ready to go!** 🚀
