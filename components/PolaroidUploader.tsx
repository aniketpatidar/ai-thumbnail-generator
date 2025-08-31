/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, DragEvent, ChangeEvent } from 'react';
import { cn } from '../lib/utils';
import PolaroidCard from './PolaroidCard';

interface ImageUploaderProps {
    uploadedImage: string | null;
    onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ uploadedImage, onImageUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleDragEvents = (e: DragEvent<HTMLLabelElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (e.dataTransfer.files[0].type.startsWith('image/')) {
                onImageUpload(e.dataTransfer.files[0]);
            } else {
                console.warn("Please drop an image file.");
            }
        }
    };

    return (
        <label
            htmlFor="file-upload"
            className="cursor-pointer group transform hover:scale-105 transition-transform duration-300 w-full"
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className={cn(
                "w-full aspect-square rounded-md flex items-center justify-center border-2 border-dashed border-neutral-600 transition-colors relative",
                isDragging && "border-yellow-400 bg-neutral-800",
                { 'p-0 border-none': uploadedImage }
            )}>
                {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded preview" className="w-full h-full object-cover rounded-md" />
                ) : (
                    <div className="text-center text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="mt-2 font-permanent-marker text-xl">Upload Photo</p>
                    </div>
                )}
            </div>
            <div className="text-center px-2 py-4 mt-4">
                <p className="font-permanent-marker text-2xl truncate text-white">
                    {uploadedImage ? "Different Photo" : "Click or Drag & Drop"}
                </p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </label>
    );
};

export default ImageUploader;
