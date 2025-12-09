<?php


namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;


class VersionStaging extends Command
{
protected $signature = 'version:staging {message?}';
protected $description = 'Create a STAGING version entry and append release note';


public function handle()
{
$message = $this->argument('message') ?? 'Staging update';
$fs = new Filesystem();


$pkgPath = base_path('package.json');
$vjsonPath = base_path('version.json');
$changelog = base_path('CHANGELOG.md');


if (! $fs->exists($pkgPath)) {
$this->error('package.json not found. Run npm init or add package.json to repo.');
return 1;
}


$pkg = json_decode($fs->get($pkgPath), true);
$ver = $pkg['version'] ?? '1.0.0';


// Staging prefix + date
$date = (new \DateTime('now', new \DateTimeZone('Asia/Phnom_Penh')))->format('Ymd');
$staging = 'STAGING-' . $ver . '.' . $date;


// write to version.json
$v = [];
if ($fs->exists($vjsonPath)) {
$v = json_decode($fs->get($vjsonPath), true);
}
$v['staging'] = $staging;
$fs->put($vjsonPath, json_encode($v, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));


// Append to CHANGELOG
$entry = "\n## ${staging} - ${date}\n- ${message}\n";
$fs->append($changelog, $entry);


$this->info("Set staging version: $staging");
return 0;
}
}