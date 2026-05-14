#!/bin/bash
set -euo pipefail

# =============================================================================
# Build Machine User Data — ARM64 CDK Deployment Host
#
# Installs everything needed to run deploy-full.sh from this machine:
#   Node.js 22, Docker, AWS CDK, Git
#
# Usage: Attach to a t4g.small EC2 instance with AdministratorAccess IAM Role.
#        Then SSH in and run deploy-full.sh directly.
# =============================================================================

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get upgrade -y

# Git
apt-get install -y git curl unzip jq

# Node.js 22 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Docker
apt-get install -y docker.io
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# AWS CDK
npm install -g aws-cdk typescript ts-node

# AWS CLI v2 (ARM64)
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install --update
rm -rf /tmp/aws /tmp/awscliv2.zip

# SSM Agent (for remote access)
snap install amazon-ssm-agent --classic
systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

echo "=== Build machine ready ==="
echo "Node: $(node --version)"
echo "Docker: $(docker --version)"
echo "CDK: $(npx cdk --version)"
echo "AWS CLI: $(aws --version)"
