
set -e

echo "Running NPM install to update dependencies"
echo `date`
npm install --legacy-peer-deps

echo "Building frontend"
echo `date`
npm run compile
