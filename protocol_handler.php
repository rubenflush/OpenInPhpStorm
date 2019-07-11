<?php

const FROM_PROTOCOL=true;

include 'helpers.php';

$protocol = PROTOCOL.'://';
$data = json_decode(urldecode(substr($argv[1], strlen($protocol))), true);
$phpstorm = $data['phpstorm_path'] ?? null;

$location = $data['to'];
$location = str_replace('/', '\\', $location);

if(preg_match('/@([A-Za-z_]*)/', $location, $matches)) {
    $location = substr($location, 0, -strlen($matches[0]));
    $function = $matches[1];

    $lineNumber = findLineNumberByFunctionName($location, $function);

} elseif(preg_match('/\:([0-9]*)-?(?:[0-9]*)?$/', $location, $lineNumber)) {
	$fullMatch = $lineNumber[0];
    $lineNumber = $lineNumber[1];
    $location = substr($location, 0, -strlen($fullMatch));
} else {
    $lineNumber = '';
}

$number = $lineNumber ?  "--line $lineNumber " : '';

if(!is_file($phpstorm)) {
    error('Phpstorm not found at [%s]', $phpstorm);
}
exec($command = "\"$phpstorm\" $number \"$location\"");
