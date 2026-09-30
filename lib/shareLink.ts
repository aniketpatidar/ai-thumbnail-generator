export function generateShareLink(thumbnailData: {
    videoType: string;
    styleMood: string;
    photoPlacement: string;
    prompt: string;
    thumbnails: Array<{ id: number; url: string; aspectRatio: string }>;
}): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
        videoType: thumbnailData.videoType,
        styleMood: thumbnailData.styleMood,
        photoPlacement: thumbnailData.photoPlacement,
        prompt: thumbnailData.prompt,
        thumbnailCount: thumbnailData.thumbnails.length.toString()
    });

    return `${baseUrl}?${params.toString()}`;
}
