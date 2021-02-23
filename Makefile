-include .env

# Set GCP configurations.
setup:
	@gcloud config set project ${GOOGLE_CLOUD_PROJECT}
	@gcloud config set gcloudignore/enabled true
	@gcloud config set functions/region us-central1
	@gcloud config set run/region us-central1
	@gcloud config set run/platform managed

setup.cloud: setup
	@gcloud components update
	@gcloud auth login
	@gcloud auth configure-docker
	@gcloud services enable containerregistry.googleapis.com
	@gcloud services enable run.googleapis.com

setup.iam: setup
	@gcloud iam service-accounts create tide-run-server --display-name "Tide Cloud Run Server"

build.lighthouse:
	@docker build --no-cache -t gcr.io/${GOOGLE_CLOUD_PROJECT}/lighthouse:${VERSION} -f ./app/docker/Dockerfile.lighthouse ./app

build.phpcs:
	@docker build --no-cache -t gcr.io/${GOOGLE_CLOUD_PROJECT}/phpcs:${VERSION} -f ./app/docker/Dockerfile.phpcs ./app

build.sync:
	@docker build --no-cache -t gcr.io/${GOOGLE_CLOUD_PROJECT}/sync:${VERSION} -f ./app/docker/Dockerfile.sync ./app

push.lighthouse:
	@docker push gcr.io/${GOOGLE_CLOUD_PROJECT}/lighthouse:${VERSION}

push.phpcs:
	@docker push gcr.io/${GOOGLE_CLOUD_PROJECT}/phpcs:${VERSION}

push.sync:
	@docker push gcr.io/${GOOGLE_CLOUD_PROJECT}/sync:${VERSION}

start.lighthouse:
	@docker run -v $(PWD)/app/src:/app/src --rm -p 5010:8080 --env-file .env.server gcr.io/${GOOGLE_CLOUD_PROJECT}/lighthouse:${VERSION}

start.phpcs:
	@docker run -v $(PWD)/app/src:/app/src --rm -p 5011:8080 --env-file .env.server gcr.io/${GOOGLE_CLOUD_PROJECT}/phpcs:${VERSION}

start.sync:
	@docker run -v $(PWD)/app/src:/app/src --rm -p 5012:8080 --env-file .env.server gcr.io/${GOOGLE_CLOUD_PROJECT}/sync:${VERSION}

deploy.firestore: setup
	@gcloud app create --region=us-central
	@gcloud firestore databases create --region=us-central

deploy.firebase:
	@firebase deploy

deploy.lighthouse: setup
	@gcloud run deploy lighthouse-server --no-allow-unauthenticated --image gcr.io/${GOOGLE_CLOUD_PROJECT}/lighthouse:${VERSION} --memory ${GOOGLE_CLOUD_RUN_LIGHTHOUSE_MEMORY} --concurrency 1

deploy.phpcs: setup
	@gcloud run deploy phpcs-server --no-allow-unauthenticated --image gcr.io/${GOOGLE_CLOUD_PROJECT}/phpcs:${VERSION} --memory ${GOOGLE_CLOUD_RUN_PHPCS_MEMORY} --concurrency 1

deploy.sync: setup
	@gcloud run deploy sync-server --no-allow-unauthenticated --image gcr.io/${GOOGLE_CLOUD_PROJECT}/sync:${VERSION} --memory ${GOOGLE_CLOUD_RUN_SYNC_MEMORY} --concurrency 1 --timeout 15m

deploy.iam: setup
	@gcloud run services add-iam-policy-binding lighthouse-server \
		--member=serviceAccount:tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
		--role=roles/run.invoker
	@gcloud run services add-iam-policy-binding phpcs-server \
		--member=serviceAccount:tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
		--role=roles/run.invoker
	@gcloud run services add-iam-policy-binding sync-server \
		--member=serviceAccount:tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
		--role=roles/run.invoker
	@gcloud projects add-iam-policy-binding ${GOOGLE_CLOUD_PROJECT} \
		--member=serviceAccount:service-${GOOGLE_CLOUD_PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com \
		--role=roles/iam.serviceAccountTokenCreator

deploy.topics: setup
	@gcloud pubsub topics create MESSAGE_TYPE_LIGHTHOUSE_REQUEST
	@gcloud pubsub topics create MESSAGE_TYPE_PHPCS_REQUEST
	@gcloud pubsub topics create MESSAGE_TYPE_SYNC_REQUEST

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
	@gcloud beta pubsub subscriptions create sync-server --topic MESSAGE_TYPE_SYNC_REQUEST \
		--push-endpoint=${GOOGLE_CLOUD_RUN_SYNC} \
		--ack-deadline 30 \
		--push-auth-service-account=tide-run-server@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com

deploy.scheduler: setup
	@gcloud scheduler jobs create pubsub sync-server --schedule "*/5 * * * *" --topic MESSAGE_TYPE_SYNC_REQUEST

describe.lighthouse: setup
	@gcloud run services describe lighthouse-server --format 'value(status.url)'

describe.phpcs: setup
	@gcloud run services describe phpcs-server --format 'value(status.url)'

describe.sync: setup
	@gcloud run services describe sync-server --format 'value(status.url)'
