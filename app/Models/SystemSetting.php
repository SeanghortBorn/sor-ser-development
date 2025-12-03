<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'description'];

    /**
     * Get setting value with proper type casting
     */
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        // Type cast based on type field
        switch ($setting->type) {
            case 'integer':
                return (int) $setting->value;
            case 'boolean':
                return filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
            case 'json':
                return json_decode($setting->value, true);
            default:
                return $setting->value;
        }
    }

    /**
     * Set setting value
     */
    public static function set($key, $value, $type = 'string')
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : $value,
                'type' => $type,
            ]
        );
    }
}