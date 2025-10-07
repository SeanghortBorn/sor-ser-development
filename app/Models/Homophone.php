<?php

namespace App\Models;

class Homophone
{
    protected static $file = 'storage/app/homophones.json';

    public static function all()
    {
        if (!file_exists(storage_path('app/homophones.json'))) {
            return [];
        }
        $json = file_get_contents(storage_path('app/homophones.json'));
        return json_decode($json, true) ?? [];
    }

    public static function find($id)
    {
        $all = static::all();
        foreach ($all as $item) {
            if ($item['id'] == $id) return $item;
        }
        return null;
    }

    public static function create($data)
    {
        $all = static::all();
        $data['id'] = count($all) ? max(array_column($all, 'id')) + 1 : 1;
        $all[] = $data;
        file_put_contents(storage_path('app/homophones.json'), json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $data;
    }

    public static function update($id, $data)
    {
        $all = static::all();
        foreach ($all as &$item) {
            if ($item['id'] == $id) {
                $item = array_merge($item, $data);
                break;
            }
        }
        file_put_contents(storage_path('app/homophones.json'), json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public static function delete($id)
    {
        $all = static::all();
        $all = array_filter($all, fn($item) => $item['id'] != $id);
        file_put_contents(storage_path('app/homophones.json'), json_encode(array_values($all), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}
