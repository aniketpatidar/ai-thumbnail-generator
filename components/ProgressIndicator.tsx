/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface ProgressIndicatorProps {
    current: number;
    total: number;
    message?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ current, total, message }) => {
    const percentage = Math.round((current / total) * 100);

    const steps = [
        'Enhancing your prompt...',
        'Generating landscape thumbnails...',
        'Creating portrait thumbnails...',
        'Finalizing your thumbnails...'
    ];

    const currentStep = Math.min(Math.floor((current / total) * steps.length), steps.length - 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto bg-neutral-900/80 backdrop-blur-sm rounded-lg p-6 border border-neutral-700"
        >
            <div className="text-center mb-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-3"
                >
                    <RefreshCw className="h-8 w-8 text-yellow-400" />
                </motion.div>
                <h3 className="font-permanent-marker text-xl text-neutral-200 mb-2">
                    Creating Your Thumbnails
                </h3>
                <p className="text-sm text-neutral-400">
                    {message || steps[currentStep]}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-800 rounded-full h-2 mb-4">
                <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            {/* Progress Text */}
            <div className="flex justify-between text-sm text-neutral-400">
                <span>{current} of {total}</span>
                <span>{percentage}%</span>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: total }, (_, i) => (
                    <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                            i < current ? 'bg-yellow-400' : 'bg-neutral-600'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default ProgressIndicator;
