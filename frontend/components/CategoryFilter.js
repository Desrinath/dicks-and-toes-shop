'use client';
import styles from './CategoryFilter.module.css';

const CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'shirts', label: 'Shirts' },
    { key: 'jackets', label: 'Jackets' },
    { key: 'pants', label: 'Pants' },
    { key: 'accessories', label: 'Accessories' },
];

export default function CategoryFilter({ active, onChange }) {
    return (
        <div className={styles.wrap}>
            <div className={styles.track}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        className={`${styles.pill} ${active === cat.key ? styles.active : ''}`}
                        onClick={() => onChange(cat.key)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
