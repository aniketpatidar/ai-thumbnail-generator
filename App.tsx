/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateThumbnail, regenerateThumbnail } from './services/geminiService';
import ThumbnailCard from './components/PolaroidCard';
import ImageUploader from './components/PolaroidUploader';
import EnhancedThumbnailCard from './components/EnhancedThumbnailCard';
import ProgressIndicator from './components/ProgressIndicator';
import LoginForm from './components/LoginForm';
import { DraggableCardBody, DraggableCardContainer } from './components/ui/draggable-card';
import JSZip from 'jszip';
import { createThumbnailAlbumPage } from './lib/albumUtils';
import { copyTextToClipboard, isClipboardSupported } from './lib/clipboardUtils';
import { enhancePromptWithOpenAI, generateShareLink } from './services/promptService';
import { isAuthenticated, logout } from './lib/auth';
import toast, { Toaster } from 'react-hot-toast';
import { LogOut } from 'lucide-react';

// Define the structure for a thumbnail object
interface Thumbnail {
    id: number;
    title: string;
    aspectRatio: '16:9' | '9:16';
    status: 'pending' | 'done' | 'error';
    url?: string;
    error?: string;
}

const primaryButtonClasses = "font-permanent-marker text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0";
const secondaryButtonClasses = "font-permanent-marker text-xl text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";
const questionnaireOptionClasses = "flex-1 text-center font-permanent-marker text-sm py-2 px-3 rounded-sm cursor-pointer transition-all duration-200 border-2 border-neutral-600 bg-neutral-800/50 hover:bg-neutral-700";
const questionnaireSelectedOptionClasses = "bg-yellow-400 border-yellow-400 shadow-[1px_1px_0px_1px_rgba(0,0,0,0.2)]";

const videoTypeOptions = ["Tutorial", "Vlog", "Gaming", "Review", "Unboxing"];
const styleMoodOptions = ["Bold", "Minimalist", "Dramatic", "Fun", "Vintage"];
const placementOptions = ["Left", "Center", "Right"];

