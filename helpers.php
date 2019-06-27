<?php

const INI = __DIR__.DIRECTORY_SEPARATOR.'settings.ini';

function ini(string $key, $default = null)
{
    global $iniContents;
    if(!$iniContents) {
        if(!is_file(INI)) {
            error('Ini file [%s] not found', INI);
        }
        $iniContents = [];
        foreach(parse_ini_file(INI) as $iniKey => $value) {
            $iniContents[strtolower($iniKey)] = $value;
        }
    }

    return $iniContents[strtolower($key)] ?? $default;
}

function copyExampleIniFile()
{
    if(!is_file(INI)) {
        info('Copying ini example file');
        copy(sprintf('%s.example', INI), INI);
    }
    info('Ini example file already exists');
}

function dd()
{
    foreach(func_get_args() as $value) {
        var_dump($value);
    }

    if(defined('FROM_PROTOCOL')) {
        sleep(10);
    }
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

function info($text, ...$args)
{
    echo sprintf($text, ...$args)."\n";
}

function error($text, ...$args)
{
    info($text, ...$args);
    if(defined('FROM_PROTOCOL')) {
        info('Quiting after 10 seconds');
        sleep(10);
    } else {
        info('Quiting...');
    }
    exit;
}
