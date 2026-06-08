#!/bin/bash
# Auto-deployment script to run on EC2
# This creates a webhook endpoint that GitHub can trigger

echo "Setting up auto-deployment on EC2..."

# Create deployment script
cat > ~/deploy-api.sh << 'EOF'
#!/bin/bash
cd ~/Rest_Api_Documentation
echo "$(date): Deployment triggered" >> ~/deployment.log
git fetch origin
git reset --hard origin/main
git pull origin main
docker compose down
docker compose up -d --build
echo "$(date): Deployment completed" >> ~/deployment.log
EOF

chmod +x ~/deploy-api.sh

# Create a simple webhook listener using Python
cat > ~/webhook-listener.py << 'EOF'
from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import hmac
import hashlib

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/deploy':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Run deployment script
            result = subprocess.run(['/home/ubuntu/deploy-api.sh'], 
                                   capture_output=True, text=True)
            
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Deployment triggered\n')
            print(f"Deployment executed: {result.stdout}")
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 9000), WebhookHandler)
    print('Webhook server running on port 9000...')
    server.serve_forever()
EOF

echo "Setup complete! Run the webhook listener with:"
echo "python3 ~/webhook-listener.py"
