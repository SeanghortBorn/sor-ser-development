<?php


namespace App\Console\Commands;


use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;


class VersionLocal extends Command
{
protected $signature = 'version:local {message?}';
protected $description = 'Create a LOCAL version entry and append release note';


public function handle()
{
$message = $this->argument('message') ?? 'Local update';
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


// Local prefix + date
$date = (new \DateTime('now', new \DateTimeZone('Asia/Phnom_Penh')))->format('Ymd');
$local = 'LOCAL-' . $ver . '.' . $date;


// write to version.json
$v = [];
if ($fs->exists($vjsonPath)) {
$v = json_decode($fs->get($vjsonPath), true);
}
$v['local'] = $local;
$fs->put($vjsonPath, json_encode($v, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));


// Append to CHANGELOG
$entry = "\n## ${local} - ${date}\n- ${message}\n";
$fs->append($changelog, $entry);


$this->info("Set local version: $local");
return 0;
}
}