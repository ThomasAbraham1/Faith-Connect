#!/bin/bash
if [ -d "Faith-Connect" ]; then
    echo "Updating existing repository..."
    cd Faith-Connect
    sudo docker compose -f compose.prod.yml down
    git pull origin demo-prototype
else
    echo "Cloning new repository..."
    git clone -b demo-prototype https://github.com/ThomasAbraham1/Faith-Connect.git
    cd Faith-Connect
fi

cat <<EOF > .env
NODE_ENV=production
PORT=3000
SESSION_SECRET=CHRISTOSANESTI
JWT_SECRET=CHRISTOSANESTI
MONGO_DB_URI=mongodb+srv://cta102938:cta102938@cluster0.qesx1ag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
AWS_REGION=ap-south-1
# We no longer hardcode credentials here for security.
# Ensure they are set in your server's .env.production file.
SQS_QUEUE_NAME=bulk-email-queue
SQS_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/020087759950/bulk-email-queue
VITE_APP_API_URL=/api
EOF

echo "Building and starting Docker containers..."
sudo docker compose -f compose.prod.yml up -d --build
echo "Deployment complete!"
