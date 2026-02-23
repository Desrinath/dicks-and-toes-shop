'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

function CollectionsInner() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then(r => r.json())
            .then(data => { setProducts(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...products];
        if (category !== 'all') result = result.filter(p => p.category === category);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.color || '').toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [category, search, products]);

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.header}>
                    <div className="container">
                        <div className={styles.headerInner}>
                            <div>
                                <span className="section-label">Browse All</span>
                                <h1 className={styles.title}>Collections</h1>
                                <p className={styles.subtitle}>
                                    {products.length} unique pieces — curated just for you.
                                </p>
                            </div>
                            <div className={styles.searchWrap}>
                                <input
                                    type="text"
                                    className={`form-input ${styles.search}`}
                                    placeholder="Search pieces..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.filterWrap}>
                            <CategoryFilter active={category} onChange={setCategory} />
                        </div>
                    </div>
                </div>

                <div className="container">
                    {loading ? (
                        <div className={styles.grid}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className={styles.card}>
                                    <div className={styles.skeletonCard}>
                                        <div className={styles.skeletonImage} />
                                        <div className={styles.skeletonInfo}>
                                            <div className={styles.skeletonLine} style={{ width: '70%' }} />
                                            <div className={styles.skeletonLine} style={{ width: '40%', marginTop: '8px' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="no-results">
                            <div className="icon">🔍</div>
                            <p>Nothing found. Try a different search or category.</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filtered.map((p, i) => (
                                <div key={p.id} className={styles.card} style={{ animationDelay: `${i * 0.06}s` }}>
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function CollectionsPage() {
    return (
        <Suspense>
            <CollectionsInner />
        </Suspense>
    );
}
