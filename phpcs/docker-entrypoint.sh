#!/bin/sh
mkdir audit output
cd audit
wget -qc "$1" && unzip -q *.zip && rm *.zip
../vendor/bin/phpcs -q -p . --standard=WordPress-Extra --extensions=php --report=json > ../output/extra.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.2- --report=json > ../output/php5.2.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.3- --report=json > ../output/php5.3.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.4- --report=json > ../output/php5.4.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.5- --report=json > ../output/php5.5.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 5.6- --report=json > ../output/php5.6.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.0- --report=json > ../output/php7.0.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.1- --report=json > ../output/php7.1.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.2- --report=json > ../output/php7.2.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.3- --report=json > ../output/php7.3.json
../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 7.4- --report=json > ../output/php7.4.json
# ../vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion 8.0- --report=json > ../output/php8.0.json

# Combine all json files, keyed by relative path / filename
jq -n 'reduce inputs as $s (.; .[input_filename] += $s)' ../output/*.json | php ../audit.php | sed "s/AUDIT_ID/$2/"

