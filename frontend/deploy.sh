yarn
yarn build
gcloud app deploy --quiet
gcloud compute url-maps invalidate-cdn-cache wido --path "/*"