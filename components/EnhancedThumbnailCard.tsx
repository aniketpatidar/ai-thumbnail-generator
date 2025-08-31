/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Share2, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { copyImageToClipboard, copyTextToClipboard, downloadImage } from '../lib/clipboardUtils';
import { generateShareLink } from '../services/promptService';
import { cn } from '../lib/utils';

interface EnhancedThumbnailCardProps {
    id: number;
    title: string;
    aspectRatio: '16:9' | '9:16';
    status: 'pending' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
    onRegenerate?: (id: number) => void;
    userChoices?: {
        videoType: string;
        styleMood: string;
        photoPlacement: string;
        prompt: string;
    };
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <RefreshCw className="animate-spin h-8 w-8 text-neutral-400" />
    </div>
);

const ErrorDisplay = ({ error }: { error?: string }) => {
    const isQuotaError = error?.includes('quota') || error?.includes('429') || error?.includes('RESOURCE_EXHAUSTED');

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-red-400 mb-3">
                <AlertTriangle className="h-10 w-10" />
            </div>
            <h3 className="text-sm font-medium text-red-300 mb-2">
                {isQuotaError ? 'API Quota Exceeded' : 'Generation Failed'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
                {isQuotaError
                    ? 'The API quota has been exceeded. Please try again later or contact support.'
                    : error || 'An unexpected error occurred while generating this thumbnail.'
                }
            </p>
            {isQuotaError && (
                <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-300">
                    <p>This is a demo application with limited API usage.</p>
                </div>
            )}
        </div>
    );
};

const EnhancedThumbnailCard: React.FC<EnhancedThumbnailCardProps> = ({
    id,
    title,
    aspectRatio,
    status,
    imageUrl,
    error,
    onRegenerate,
    userChoices
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleCopyToClipboard = async () => {
        if (!imageUrl) return;

        const success = await copyImageToClipboard(imageUrl);
        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (!imageUrl || !userChoices) return;

        setIsSharing(true);
        try {
            const shareData = {
                title: 'AI Generated Thumbnail',
                text: `Check out this ${userChoices.videoType} thumbnail I created with AI!`,
                url: generateShareLink({
                    ...userChoices,
                    thumbnails: [{ id, url: imageUrl, aspectRatio }]
                })
            };

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy link to clipboard
                await copyTextToClipboard(shareData.url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
        } catch (error) {
            console.error('Share failed:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownload = async () => {
        if (!imageUrl) return;

        setIsDownloading(true);
        try {
            const filename = `thumbnail-${title.replace(' ', '-')}-${aspectRatio}.jpg`;
            downloadImage(imageUrl, filename);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleRegenerate = () => {
        if (onRegenerate) {
            onRegenerate(id);
        }
    };

    const aspectRatioClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (id - 1) * 0.1 }}
            className="relative group"
        >
            <div className={cn(
                "bg-neutral-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300",
                aspectRatioClass,
                "hover:shadow-xl hover:scale-105"
            )}>
                {/* Status Overlay */}
                {status === 'pending' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <LoadingSpinner />
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                        <ErrorDisplay error={error} />
                    </div>
                )}

                {/* Image */}
                {status === 'done' && imageUrl && (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Action Buttons */}
                {status === 'done' && imageUrl && (
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        {/* Copy Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopyToClipboard}
                            className="p-2 bg-black/70 rounded-full text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                            title="Copy to clipboard"
                        >
                            {isCopied ? (
                                <Check className="h-4 w-4 text-green-400" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </motion.button>

                        {/* Download Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="p-2 bg-black/70 rounded-full text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors disabled:opacity-50"
                            title="Download image"
                        >
                            <Download className="h-4 w-4" />
                        </motion.button>

                        {/* Share Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShare}
                            disabled={isSharing}
                            className="p-2 bg-black/70 rounded-full text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors disabled:opacity-50"
                            title="Share thumbnail"
                        >
                            <Share2 className="h-4 w-4" />
                        </motion.button>

                        {/* Regenerate Button */}
                        {onRegenerate && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRegenerate}
                                className="p-2 bg-black/70 rounded-full text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                                title="Regenerate thumbnail"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </motion.button>
                        )}
                    </div>
                )}

                {/* Regenerate Button for Error State */}
                {status === 'error' && onRegenerate && (
                    <div className="absolute top-2 right-2 z-20">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRegenerate}
                            className="p-2 bg-red-600/80 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                            title="Retry generation"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </motion.button>
                    </div>
                )}

                {/* Aspect Ratio Badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {aspectRatio}
                </div>
            </div>

            {/* Title */}
            <div className="mt-2 text-center">
                <p className="font-permanent-marker text-sm text-neutral-300 truncate">
                    {title}
                </p>
            </div>
        </motion.div>
    );
};

export default EnhancedThumbnailCard;
