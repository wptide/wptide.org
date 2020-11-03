<?php

$stdin = fopen('php://stdin', 'r');
$audit_data = json_decode( file_get_contents( 'php://stdin' ), true );

$output = array(
    'id' => 'AUDIT_ID',
    'reports' => array(
        'phpcs_phpcompatibility' => array(
            'compatible_versions' => array(),
            'incompatible_versions' => array(),
        ),
    ),
);

foreach( $audit_data as $filename => $phpcs_audit ) {
    if ( false === strstr( $filename, 'php' ) ) {
        $output['reports']['phpcs_wordpress'] = $phpcs_audit;
        continue;
    }
    $version = str_replace( '../output/php', '', $filename );
    $version = str_replace( '.json', '', $version );
    $key = $phpcs_audit['totals']['errors'] === 0 ? 'compatible_versions' : 'incompatible_versions';
    $output['reports']['phpcs_phpcompatibility'][$key][] = $version;
}

echo json_encode( $output, JSON_PRETTY_PRINT );
