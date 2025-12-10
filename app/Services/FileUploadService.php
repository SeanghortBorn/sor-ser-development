<?php

namespace App\Services;

use App\Models\File;
use App\Models\Audio;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileUploadService
{
    /**
     * Upload a new file and create File model
     *
     * @param UploadedFile $file
     * @param string $bucket
     * @param int|null $wordCount Optional word count (calculated elsewhere if provided)
     * @return File
     * @throws \Exception
     */
    public function uploadFile(UploadedFile $file, string $bucket = 'files', ?int $wordCount = null): File
    {
        if (!$file->isValid()) {
            throw new \Exception('The uploaded file is invalid.');
        }

        if ($file->getSize() === 0) {
            throw new \Exception('Uploaded file is empty.');
        }

        $fileModel = new File();
        $fileModel->title = $file->getClientOriginalName();
        $fileModel->file_path = $file->store("uploads/{$bucket}", 'public');
        $fileModel->file_size = $file->getSize();
        $fileModel->file_type = $file->getClientMimeType();
        $fileModel->word_count = $wordCount ?? 0;
        $fileModel->save();

        return $fileModel;
    }

    /**
     * Upload a new audio file and create Audio model
     *
     * @param UploadedFile $audio
     * @param string $bucket
     * @return Audio
     * @throws \Exception
     */
    public function uploadAudio(UploadedFile $audio, string $bucket = 'audios'): Audio
    {
        if (!$audio->isValid()) {
            throw new \Exception('The uploaded audio file is invalid.');
        }

        if ($audio->getSize() === 0) {
            throw new \Exception('Uploaded audio is empty.');
        }

        $audioModel = new Audio();
        $audioModel->title = $audio->getClientOriginalName();
        $audioModel->file_path = $audio->store("uploads/{$bucket}", 'public');
        $audioModel->file_size = $audio->getSize();
        $audioModel->duration = 0;
        $audioModel->save();

        return $audioModel;
    }

    /**
     * Replace an existing file or create a new one
     *
     * @param File|null $existingFile
     * @param UploadedFile $newFile
     * @param string $bucket
     * @param int|null $wordCount Optional word count
     * @return File
     * @throws \Exception
     */
    public function replaceFile(?File $existingFile, UploadedFile $newFile, string $bucket = 'files', ?int $wordCount = null): File
    {
        if ($existingFile) {
            // Delete old physical file from storage
            if (Storage::disk('public')->exists($existingFile->file_path)) {
                Storage::disk('public')->delete($existingFile->file_path);
            }

            // Update existing file record
            $storedPath = $newFile->store("uploads/{$bucket}", 'public');
            $existingFile->update([
                'title' => $newFile->getClientOriginalName(),
                'file_path' => $storedPath,
                'file_size' => $newFile->getSize(),
                'file_type' => $newFile->getClientMimeType(),
                'word_count' => $wordCount ?? 0,
            ]);

            return $existingFile;
        } else {
            // Create new file
            return $this->uploadFile($newFile, $bucket, $wordCount);
        }
    }

    /**
     * Replace an existing audio or create a new one
     *
     * @param Audio|null $existingAudio
     * @param UploadedFile $newAudio
     * @param string $bucket
     * @return Audio
     * @throws \Exception
     */
    public function replaceAudio(?Audio $existingAudio, UploadedFile $newAudio, string $bucket = 'audios'): Audio
    {
        if ($existingAudio) {
            // Delete old physical audio from storage
            if (Storage::disk('public')->exists($existingAudio->file_path)) {
                Storage::disk('public')->delete($existingAudio->file_path);
            }

            // Update existing audio record
            $storedPath = $newAudio->store("uploads/{$bucket}", 'public');
            $existingAudio->update([
                'title' => $newAudio->getClientOriginalName(),
                'file_path' => $storedPath,
                'file_size' => $newAudio->getSize(),
                'duration' => 0,
            ]);

            return $existingAudio;
        } else {
            // Create new audio
            return $this->uploadAudio($newAudio, $bucket);
        }
    }

    /**
     * Delete a file from storage
     *
     * @param string $path
     * @return bool
     */
    public function deleteFromStorage(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }
}
