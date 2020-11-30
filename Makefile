-include .env

# Set GCP configurations.
setup:
	@gcloud config set project ${GOOGLE_CLOUD_PROJECT}
	@gcloud config set gcloudignore/enabled true

start.emulator.datastore:
	@gcloud beta emulators datastore start --no-store-on-disk

start.emulator.firebase:
	@firebase emulators:start

start.emulator.pubsub:
	@gcloud beta emulators pubsub start

setup.api:
	@cp .env.dist .env && cp .env.server.dist .env.server && cd app && npm install

setup.firebase:
	@cp .firebaserc.dist .firebaserc

start.api:
	@cd app && npm start

start.lighthouse-server:
	@docker run -v $(pwd)/app/src:/app/src --rm -p 8090:8080 --env-file .env.server lighthouse-server:latest

start.phpcs-server:
	@docker run -v $(pwd)/app/src:/app/src --rm -p 8110:8080 --env-file .env.server phpcs-server:latest

start.proxy-server:
	@node app/src/run/proxyServer.js

build.lighthouse-server:
	@docker build --no-cache -t lighthouse-server:latest -f app/docker/lighthouse-server/Dockerfile .

build.phpcs-server:
	@docker build --no-cache -t phpcs-server:latest -f app/docker/phpcs-server/Dockerfile .

deploy.api: setup
	@gcloud functions deploy tide --source app --allow-unauthenticated --region=us-central1 --runtime nodejs12 --trigger-http

deploy.firebase:
	@firebase deploy --only hosting
