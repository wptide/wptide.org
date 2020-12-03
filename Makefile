-include .env

# Set GCP configurations.
setup:
	@gcloud config set project ${GOOGLE_CLOUD_PROJECT}
	@gcloud config set gcloudignore/enabled true
	@gcloud config set functions/region us-central1
	@gcloud config set run/region us-central1
	@gcloud config set run/platform managed

setup.api:
	@cp .env.dist .env && cp .env.server.dist .env.server && cd app && npm install

setup.cloud: setup
	@gcloud components update
	@gcloud auth login
	@gcloud auth configure-docker
	@gcloud services enable containerregistry.googleapis.com
	@gcloud services enable run.googleapis.com
	@gcloud datastore databases create

setup.firebase:
	@cp .firebaserc.dist .firebaserc

setup.iam: setup
	@gcloud iam service-accounts create tide-run-server --display-name "Tide Cloud Run Server"

build.lighthouse-server:
	@docker build --no-cache -t gcr.io/${GOOGLE_CLOUD_PROJECT}/lighthouse-server:latest -t lighthouse-server:latest -f app/docker/lighthouse-server/Dockerfile .

build.phpcs-server:
	@docker build --no-cache -t gcr.io/${GOOGLE_CLOUD_PROJECT}/phpcs-server:latest -t phpcs-server:latest -f app/docker/phpcs-server/Dockerfile .

push.lighthouse-server:
	@docker push gcr.io/${GOOGLE_CLOUD_PROJECT}/lighthouse-server:latest

push.phpcs-server:
	@docker push gcr.io/${GOOGLE_CLOUD_PROJECT}/phpcs-server:latest

deploy.api: setup
	@gcloud functions deploy tide --source app --allow-unauthenticated --runtime nodejs12 --trigger-http

deploy.datastore: setup
	@gcloud app create --region=us-central
	@gcloud datastore databases create --region=us-central

deploy.firebase:
	@firebase deploy --only hosting

deploy.lighthouse-server: setup
	@gcloud run deploy lighthouse-server --no-allow-unauthenticated --image gcr.io/${GOOGLE_CLOUD_PROJECT}/lighthouse-server:latest --memory 1024
	@gcloud run services update lighthouse-server --concurrency 1

deploy.phpcs-server: setup
	@gcloud run deploy phpcs-server --no-allow-unauthenticated --image gcr.io/${GOOGLE_CLOUD_PROJECT}/phpcs-server:latest --memory 1024
	@gcloud run services update phpcs-server --concurrency 1

deploy.iam: setup
	@gcloud run services add-iam-policy-binding lighthouse-server \
		--member=serviceAccount:tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
		--role=roles/run.invoker
	@gcloud run services add-iam-policy-binding phpcs-server \
		--member=serviceAccount:tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
		--role=roles/run.invoker
	@gcloud projects add-iam-policy-binding ${GOOGLE_CLOUD_PROJECT} \
		--member=serviceAccount:service-${GOOGLE_CLOUD_PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com \
		--role=roles/iam.serviceAccountTokenCreator

deploy.topics: setup
	@gcloud pubsub topics create MESSAGE_TYPE_LIGHTHOUSE_REQUEST
	@gcloud pubsub topics create MESSAGE_TYPE_PHPCS_REQUEST

deploy.pubsub: setup.iam deploy.iam deploy.topics
	@gcloud beta pubsub subscriptions create lighthouse-server --topic MESSAGE_TYPE_LIGHTHOUSE_REQUEST \
		--push-endpoint=${GOOGLE_CLOUD_RUN_LIGHTHOUSE} \
		--ack-deadline 300 \
		--enable-message-ordering \
		--push-auth-service-account=tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com
	@gcloud beta pubsub subscriptions create phpcs-server --topic MESSAGE_TYPE_PHPCS_REQUEST \
		--push-endpoint=${GOOGLE_CLOUD_RUN_PHPCS} \
		--ack-deadline 300 \
		--enable-message-ordering \
		--push-auth-service-account=tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com

start.api:
	@cd app && npm start

start.lighthouse-server:
	@docker run -v $(PWD)/app/src:/app/src --rm -p 8090:8080 --env-file .env.server lighthouse-server:latest

start.phpcs-server:
	@docker run -v $(PWD)/app/src:/app/src --rm -p 8110:8080 --env-file .env.server phpcs-server:latest

start.proxy-server:
	@cd app && node src/run/proxyServer.js

start.emulator.datastore:
	@gcloud beta emulators datastore start --no-store-on-disk

start.emulator.firebase:
	@firebase emulators:start

start.emulator.pubsub:
	@gcloud beta emulators pubsub start
