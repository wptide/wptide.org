#!/bin/sh
#echo "Auditing $1"
mkdir audit output
cd audit
wget -qc "$1" && unzip -q *.zip && rm *.zip
../vendor/bin/phpcs -q -p . --standard=WordPress-Extra --extensions=php --report=json > ../output/extra.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.2- --report=json > ../output/php52.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.3- --report=json > ../output/php53.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.4- --report=json > ../output/php54.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.5- --report=json > ../output/php55.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.6- --report=json > ../output/php56.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.0- --report=json > ../output/php70.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.1- --report=json > ../output/php71.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.2- --report=json > ../output/php72.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.3- --report=json > ../output/php73.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.4- --report=json > ../output/php74.json

jq -n 'reduce inputs as $s (.; .[input_filename] += $s)' ../output/*.json
