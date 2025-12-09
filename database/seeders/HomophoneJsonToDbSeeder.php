<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Homophone;
use App\Models\HomophoneVariant;

class HomophoneJsonToDbSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Migrates homophone data from JSON file to database tables.
     */
    public function run(): void
    {
        $jsonFile = storage_path('app/homophones.json');

        if (!file_exists($jsonFile)) {
            $this->command->warn('⚠️  No homophones.json found at: ' . $jsonFile);
            $this->command->info('ℹ️  Skipping migration. JSON file will be backed up when it exists.');
            return;
        }

        $this->command->info('📖 Reading homophones.json...');
        $json = file_get_contents($jsonFile);
        $data = json_decode($json, true);

        if (!is_array($data) || empty($data)) {
            $this->command->error('❌ Invalid or empty JSON data');
            return;
        }

        $this->command->info("📊 Found " . count($data) . " homophone entries");
        $this->command->info('🔄 Starting migration...');

        DB::transaction(function () use ($data, $jsonFile) {
            $bar = $this->command->getOutput()->createProgressBar(count($data));
            $bar->start();

            foreach ($data as $item) {
                // Create main homophone record
                $homophone = Homophone::create([
                    'word' => $item['word'] ?? '',
                    'definition' => $item['definition'] ?? null,
                    'pronunciation' => $item['pronunciation'] ?? null,
                    'explanation' => $item['explanation'] ?? null,
                    'examples' => isset($item['examples']) && is_array($item['examples'])
                        ? json_encode($item['examples'])
                        : null,
                    'is_active' => $item['is_active'] ?? true,
                ]);

                // Create variant records
                if (isset($item['homophone']) && is_array($item['homophone'])) {
                    foreach ($item['homophone'] as $index => $variant) {
                        HomophoneVariant::create([
                            'homophone_id' => $homophone->id,
                            'variant_word' => $variant,
                            'sort_order' => $index,
                        ]);
                    }
                }

                $bar->advance();
            }

            $bar->finish();
            $this->command->newLine();

            // Backup JSON file
            $backupFile = storage_path('app/homophones_backup_' . date('Ymd_His') . '.json');
            copy($jsonFile, $backupFile);

            $this->command->info('✅ Migration complete!');
            $this->command->info('💾 Original JSON backed up to: ' . basename($backupFile));
            $this->command->warn('⚠️  Keep the backup file for rollback safety');
        });

        $homophoneCount = Homophone::count();
        $variantCount = HomophoneVariant::count();

        $this->command->newLine();
        $this->command->info("📈 Summary:");
        $this->command->info("   • Homophones migrated: {$homophoneCount}");
        $this->command->info("   • Variants created: {$variantCount}");
    }
}
