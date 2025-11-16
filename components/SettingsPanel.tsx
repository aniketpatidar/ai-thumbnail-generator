



import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, RotateCcw } from 'lucide-react';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    settings: {
        useEnhancedPrompts: boolean;
        generationCount: number;
        quality: 'standard' | 'high';
        autoSave: boolean;
    };
    onSettingsChange: (settings: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onClose,
    settings,
    onSettingsChange
}) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleSave = () => {
        onSettingsChange(localSettings);
        onClose();
    };

    const handleReset = () => {
        setLocalSettings(settings);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-yellow-400" />
                                <h2 className="font-permanent-marker text-xl text-neutral-200">
                                    Settings
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-neutral-800 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localSettings.useEnhancedPrompts}
                                        onChange={(e) => setLocalSettings(prev => ({
                                            ...prev,
                                            useEnhancedPrompts: e.target.checked
                                        }))}
                                        className="w-4 h-4 text-yellow-400 bg-neutral-800 border-neutral-600 rounded focus:ring-yellow-400 focus:ring-2"
                                    />
                                    <span className="text-neutral-200">Use enhanced prompt generation</span>
                                </label>
                                <p className="text-sm text-neutral-400 mt-1 ml-7">
                                    Uses Gemini to enhance your prompts for better creative results.
                                </p>
                            </div>

                            
                            <div>
                                <label className="block text-neutral-200 mb-2">
                                    Number of thumbnails to generate
                                </label>
                                <select
                                    value={localSettings.generationCount}
                                    onChange={(e) => setLocalSettings(prev => ({
                                        ...prev,
                                        generationCount: parseInt(e.target.value)
                                    }))}
                                    className="w-full bg-neutral-800 border border-neutral-600 rounded-md p-2 text-neutral-200 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                >
                                    <option value={4}>4 thumbnails (2 landscape, 2 portrait)</option>
                                    <option value={6}>6 thumbnails (3 landscape, 3 portrait)</option>
                                    <option value={8}>8 thumbnails (4 landscape, 4 portrait)</option>
                                </select>
                            </div>

                            
                            <div>
                                <label className="block text-neutral-200 mb-2">
                                    Generation Quality
                                </label>
                                <select
                                    value={localSettings.quality}
                                    onChange={(e) => setLocalSettings(prev => ({
                                        ...prev,
                                        quality: e.target.value as 'standard' | 'high'
                                    }))}
                                    className="w-full bg-neutral-800 border border-neutral-600 rounded-md p-2 text-neutral-200 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                >
                                    <option value="standard">Standard (faster, lower cost)</option>
                                    <option value="high">High Quality (slower, higher cost)</option>
                                </select>
                            </div>

                            
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localSettings.autoSave}
                                        onChange={(e) => setLocalSettings(prev => ({
                                            ...prev,
                                            autoSave: e.target.checked
                                        }))}
                                        className="w-4 h-4 text-yellow-400 bg-neutral-800 border-neutral-600 rounded focus:ring-yellow-400 focus:ring-2"
                                    />
                                    <span className="text-neutral-200">Auto-save generated thumbnails</span>
                                </label>
                                <p className="text-sm text-neutral-400 mt-1 ml-7">
                                    Automatically save thumbnails to your device.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 transition-colors ml-auto"
                            >
                                <Save className="h-4 w-4" />
                                Save Settings
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsPanel;
