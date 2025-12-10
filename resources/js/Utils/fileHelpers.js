/**
 * Resolve file URL from various media object formats
 *
 * @param {string|object} media - The media data (can be string, object with file_path, etc.)
 * @param {string} bucket - The storage bucket name (e.g., 'files', 'audios')
 * @returns {string|null} - The resolved public URL or null
 */
export const resolveFileUrl = (media, bucket) => {
    if (!media) return null;

    // If it's already a full URL, return it
    if (typeof media === "string") {
        if (media.startsWith("http://") || media.startsWith("https://")) {
            return media;
        }
        if (media.startsWith("/storage/")) {
            return media;
        }
        // Otherwise treat it as just a filename
        return `/storage/uploads/${bucket}/${media}`;
    }

    // Handle object with file_path
    if (media.file_path) {
        const filePath = String(media.file_path);

        // If it starts with http, return as is
        if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
            return filePath;
        }

        // If it already has /storage/, return as is
        if (filePath.startsWith("/storage/")) {
            return filePath;
        }

        // If it starts with storage/, add leading slash
        if (filePath.startsWith("storage/")) {
            return `/${filePath}`;
        }

        // If it starts with uploads/, prepend /storage/
        if (filePath.startsWith("uploads/")) {
            return `/storage/${filePath}`;
        }

        // If it starts with public/, convert to /storage/
        if (filePath.startsWith("public/")) {
            return `/storage/${filePath.replace(/^public\//, "")}`;
        }

        // Default: assume it's just a filename
        return `/storage/uploads/${bucket}/${filePath}`;
    }

    // Fallback to other properties
    if (media.url) return media.url;
    if (media.path) {
        const p = media.path.replace(/^public\//, "");
        return media.path.startsWith("http") || media.path.startsWith("/")
            ? media.path
            : `/storage/${p}`;
    }
    if (media.filename) return `/storage/uploads/${bucket}/${media.filename}`;
    if (media.name) return `/storage/uploads/${bucket}/${media.name}`;

    return null;
};

/**
 * Get file extension from filename
 *
 * @param {string} filename - The filename
 * @returns {string} - The lowercase file extension (without dot)
 */
export const getFileExtension = (filename) => {
    if (!filename) return "";
    return filename.split(".").pop().toLowerCase();
};

/**
 * Check if a file is an audio file based on extension
 *
 * @param {string} filename - The filename
 * @returns {boolean} - True if audio file
 */
export const isAudioFile = (filename) => {
    const audioExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'mp4'];
    const ext = getFileExtension(filename);
    return audioExtensions.includes(ext);
};

/**
 * Check if a file is a text file based on extension
 *
 * @param {string} filename - The filename
 * @returns {boolean} - True if text file
 */
export const isTextFile = (filename) => {
    const ext = getFileExtension(filename);
    return ext === 'txt';
};

/**
 * Check if a file is a PDF based on extension
 *
 * @param {string} filename - The filename
 * @returns {boolean} - True if PDF file
 */
export const isPdfFile = (filename) => {
    const ext = getFileExtension(filename);
    return ext === 'pdf';
};

/**
 * Check if a file is a document file based on extension
 *
 * @param {string} filename - The filename
 * @returns {boolean} - True if document file (doc, docx)
 */
export const isDocumentFile = (filename) => {
    const docExtensions = ['doc', 'docx'];
    const ext = getFileExtension(filename);
    return docExtensions.includes(ext);
};
