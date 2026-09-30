import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, KeyRound, X } from 'lucide-react';

const AI_STUDIO_KEY_URL = 'https://aistudio.google.com/apikey';

interface ApiKeyDialogProps {
    isOpen: boolean;
    currentKey: string | null;
    onSave: (apiKey: string) => void;
    onRemove: () => void;
    onClose: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ isOpen, currentKey, onSave, onRemove, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(apiKey.trim());
        setApiKey('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg p-6"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="api-key-title"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <h2 id="api-key-title" className="flex items-center gap-2 text-xl font-semibold text-neutral-100">
                                <KeyRound className="h-5 w-5 text-yellow-400" />
                                Gemini API key
                            </h2>
                            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200" aria-label="Close">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-sm text-neutral-400 mb-4">
                            Thumbnails are generated with your key. It stays in this browser and is cleared when you log out.
                        </p>
                        <a
                            href={AI_STUDIO_KEY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm text-yellow-400 hover:text-yellow-300 mb-5"
                        >
                            Get a key from Google AI Studio
                        </a>

                        {currentKey && (
                            <div className="flex items-center justify-between mb-4 p-3 bg-neutral-800 rounded-md">
                                <span className="text-sm text-neutral-300">
                                    Key ending in <span className="font-mono">{currentKey.slice(-4)}</span>
                                </span>
                                <button onClick={onRemove} className="text-sm text-red-400 hover:text-red-300">
                                    Remove
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={currentKey ? 'Paste a new key' : 'Paste your key'}
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="w-full pl-3 pr-12 py-3 bg-neutral-800 border border-neutral-600 rounded-md text-neutral-200 placeholder-neutral-400 font-mono text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200"
                                    aria-label={showKey ? 'Hide key' : 'Show key'}
                                >
                                    {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!apiKey.trim()}
                                className="w-full font-permanent-marker text-lg text-black bg-yellow-400 py-2 px-6 rounded-sm hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ApiKeyDialog;
