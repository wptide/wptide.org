<?php

$stdin = fopen('php://stdin', 'r');
$audit_data = json_decode( file_get_contents( 'php://stdin' ), true );

$output = array(
    'id' => 'AUDIT_ID',
    'reports' => array(
        'compatible_versions' => array(),
        'incompatible_versions' => array(),
    ),
);

foreach( $audit_data as $filename => $phpcs_audit ) {
    if ( false === strstr( $filename, 'php' ) ) {
        continue;
    }
    $filename = str_replace( '../output/php', '', $filename );
    $filename = str_replace( '.json', '', $filename );
    $key = $phpcs_audit['totals']['errors'] === 0 ? 'compatible_versions' : 'incompatible_versions';
    $output['reports'][$key][] = $filename;
}

echo json_encode( $output, JSON_PRETTY_PRINT );
