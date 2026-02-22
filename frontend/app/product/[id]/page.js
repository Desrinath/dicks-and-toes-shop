'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageGallery from '@/components/ImageGallery';
import SizeChart from '@/components/SizeChart';
import WhatsAppButton from '@/components/WhatsAppButton';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999');

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/products/${id}`).then(r => {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            }),
            fetch(`${API_URL}/api/config`).then(r => r.json()).catch(() => ({})),
        ])
            .then(([productData, config]) => {
                setProduct(productData);
                if (config.whatsappNumber) setWhatsappNumber(config.whatsappNumber);
                if (productData.sizes?.length) setSelectedSize(productData.sizes[0]);
                setLoading(false);
            })
            .catch(() => { setError(true); setLoading(false); });
    }, [id]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className={styles.loadingPage}>
                    <div className="spinner" />
                </div>
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Navbar />
                <div className={styles.errorPage}>
                    <h2>Product not found</h2>
                    <p>This piece may have already found its new home.</p>
                    <button className="btn btn-primary" onClick={() => router.push('/collections')}>
                        Back to Collections
                    </button>
                </div>
            </>
        );
    }

    const price = typeof product.price === 'number'
        ? `₹${product.price.toLocaleString('en-IN')}`
        : product.price;

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    {/* Breadcrumb */}
                    <nav className={styles.breadcrumb}>
                        <a href="/">Home</a>
                        <span>›</span>
                        <a href="/collections">Collections</a>
                        <span>›</span>
                        <span>{product.name}</span>
                    </nav>

                    <div className={styles.layout}>
                        {/* LEFT: Gallery */}
                        <div className={styles.galleryCol}>
                            <ImageGallery images={product.images || []} productName={product.name} />
                        </div>

                        {/* RIGHT: Info */}
                        <div className={styles.infoCol}>
                            {/* Category badge */}
                            {product.category && (
                                <span className="badge">{product.category}</span>
                            )}

                            <h1 className={styles.name}>{product.name}</h1>

                            <div className={styles.priceRow}>
                                <span className={styles.price}>{price}</span>
                                {product.color && (
                                    <span className={styles.colorPill}>
                                        <span className={styles.colorDot} style={{ background: '#C0C0C0' }} />
                                        {product.color}
                                    </span>
                                )}
                            </div>

                            {/* Size selector */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className={styles.sizeSelector}>
                                    <div className={styles.sizeLabelRow}>
                                        <span className={styles.sizeLabel}>Select Size</span>
                                        {selectedSize && <span className={styles.selected}>{selectedSize}</span>}
                                    </div>
                                    <div className={styles.sizePills}>
                                        {product.sizes.map(size => (
                                            <button
                                                key={size}
                                                className={`${styles.sizePill} ${selectedSize === size ? styles.sizePillActive : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="divider" />

                            {/* Description */}
                            {product.description && (
                                <div className={styles.desc}>
                                    <h3 className={styles.sectionTitle}>About This Piece</h3>
                                    <p>{product.description}</p>
                                </div>
                            )}

                            {/* Size Chart & Measurements */}
                            {(product.measurements || product.sizes) && (
                                <div className={styles.sizeChartWrap}>
                                    <SizeChart
                                        measurements={product.measurements || {}}
                                        sizes={[]}
                                    />
                                </div>
                            )}

                            {/* Video */}
                            {product.video_url && (
                                <div className={styles.videoWrap}>
                                    <h3 className={styles.sectionTitle}>Video</h3>
                                    <video
                                        src={product.video_url}
                                        controls
                                        className={styles.video}
                                        playsInline
                                    />
                                </div>
                            )}

                            <div className="divider" />

                            {/* Buy button */}
                            <div className={styles.buySection}>
                                <WhatsAppButton
                                    product={product}
                                    selectedSize={selectedSize}
                                    whatsappNumber={whatsappNumber}
                                />
                                <p className={styles.buyNote}>
                                    💬 You&apos;ll be redirected to WhatsApp with product details pre-filled.
                                    We&apos;ll confirm availability and arrange delivery.
                                </p>
                            </div>

                            {/* Condition tags */}
                            <div className={styles.tags}>
                                <span className={styles.tag}>✅ Verified condition</span>
                                <span className={styles.tag}>🔒 Secure transaction</span>
                                <span className={styles.tag}>📦 Fast dispatch</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
