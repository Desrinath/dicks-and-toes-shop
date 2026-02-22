'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Wrong password');
            localStorage.setItem('admin_token', data.token);
            router.push('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.bg}>
                <div className={styles.orb} />
            </div>
            <div className={styles.card}>
                <div className={styles.logoWrap}>
                    <h1 className={styles.logo}>D & T</h1>
                    <p className={styles.logoSub}>Admin Panel</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password">Admin Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter password..."
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? 'Checking...' : 'Enter Dashboard →'}
                    </button>
                </form>

                <a href="/" className={styles.backLink}>← Back to Store</a>
            </div>
        </div>
    );
}
