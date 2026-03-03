'use client';
import { useState } from 'react';
import styles from './ImageGallery.module.css';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80';

function getImageSrc(url) {
    if (!url) return FALLBACK;
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
                    <img
                        src={activeImg}
                        alt={`${productName} photo ${active + 1}`}
                        className={styles.mainImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.target.src = FALLBACK; }}
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
                                    <img
                                        src={src}
                                        alt={`Thumbnail ${i + 1}`}
                                        className={styles.thumbImage}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        onError={(e) => { e.target.src = FALLBACK; }}
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
                        <img
                            src={activeImg}
                            alt={productName}
                            className={styles.lightboxImage}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                            onError={(e) => { e.target.src = FALLBACK; }}
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
