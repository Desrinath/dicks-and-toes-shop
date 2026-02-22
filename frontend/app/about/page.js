import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import styles from './page.module.css';

export const metadata = {
    title: "About — DICKS & TOES",
};

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className={styles.main}>
                {/* Hero */}
                <section className={styles.hero}>
                    <div className={styles.heroBg} />
                    <div className={`${styles.heroContent} container`}>
                        <span className="section-label">Our Story</span>
                        <h1 className={styles.heroTitle}>
                            Born from the<br />
                            <span className="shimmer-text">thrift culture</span>
                        </h1>
                        <p className={styles.heroSub}>
                            We&apos;re not a brand — we&apos;re a movement. Finding beauty in the pre-loved,
                            character in the vintage, and value in the overlooked.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section className={`section ${styles.values}`}>
                    <div className="container">
                        <div className="section-header">
                            <span className="section-label">What We Stand For</span>
                            <h2 className="section-title">Our Values</h2>
                        </div>
                        <div className={styles.valuesGrid}>
                            {[
                                { title: 'Sustainable', text: "Every piece is a second chance. We extend the life of fashion and reduce textile waste — one find at a time.", image: '/value1.jpg' },
                                { title: 'Curated', text: "We don't bulk buy. Every item is personally inspected, verified, and selected by our team for quality and style.", image: '/value2.jpg' },
                                { title: 'Accessible', text: "Premium vintage doesn't have to cost a fortune. We keep prices fair so everyone can dress with character.", image: '/value3.jpg' },
                                { title: 'Personal', text: "We're real people, not a faceless store. Message us on WhatsApp and we'll help you find your perfect fit.", image: '/value4.jpg' },
                            ].map(v => (
                                <div key={v.title} className={`glass-card ${styles.valueCard}`}>
                                    <div className={styles.valueImageWrapper}>
                                        <Image
                                            src={v.image}
                                            alt={v.title}
                                            fill
                                            className={styles.valueImage}
                                            sizes="(max-width: 768px) 100vw, 25vw"
                                        />
                                    </div>
                                    <div className={styles.valueContent}>
                                        <h3>{v.title}</h3>
                                        <p>{v.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className={`${styles.process}`}>
                    <div className="container">
                        <div className="section-header">
                            <span className="section-label">The Process</span>
                            <h2 className="section-title">How It Works</h2>
                        </div>
                        <div className={styles.steps}>
                            {[
                                { num: '01', title: 'We Hunt', text: 'Our team scours charity shops, estate sales, and markets to find hidden gems.' },
                                { num: '02', title: 'We Verify', text: "Every piece is inspected for quality. No holes, major stains, or structural damage." },
                                { num: '03', title: 'You Browse', text: "Explore our curated collection and find pieces that speak to you." },
                                { num: '04', title: 'You Buy', text: "One tap sends us a WhatsApp message. We confirm, arrange, and deliver. Easy." },
                            ].map(s => (
                                <div key={s.num} className={styles.step}>
                                    <span className={styles.stepNum}>{s.num}</span>
                                    <div>
                                        <h4>{s.title}</h4>
                                        <p>{s.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className={`section ${styles.contact}`} id="contact">
                    <div className="container">
                        <div className={styles.contactCard}>
                            <span className="section-label">Get In Touch</span>
                            <h2>Let&apos;s talk thrift.</h2>
                            <p>Questions, custom requests, or just want to say hi — we&apos;re always around.</p>
                            <div className={styles.contactLinks}>
                                <a
                                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-whatsapp"
                                >
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    WhatsApp Us
                                </a>
                                <a href="/collections" className="btn btn-outline">
                                    Browse Collection
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
