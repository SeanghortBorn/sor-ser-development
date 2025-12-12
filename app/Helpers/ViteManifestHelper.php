<?php
/**
 * Vite Manifest Helper
 * 
 * This helper reads directly from the Vite manifest.json and generates
 * proper asset tags. Use this as a workaround when @vite() directive fails.
 * 
 * Installation:
 * 1. Place this file in: app/Helpers/ViteManifestHelper.php
 * 2. Register in app/Providers/AppServiceProvider.php boot() method:
 *    require_once app_path('Helpers/ViteManifestHelper.php');
 * 
 * Usage in Blade:
 * {!! \App\Helpers\ViteManifestHelper::assets('resources/js/app.jsx') !!}
 */

namespace App\Helpers;

class ViteManifestHelper
{
    protected static $manifest = null;
    protected static $loadedCss = [];
    
    /**
     * Load and cache the manifest
     */
    protected static function loadManifest()
    {
        if (self::$manifest !== null) {
            return self::$manifest;
        }
        
        $manifestPath = public_path('build/manifest.json');
        
        if (!file_exists($manifestPath)) {
            throw new \Exception("Vite manifest not found at: {$manifestPath}. Run 'npm run build'");
        }
        
        self::$manifest = json_decode(file_get_contents($manifestPath), true);
        
        return self::$manifest;
    }
    
    /**
     * Generate asset tags for a given entry point
     * 
     * @param string $entry Entry point (e.g., 'resources/js/app.jsx')
     * @return string HTML with link and script tags
     */
    public static function assets($entry)
    {
        $manifest = self::loadManifest();
        
        if (!isset($manifest[$entry])) {
            throw new \Exception("Entry '{$entry}' not found in Vite manifest");
        }
        
        $html = '';
        $data = $manifest[$entry];
        
        // Add CSS from entry
        if (isset($data['css'])) {
            foreach ($data['css'] as $css) {
                if (!in_array($css, self::$loadedCss)) {
                    $html .= sprintf(
                        '<link rel="stylesheet" href="%s">%s',
                        asset('build/' . $css),
                        "\n        "
                    );
                    self::$loadedCss[] = $css;
                }
            }
        }
        
        // Add CSS from imported chunks
        if (isset($data['imports'])) {
            foreach ($data['imports'] as $import) {
                if (isset($manifest[$import]['css'])) {
                    foreach ($manifest[$import]['css'] as $css) {
                        if (!in_array($css, self::$loadedCss)) {
                            $html .= sprintf(
                                '<link rel="stylesheet" href="%s">%s',
                                asset('build/' . $css),
                                "\n        "
                            );
                            self::$loadedCss[] = $css;
                        }
                    }
                }
            }
        }
        
        // Preload module imports
        if (isset($data['imports'])) {
            foreach ($data['imports'] as $import) {
                if (isset($manifest[$import]['file'])) {
                    $html .= sprintf(
                        '<link rel="modulepreload" href="%s">%s',
                        asset('build/' . $manifest[$import]['file']),
                        "\n        "
                    );
                }
            }
        }
        
        // Add main JS file
        $html .= sprintf(
            '<script type="module" src="%s"></script>',
            asset('build/' . $data['file'])
        );
        
        return $html;
    }
    
    /**
     * Get asset URL for a specific file
     * 
     * @param string $entry Entry point
     * @return string Asset URL
     */
    public static function url($entry)
    {
        $manifest = self::loadManifest();
        
        if (!isset($manifest[$entry])) {
            throw new \Exception("Entry '{$entry}' not found in Vite manifest");
        }
        
        return asset('build/' . $manifest[$entry]['file']);
    }
    
    /**
     * Check if running in development mode (hot file exists)
     * 
     * @return bool
     */
    public static function isRunningHot()
    {
        return file_exists(public_path('hot'));
    }
    
    /**
     * Get hot server URL if running
     * 
     * @return string|null
     */
    public static function hotUrl()
    {
        if (!self::isRunningHot()) {
            return null;
        }
        
        return trim(file_get_contents(public_path('hot')));
    }
}
