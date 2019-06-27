<?php
function dd()
{
    foreach(func_get_args() as $value) {
        var_dump($value);
    }
    sleep(10);
    exit;
}

function findLineNumberByFunctionName(string $file, string $function)
{
    if(!is_file($file)) {
        return null;
    }

    $search = sprintf('function %s\(', $function);
    $handle = fopen($file, 'r');
    $line = 0;
    while(!$endOfFile = feof($handle)) {
        $line++;
        $lineString = fgets($handle);
        if(preg_match(sprintf('/%s/', $search), $lineString)) {
            break;
        }
    }
    fclose($handle);
    return $endOfFile ? null : $line;
}

$location = urldecode($argv[1]);
$location = str_replace('/', '\\', $location);
$location = explode(':\\\\', $location, 2)[1];

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
$phpstorm = '"C:\Program Files (x86)\JetBrains\PhpStorm 2016.3.3\bin\phpstorm64.exe"';

exec($command = "$phpstorm $number \"$location\"");
