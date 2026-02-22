'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './ImageGallery.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

function getImageSrc(url) {
    if (!url) return null;
    return url;
}

export default function ImageGallery({ images = [], productName = '' }) {
    const [active, setActive] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    if (!images.length) return null;

    const activeImg = getImageSrc(images[active]);

    return (
        <>
            <div className={styles.gallery}>
                {/* Main image */}
                <div className={styles.main} onClick={() => setLightbox(true)} title="Click to enlarge">
                    <Image
                        src={activeImg}
                        alt={`${productName} photo ${active + 1}`}
                        fill
                        className={styles.mainImage}
                        sizes="(max-width: 768px) 100vw, 55vw"
                        priority
                    />
                    <div className={styles.zoomHint}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
                        </svg>
                        Tap to zoom
                    </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className={styles.thumbs}>
                        {images.map((img, i) => {
                            const src = getImageSrc(img);
                            return (
                                <button
                                    key={i}
                                    className={`${styles.thumb} ${active === i ? styles.thumbActive : ''}`}
                                    onClick={() => setActive(i)}
                                    aria-label={`View image ${i + 1}`}
                                >
                                    <Image
                                        src={src}
                                        alt={`Thumbnail ${i + 1}`}
                                        fill
                                        className={styles.thumbImage}
                                        sizes="80px"
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className={styles.lightbox} onClick={() => setLightbox(false)}>
                    <button className={styles.closeBtn} onClick={() => setLightbox(false)} aria-label="Close">✕</button>
                    <div className={styles.lightboxImg} onClick={e => e.stopPropagation()}>
                        <Image
                            src={activeImg}
                            alt={productName}
                            fill
                            className={styles.lightboxImage}
                            sizes="100vw"
                        />
                        {/* Prev / Next */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className={`${styles.navBtn} ${styles.prevBtn}`}
                                    onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + images.length) % images.length); }}
                                >‹</button>
                                <button
                                    className={`${styles.navBtn} ${styles.nextBtn}`}
                                    onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % images.length); }}
                                >›</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
