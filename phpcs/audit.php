<?php

$stdin = fopen('php://stdin', 'r');
$audit_data = json_decode( file_get_contents( 'php://stdin' ), true );

$output = array(
    'id' => 'AUDIT_ID',
    'reports' => array(
        'phpcs_phpcompatibilitywp' => array(
            'compatible_versions' => array(),
            'incompatible_versions' => array(),
            'raw' => array(),
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
    if ( false !== strstr( $filename, 'raw' ) ) {
        $output['reports']['phpcs_phpcompatibilitywp']['raw'] = $phpcs_audit;
        continue;
    }
    $output['raw_reports']['phpcs_phpcompatibilitywp'][$version] = $phpcs_audit;
    $key = $phpcs_audit['totals']['errors'] === 0 ? 'compatible_versions' : 'incompatible_versions';
    $output['reports']['phpcs_phpcompatibilitywp'][$key][] = $version;
}

echo json_encode( $output, JSON_PRETTY_PRINT );
