'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (category === 'all') {
      setFiltered(products);
    } else {
      setFiltered(products.filter(p => p.category === category));
    }
  }, [category, products]);

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <div className={styles.bgOrb1} />
            <div className={styles.bgOrb2} />
            <div className={styles.bgGrid} />
          </div>
          <div className={`${styles.heroContent} container`}>
            <div className={styles.heroTag}>Premium Thrift Shop</div>
            <h1 className={styles.heroLogoWrap}>
              <Image
                src="/logo.png"
                alt="DICKS & TOES"
                width={800}
                height={400}
                className={styles.heroLogo}
                priority
              />
            </h1>
            <p className={styles.heroSub}>
              Handpicked vintage & one-of-a-kind thrift finds.<br />
              Wear your story. Own the street.
            </p>
            <div className={styles.heroCtas}>
              <a href="#collections" className="btn btn-primary">
                Explore Collection
              </a>
              <a href="/about" className="btn btn-outline">
                Our Story
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>100+</span>
                <span className={styles.statLabel}>Unique Pieces</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>100%</span>
                <span className={styles.statLabel}>Handpicked</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>Free</span>
                <span className={styles.statLabel}>Styling Advice</span>
              </div>
            </div>
          </div>
          <div className={styles.scrollIndicator}>
            <span className={styles.scrollLine} />
            <span className={styles.scrollText}>Scroll</span>
          </div>
        </section>

        {/* COLLECTIONS */}
        <section className={styles.collections} id="collections">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Latest Drops</span>
              <h2 className="section-title">The Collection</h2>
              <p className="section-subtitle">Every piece is unique. Once it&apos;s gone, it&apos;s gone.</p>
            </div>

            <div className={styles.filterWrap}>
              <CategoryFilter active={category} onChange={setCategory} />
            </div>

            {loading ? (
              <div className={styles.grid}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={styles.cardWrap}>
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
                <div className="icon">🛍️</div>
                <p>No products in this category yet. Check back soon!</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((p, i) => (
                  <div
                    key={p.id}
                    className={styles.cardWrap}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <div className={styles.viewAllWrap}>
                <a href="/collections" className="btn btn-outline">
                  View Full Collection →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ABOUT STRIP */}
        <section className={styles.aboutStrip}>
          <div className="container">
            <div className={styles.stripInner}>
              <div className={styles.stripText}>
                <span className="section-label">About Us</span>
                <h2>Not just a shop.<br />A lifestyle.</h2>
                <p>
                  We offer affordable, stylish pre-loved fashion that promotes sustainability and reduces waste.
                  Every piece is quality-checked and unique. Shop smart, save money, and support eco-friendly
                  fashion with us.
                </p>
                <a href="/about" className="btn btn-outline" style={{ marginTop: '24px' }}>
                  Learn More
                </a>
              </div>
              <div className={styles.stripVisual}>
                <div className={styles.visualCard}>
                  <Image src="/about1.jpeg" alt="Sustainable Vintage Fashion" fill className={styles.cardBgImage} />
                </div>
                <div className={styles.visualCard}>
                  <Image src="/about2.jpeg" alt="Curated Thrift Finds" fill className={styles.cardBgImage} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