function App() {
    const [authenticated, setAuthenticated] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [videoType, setVideoType] = useState('');
    const [styleMood, setStyleMood] = useState('');
    const [photoPlacement, setPhotoPlacement] = useState('');
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
    const [appState, setAppState] = useState<'idle' | 'generating' | 'results-shown'>('idle');
    const [isGeneratingAlbum, setIsGeneratingAlbum] = useState(false);
    const [prompt, setPrompt] = useState<string>('');
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
    const [clipboardSupported, setClipboardSupported] = useState(false);

    // Check authentication and clipboard support on mount
    useEffect(() => {
        setAuthenticated(isAuthenticated());
        setClipboardSupported(isClipboardSupported());
    }, []);

    const handleLoginSuccess = () => {
        setAuthenticated(true);
        toast.success('Welcome! You are now signed in.');
    };

    const handleLogout = () => {
        logout();
        setAuthenticated(false);
        setUploadedImage(null);
        setThumbnails([]);
        setVideoType('');
        setStyleMood('');
        setPhotoPlacement('');
        setPrompt('');
        setAppState('idle');
        setGenerationProgress({ current: 0, total: 0 });
        toast.success('You have been signed out.');
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
            setThumbnails([]); // Clear previous results
            toast.success('Image uploaded successfully!');
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateClick = async () => {
        if (!uploadedImage || !videoType || !styleMood || !photoPlacement || !prompt) {
            toast.error('Please fill in all fields before generating thumbnails');
            return;
        }

        setAppState('generating');
        setGenerationProgress({ current: 0, total: 6 });

        const variantsToGenerate = [
            { id: 1, title: '16:9', aspectRatio: '16:9' as const },
            { id: 2, title: '16:9', aspectRatio: '16:9' as const },
            { id: 3, title: '16:9', aspectRatio: '16:9' as const },
            { id: 4, title: '9:16', aspectRatio: '9:16' as const },
            { id: 5, title: '9:16', aspectRatio: '9:16' as const },
            { id: 6, title: '9:16', aspectRatio: '9:16' as const },
        ];

        const initialThumbnails: Thumbnail[] = variantsToGenerate.map(variant => ({
            ...variant,
            status: 'pending'
        }));
        setThumbnails(initialThumbnails);

        const userChoices = { videoType, styleMood, photoPlacement, prompt };

        // Generate thumbnails with progress tracking
        let completedCount = 0;
        const promises = initialThumbnails.map(async (thumb, index) => {
            try {
                const resultUrl = await generateThumbnail(uploadedImage, userChoices, thumb.aspectRatio);
                setThumbnails(prev => prev.map(t =>
                    t.id === thumb.id ? { ...t, status: 'done', url: resultUrl } : t
                ));
                completedCount++;
                setGenerationProgress({ current: completedCount, total: 6 });
                toast.success(`${thumb.title} generated successfully!`);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setThumbnails(prev => prev.map(t =>
                    t.id === thumb.id ? { ...t, status: 'error', error: errorMessage } : t
                ));
                completedCount++;
                setGenerationProgress({ current: completedCount, total: 6 });
                toast.error(`Failed to generate ${thumb.title}: ${errorMessage}`);
                console.error(`Failed to generate thumbnail for ${thumb.title} (ID: ${thumb.id}):`, err);
            }
        });

        await Promise.allSettled(promises);
        setAppState('results-shown');
        toast.success('All thumbnails generated! Check out your results below.');
    };

    const handleRegenerateThumbnail = async (thumbnailId: number) => {
        if (!uploadedImage) return;

        const thumbnail = thumbnails.find(t => t.id === thumbnailId);
        if (!thumbnail) return;

        const userChoices = { videoType, styleMood, photoPlacement, prompt };

        // Set thumbnail to pending
        setThumbnails(prev => prev.map(t =>
            t.id === thumbnailId ? { ...t, status: 'pending' } : t
        ));

        try {
            const resultUrl = await regenerateThumbnail(uploadedImage, userChoices, thumbnail.aspectRatio, thumbnailId);
            setThumbnails(prev => prev.map(t =>
                t.id === thumbnailId ? { ...t, status: 'done', url: resultUrl } : t
            ));
            toast.success(`${thumbnail.title} regenerated successfully!`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setThumbnails(prev => prev.map(t =>
                t.id === thumbnailId ? { ...t, status: 'error', error: errorMessage } : t
            ));
            toast.error(`Failed to regenerate ${thumbnail.title}: ${errorMessage}`);
        }
    };

    const handleReset = () => {
        setUploadedImage(null);
        setThumbnails([]);
        setVideoType('');
        setStyleMood('');
        setPhotoPlacement('');
        setPrompt('');
        setAppState('idle');
        setGenerationProgress({ current: 0, total: 0 });
        toast.success('Reset complete! Ready to create new thumbnails.');
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const successfulThumbs = thumbnails.filter(t => t.status === 'done' && t.url);

        if (successfulThumbs.length === 0) {
            toast.error("No images have been generated successfully to download.");
            return;
        }

        const loadingToast = toast.loading('Preparing ZIP file...');

        try {
            for (const thumb of successfulThumbs) {
                // Create an image element to load the image data
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                // Create a canvas to draw the image with the correct aspect ratio
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions based on aspect ratio
                if (thumb.aspectRatio === '16:9') {
                    canvas.width = 1280;  // Standard HD width
                    canvas.height = 720;   // Standard HD height (16:9)
                } else { // 9:16
                    canvas.width = 720;    // Standard portrait width
                    canvas.height = 1280;   // Standard portrait height (9:16)
                }
                
                // Load the image and draw it on the canvas
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        try {
                            // Draw the image to cover the entire canvas while maintaining aspect ratio
                            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    };
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = thumb.url!;
                });
                
                // Convert canvas to blob and add to zip
                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'));
                        }
                    }, 'image/jpeg', 0.95); // 0.95 quality for good compression/quality balance
                });
                
                // Add to zip with appropriate naming
                zip.file(`thumbnail-${thumb.id}-${thumb.aspectRatio}.jpg`, blob, { binary: true });
            }

            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "ai-thumbnails.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            toast.dismiss(loadingToast);
            toast.success('ZIP file downloaded successfully!');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to create ZIP file. Please try again.');
            console.error('ZIP creation failed:', error);
        }
    };

    const handleDownloadAlbum = async () => {
        const successfulThumbs = thumbnails.filter(t => t.status === 'done' && t.url);

        if (successfulThumbs.length === 0) {
            toast.error("No successfully generated images to create an album from.");
            return;
        }

        setIsGeneratingAlbum(true);
        const loadingToast = toast.loading('Creating album page...');

        try {
            const albumImageData = successfulThumbs.map(thumb => ({
                url: thumb.url!,
                aspectRatio: thumb.aspectRatio,
                title: thumb.title,
            }));

            const albumDataUrl = await createThumbnailAlbumPage(albumImageData);

            const link = document.createElement('a');
            link.href = albumDataUrl;
            link.download = 'ai-thumbnail-album.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.dismiss(loadingToast);
            toast.success('Album page downloaded successfully!');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Failed to create album page. Please try again.");
            console.error("Failed to create or download album page:", error);
        } finally {
            setIsGeneratingAlbum(false);
        }
    };


    const renderIdleState = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center gap-8 p-4"
        >
            <div className="flex items-center justify-center gap-4 w-full h-full">
                <div className="h-full">
                    <DraggableCardContainer>
                        <DraggableCardBody>
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <ImageUploader uploadedImage={uploadedImage} onImageUpload={handleImageUpload} />
                            </div>
                        </DraggableCardBody>
                    </DraggableCardContainer>
                </div>
                <div className="w-1/3 space-y-4 text-neutral-200">
                    <div className="p-6 flex flex-col items-center gap-4">
                        <p className="font-permanent-marker text-xl text-neutral-300">
                            Video Type?...
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {videoTypeOptions.map(opt => (
                                <button key={opt} onClick={() => setVideoType(opt)} className={`${questionnaireOptionClasses} ${videoType === opt ? questionnaireSelectedOptionClasses : ''}`}>{opt}</button>
                            ))}
                        </div>
                        <p className="font-permanent-marker text-xl text-neutral-300">
                            Style / Mood?...
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {styleMoodOptions.map(opt => (
                                <button key={opt} onClick={() => setStyleMood(opt)} className={`${questionnaireOptionClasses} ${styleMood === opt ? questionnaireSelectedOptionClasses : ''}`}>{opt}</button>
                            ))}
                        </div>
                        <p className="font-permanent-marker text-xl text-neutral-300">
                            Your Photo Placement?
                        </p>
                        <div className="flex gap-2">
                            {placementOptions.map(opt => (
                                <button key={opt} onClick={() => setPhotoPlacement(opt)} className={`${questionnaireOptionClasses} ${photoPlacement === opt ? questionnaireSelectedOptionClasses : ''}`}>{opt}</button>
                            ))}
                        </div>
                        <p className="font-permanent-marker text-xl text-neutral-300">
                            Describe the thumbnail you want...
                        </p>
                        <input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A vibrant, high-energy gaming thumbnail with neon lighting"
                            className="w-full bg-black/20 border border-neutral-600 rounded-md p-3 text-neutral-200 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>
            <div className="w-full flex items-center justify-center gap-4">
                <button
                    onClick={handleGenerateClick}
                    disabled={!uploadedImage || !videoType || !styleMood || !photoPlacement || !prompt || appState === 'generating'}
                    className={primaryButtonClasses}
                >
                    Generate Thumbnails
                </button>
            </div>
        </motion.div>
    );

    const renderGeneratingState = () => (
        <div className="w-full flex flex-col items-center justify-center gap-8 p-4">
            <ProgressIndicator
                current={generationProgress.current}
                total={generationProgress.total}
            />

            {/* Show thumbnails as they generate */}
            <div className="w-full max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thumbnails.map(thumb => (
                        <EnhancedThumbnailCard
                            key={thumb.id}
                            id={thumb.id}
                            title={thumb.title}
                            aspectRatio={thumb.aspectRatio}
                            status={thumb.status}
                            imageUrl={thumb.url}
                            error={thumb.error}
                            onRegenerate={handleRegenerateThumbnail}
                            userChoices={{ videoType, styleMood, photoPlacement, prompt }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderResultsState = () => {
        const landscapeThumbs = thumbnails.filter(t => t.aspectRatio === '16:9');
        const portraitThumbs = thumbnails.filter(t => t.aspectRatio === '9:16');
        const successfulThumbs = thumbnails.filter(t => t.status === 'done');

        return (
            <div className="w-full mx-auto flex flex-col items-center gap-8 mt-4 px-4">
                {/* Success Summary */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h2 className="text-2xl font-permanent-marker text-yellow-400 mb-2">
                        Generation Complete!
                    </h2>
                    <p className="text-neutral-400">
                        Successfully generated {successfulThumbs.length} of {thumbnails.length} thumbnails
                    </p>
                </motion.div>

                {/* Landscape Section */}
                <section className="w-full">
                    <h2 className="text-3xl font-permanent-marker text-neutral-200 mb-6 text-center">Landscape (16:9)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {landscapeThumbs.map(thumb => (
                            <EnhancedThumbnailCard
                                key={thumb.id}
                                id={thumb.id}
                                title={thumb.title}
                                aspectRatio={thumb.aspectRatio}
                                status={thumb.status}
                                imageUrl={thumb.url}
                                error={thumb.error}
                                onRegenerate={handleRegenerateThumbnail}
                                userChoices={{ videoType, styleMood, photoPlacement, prompt }}
                            />
                        ))}
                    </div>
                </section>

                 {/* Portrait Section */}
                 <section className="w-full">
                    <h2 className="text-3xl font-permanent-marker text-neutral-200 mb-6 text-center">Portrait (9:16)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {portraitThumbs.map(thumb => (
                            <EnhancedThumbnailCard
                                key={thumb.id}
                                id={thumb.id}
                                title={thumb.title}
                                aspectRatio={thumb.aspectRatio}
                                status={thumb.status}
                                imageUrl={thumb.url}
                                error={thumb.error}
                                onRegenerate={handleRegenerateThumbnail}
                                userChoices={{ videoType, styleMood, photoPlacement, prompt }}
                            />
                        ))}
                    </div>
                </section>

                <div className="h-20 flex flex-wrap items-center justify-center gap-6 mt-8">
                   <button onClick={handleReset} className={secondaryButtonClasses}>
                       Start Over
                   </button>
                   {successfulThumbs.length > 0 && (
                       <>
                           <button onClick={handleDownloadAll} className={primaryButtonClasses}>
                               Download All as ZIP
                           </button>
                           <button
                                onClick={handleDownloadAlbum}
                                className={primaryButtonClasses}
                                disabled={isGeneratingAlbum}
                           >
                               {isGeneratingAlbum ? 'Creating...' : 'Download Album Page'}
                           </button>
                       </>
                   )}
               </div>
            </div>
        );
    };

    // Show login form if not authenticated
    if (!authenticated) {
        return (
            <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-x-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
                <div className="z-10 w-full flex flex-col items-center justify-center">
                    <LoginForm onLoginSuccess={handleLoginSuccess} />
                </div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1f2937',
                            color: '#f3f4f6',
                            border: '1px solid #374151',
                        },
                        success: {
                            iconTheme: {
                                primary: '#fbbf24',
                                secondary: '#1f2937',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#1f2937',
                            },
                        },
                    }}
                />
            </main>
        );
    }

    // Show main app if authenticated
    return (
        <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-x-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>

            {/* Logout Button */}
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800/80 backdrop-blur-sm border border-neutral-600 rounded-md text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="font-permanent-marker text-sm">Logout</span>
                </button>
            </div>

            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1">
                <div className="text-center mb-10">
                    <h1 className="text-6xl md:text-8xl font-caveat font-bold text-neutral-100">AI Thumbnail Generator</h1>
                    <p className="font-permanent-marker text-neutral-300 mt-2 text-xl tracking-wide">Generate stunning thumbnails in seconds.</p>
                </div>

                {appState === 'idle' && renderIdleState()}
                {appState === 'generating' && renderGeneratingState()}
                {appState === 'results-shown' && renderResultsState()}
            </div>

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#f3f4f6',
                        border: '1px solid #374151',
                    },
                    success: {
                        iconTheme: {
                            primary: '#fbbf24',
                            secondary: '#1f2937',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#1f2937',
                        },
                    },
                }}
            />
        </main>
    );
}

export default App;
