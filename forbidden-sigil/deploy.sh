#!/bin/bash
set -euo pipefail

#───────────────────────────────────────────────
# Majicle — S3 + CloudFront デプロイ
#───────────────────────────────────────────────
# 使い方:
#   1. 初回: ./deploy.sh setup
#   2. 以降: ./deploy.sh
#───────────────────────────────────────────────

BUCKET_NAME="forbidden-sigil-app"
REGION="ap-northeast-1"
DIST_DIR="dist"

# ── ビルド ──
echo "==> Building..."
npm run build

# ── セットアップ (初回のみ) ──
if [ "${1:-}" = "setup" ]; then
  echo "==> Creating S3 bucket: $BUCKET_NAME"
  aws s3 mb "s3://$BUCKET_NAME" --region "$REGION" 2>/dev/null || true

  echo "==> Configuring static website hosting..."
  aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html

  echo "==> Creating CloudFront OAC..."
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config '{
      "Name": "forbidden-sigil-oac",
      "Description": "OAC for forbidden-sigil S3",
      "SigningProtocol": "sigv4",
      "SigningBehavior": "always",
      "OriginAccessControlOriginType": "s3"
    }' \
    --query 'OriginAccessControl.Id' --output text 2>/dev/null || echo "")

  if [ -z "$OAC_ID" ]; then
    echo "   OAC already exists, looking up..."
    OAC_ID=$(aws cloudfront list-origin-access-controls \
      --query "OriginAccessControlList.Items[?Name=='forbidden-sigil-oac'].Id" --output text)
  fi
  echo "   OAC ID: $OAC_ID"

  echo "==> Creating CloudFront distribution..."
  DIST_ID=$(aws cloudfront create-distribution \
    --distribution-config "{
      \"CallerReference\": \"forbidden-sigil-$(date +%s)\",
      \"Comment\": \"Forbidden Sigil\",
      \"Enabled\": true,
      \"DefaultRootObject\": \"index.html\",
      \"Origins\": {
        \"Quantity\": 1,
        \"Items\": [{
          \"Id\": \"S3-$BUCKET_NAME\",
          \"DomainName\": \"$BUCKET_NAME.s3.$REGION.amazonaws.com\",
          \"OriginAccessControlId\": \"$OAC_ID\",
          \"S3OriginConfig\": { \"OriginAccessIdentity\": \"\" }
        }]
      },
      \"DefaultCacheBehavior\": {
        \"TargetOriginId\": \"S3-$BUCKET_NAME\",
        \"ViewerProtocolPolicy\": \"redirect-to-https\",
        \"AllowedMethods\": {
          \"Quantity\": 2,
          \"Items\": [\"GET\", \"HEAD\"],
          \"CachedMethods\": { \"Quantity\": 2, \"Items\": [\"GET\", \"HEAD\"] }
        },
        \"ForwardedValues\": {
          \"QueryString\": false,
          \"Cookies\": { \"Forward\": \"none\" }
        },
        \"Compress\": true,
        \"MinTTL\": 0,
        \"DefaultTTL\": 86400,
        \"MaxTTL\": 31536000
      },
      \"CustomErrorResponses\": {
        \"Quantity\": 1,
        \"Items\": [{
          \"ErrorCode\": 403,
          \"ResponsePagePath\": \"/index.html\",
          \"ResponseCode\": \"200\",
          \"ErrorCachingMinTTL\": 10
        }]
      },
      \"ViewerCertificate\": {
        \"CloudFrontDefaultCertificate\": true
      }
    }" \
    --query 'Distribution.Id' --output text)

  echo "   Distribution ID: $DIST_ID"
  echo ""
  echo "==> Setting S3 bucket policy for CloudFront..."

  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"AllowCloudFront\",
      \"Effect\": \"Allow\",
      \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" },
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\",
      \"Condition\": {
        \"StringEquals\": {
          \"AWS:SourceArn\": \"arn:aws:cloudfront::$ACCOUNT_ID:distribution/$DIST_ID\"
        }
      }
    }]
  }"

  echo ""
  echo "==> Setup complete!"
  echo "   Distribution ID: $DIST_ID"
  echo "   Save this ID for future deploys."
  echo ""
  DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text)
  echo "   URL: https://$DOMAIN"
  echo "   (CloudFront のデプロイには数分かかります)"
  echo ""
fi

# ── アップロード ──
echo "==> Syncing $DIST_DIR to s3://$BUCKET_NAME..."

# HTML — キャッシュ短め
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=60" \
  --region "$REGION"

# アセット (JS/CSS) — ハッシュ付きなので長期キャッシュ
aws s3 sync "$DIST_DIR" "s3://$BUCKET_NAME" \
  --delete \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --region "$REGION"

echo "==> Upload complete!"

# ── CloudFront Invalidation (HTMLのみ) ──
# 既存のディストリビューションがあれば invalidation
DIST_ID_FILE=".cloudfront-dist-id"
if [ -f "$DIST_ID_FILE" ]; then
  CF_DIST_ID=$(cat "$DIST_ID_FILE")
  echo "==> Invalidating CloudFront ($CF_DIST_ID)..."
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths "/index.html" "/"  \
    --query 'Invalidation.Id' --output text
  echo "==> Done!"
elif [ -n "${DIST_ID:-}" ]; then
  echo "$DIST_ID" > "$DIST_ID_FILE"
  echo "==> Saved distribution ID to $DIST_ID_FILE"
  echo "==> Invalidating CloudFront ($DIST_ID)..."
  aws cloudfront create-invalidation \
    --distribution-id "$DIST_ID" \
    --paths "/index.html" "/" \
    --query 'Invalidation.Id' --output text
  echo "==> Done!"
else
  echo "   (CloudFront invalidation skipped — no distribution ID found)"
  echo "   Save your distribution ID in .cloudfront-dist-id"
fi
