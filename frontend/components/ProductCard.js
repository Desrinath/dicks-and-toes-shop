'use client';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

function getImageSrc(url) {
    if (!url) return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80';
    // If it's an array (e.g. images field passed by mistake), take first element
    if (Array.isArray(url)) return url[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80';
    return url;
}

// Safely parse JSONB fields that may come as strings, arrays or null
function safeArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'string') {
        try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed.map(String) : []; }
        catch { return []; }
    }
    return [];
}

export default function ProductCard({ product }) {
    const imageSrc = getImageSrc(product.header_image);
    const price = typeof product.price === 'number'
        ? `₹${product.price.toLocaleString('en-IN')}`
        : product.price;
    const sizes = safeArray(product.sizes);

    return (
        <Link href={`/product/${product.id}`} className={styles.card}>
            <div className={styles.imageWrap}>
                <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className={styles.overlay} />
                <div className={styles.hoverInfo}>
                    <span className={styles.viewText}>View Details</span>
                </div>
                {product.category && (
                    <span className={styles.categoryBadge}>{product.category}</span>
                )}
            </div>
            <div className={styles.info}>
                <h3 className={styles.name}>{product.name}</h3>
                <div className={styles.bottom}>
                    <span className={styles.price}>{price}</span>
                    {sizes.length > 0 && (
                        <div className={styles.sizes}>
                            {sizes.slice(0, 3).map(s => (
                                <span key={s} className={styles.size}>{s}</span>
                            ))}
                            {sizes.length > 3 && (
                                <span className={styles.size}>+{sizes.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
