<?php

include 'helpers.php';

info('Installing protocol');

$dir = __DIR__.DIRECTORY_SEPARATOR;
$protocol = 'openInPhpStorm';

copyExampleIniFile();

info('Using protocol [%s]', $protocol);
info('Checking protocol existence in registry');
$registryRoot = sprintf('HKEY_CLASSES_ROOT\%s', $protocol);
exec(sprintf('reg query %s', $registryRoot), $error);
if($error) {
    info('Protocol already installed. Quiting...');
    return;
}

$registryContents = file_get_contents($dir.'registry_template.txt');
$replacements = [
    'protocol' => $protocol,
    'php' => PHP_BINARY,
    'protocol_handler' => $dir.'protocol_handler.php',
];

foreach($replacements as $tag => $replacement) {
    $search = preg_replace('/./', '$0', sprintf('{{%s}}', $tag));
    $replace = preg_replace('/./', '$0', str_replace('\\', '\\\\', $replacement));
    $registryContents = str_replace($search, $replace, $registryContents);
}
$tempFile = $dir.'registry_temp.reg';
file_put_contents($tempFile, $registryContents);

info('Executing registry import command');
exec(sprintf('regedit /s %s', $tempFile), $output, $error);
unlink($tempFile);
if($error) {
    error('Must run in administrator mode to modify Windows Registry');
}

info('Succesfully imported registry contents');