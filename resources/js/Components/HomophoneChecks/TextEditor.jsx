import React, { memo, useRef, useEffect } from 'react';
import { Type, Maximize2, Minimize2 } from 'lucide-react';

/**
 * TextEditor Component
 *
 * Rich text editor for typing practice with auto-save and zoom features.
 */
const TextEditor = memo(({
    value,
    onChange,
    placeholder = 'Start typing here...',
    disabled = false,
    autoSave = true,
    onSave,
    isZoomed = false,
    onToggleZoom,
    minHeight = '300px',
    maxHeight = '600px',
}) => {
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    // Auto-save functionality
    useEffect(() => {
        if (!autoSave || !onSave) return;

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        saveTimeoutRef.current = setTimeout(() => {
            if (value) {
                onSave(value);
            }
        }, 2000); // Save after 2 seconds of inactivity

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [value, autoSave, onSave]);

    // Auto-focus on mount
    useEffect(() => {
        if (textareaRef.current && !disabled) {
            textareaRef.current.focus();
        }
    }, [disabled]);

    const handleChange = (e) => {
        if (!disabled) {
            onChange?.(e.target.value);
        }
    };

    const handleKeyDown = (e) => {
        // Prevent form submission on Enter
        if (e.key === 'Enter' && e.ctrlKey && onSave) {
            e.preventDefault();
            onSave(value);
        }
    };

    return (
        <div className={`relative ${isZoomed ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Type size={16} />
                    <span>Text Editor</span>
                    {autoSave && (
                        <span className="text-xs text-gray-500">
                            (Auto-save enabled)
                        </span>
                    )}
                </div>

                {onToggleZoom && (
                    <button
                        onClick={onToggleZoom}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title={isZoomed ? 'Exit fullscreen' : 'Enter fullscreen'}
                        type="button"
                    >
                        {isZoomed ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                )}
            </div>

            {/* Editor */}
            <div className={`${isZoomed ? 'p-8 h-full overflow-auto' : ''}`}>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full p-4 border-0 focus:ring-0 resize-none font-mono text-base
                        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                        ${isZoomed ? 'h-full' : ''}
                    `}
                    style={{
                        minHeight: isZoomed ? '100%' : minHeight,
                        maxHeight: isZoomed ? 'none' : maxHeight,
                    }}
                    spellCheck={false}
                />
            </div>

            {/* Footer with word count */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div>
                        {value.trim() ? (
                            <>
                                <span className="font-medium">
                                    {value.trim().split(/\s+/).length} words
                                </span>
                                <span className="mx-2">•</span>
                                <span>{value.length} characters</span>
                            </>
                        ) : (
                            <span>0 words, 0 characters</span>
                        )}
                    </div>

                    {!disabled && (
                        <div className="text-gray-500">
                            Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to save
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

TextEditor.displayName = 'TextEditor';

export default TextEditor;
