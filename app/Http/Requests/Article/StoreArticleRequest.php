<?php

namespace App\Http\Requests\Article;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|max:255|min:2',
            // File validation
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:txt,pdf,doc,docx',
                'mimetypes:text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            // Audio validation - including video/mp4 for m4a files
            'audio' => [
                'required',
                'file',
                'max:20480',
                'mimes:mp3,wav,m4a,ogg,aac,mp4',
                'mimetypes:audio/mpeg,audio/wav,audio/wave,audio/x-wav,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,audio/ogg,video/mp4,application/octet-stream'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'File is required.',
            'file.max' => 'File size must not exceed 10 MB.',
            'file.mimes' => 'File must be a txt, pdf, doc, or docx file.',
            'file.mimetypes' => 'Invalid file type.',
            'audio.required' => 'Audio is required.',
            'audio.max' => 'Audio file size must not exceed 20 MB.',
            'audio.mimes' => 'Audio must be mp3, wav, m4a, aac, or ogg format.',
            'audio.mimetypes' => 'Invalid audio file type.',
            'title.required' => 'Title is required.',
            'title.min' => 'Title must be at least 2 characters.',
            'title.max' => 'Title must not exceed 255 characters.',
        ];
    }
}
