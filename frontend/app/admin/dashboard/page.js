'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const EMPTY_FORM = {
    name: '', price: '', category: 'shirts', description: '',
    color: '', video_url: '',
    sizes: [],
    condition: 'Good',
    coupon_code: '',
    discount_amount: '',
    measurements: { chest: '', length: '', shoulder: '', sleeve: '' },
    header_image: '',
    extra_images: '',   // comma-separated extra image URLs
};
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CATEGORIES = ['shirts', 'jackets', 'pants', 'accessories'];

export default function AdminDashboard() {
    const router = useRouter();
    const [token, setToken] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('upload');
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem('admin_token');
        if (!t) { router.push('/admin'); return; }
        setToken(t);
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/products`);
            setProducts(await res.json());
        } catch { }
        setLoading(false);
    };

    const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
    const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleMeasurement = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, measurements: { ...f.measurements, [name]: value } }));
    };

    const toggleSize = (size) => {
        setForm(f => ({
            ...f,
            sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size],
        }));
    };

    const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        try {
            // Build extra image list from comma-separated string + header
            const extraUrls = form.extra_images
                ? form.extra_images.split(',').map(u => u.trim()).filter(Boolean)
                : [];
            const allImages = form.header_image
                ? [form.header_image, ...extraUrls.filter(u => u !== form.header_image)]
                : extraUrls;

            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('price', form.price);
            fd.append('category', form.category);
            fd.append('description', form.description);
            fd.append('color', form.color);
            fd.append('video_url', form.video_url);
            fd.append('condition', form.condition);
            fd.append('coupon_code', form.coupon_code);
            fd.append('discount_amount', form.discount_amount || 0);
            fd.append('sizes', JSON.stringify(form.sizes));
            fd.append('measurements', JSON.stringify(
                Object.fromEntries(Object.entries(form.measurements).filter(([, v]) => v))
            ));
            fd.append('header_image', form.header_image || '');
            fd.append('images', JSON.stringify(allImages));

            const url = editId
                ? `${API_URL}/api/admin/products/${editId}`
                : `${API_URL}/api/admin/products`;
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (!res.ok) throw new Error((await res.json()).detail || 'Request failed');
            showSuccess(editId ? 'Product updated!' : 'Product added to store!');
            resetForm();
            loadProducts();
            setTab('manage');
        } catch (err) {
            showError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (product) => {
        setEditId(product.id);
        const imgs = product.images || [];
        const header = product.header_image || '';
        const extra = imgs.filter(u => u !== header).join(', ');
        setForm({
            name: product.name || '',
            price: product.price || '',
            category: product.category || 'shirts',
            description: product.description || '',
            color: product.color || '',
            video_url: product.video_url || '',
            condition: product.condition || 'Good',
            coupon_code: product.coupon_code || '',
            discount_amount: product.discount_amount || '',
            sizes: product.sizes || [],
            measurements: {
                chest: product.measurements?.chest || '',
                length: product.measurements?.length || '',
                shoulder: product.measurements?.shoulder || '',
                sleeve: product.measurements?.sleeve || '',
            },
            header_image: header,
            extra_images: extra,
        });
        setTab('upload');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id } = deleteTarget;
        setDeleteTarget(null);
        try {
            const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error((await res.json()).detail || 'Error');
            showSuccess('Product deleted.');
            loadProducts();
        } catch (err) {
            showError(err.message || 'Could not delete.');
        }
    };

    const logout = () => { localStorage.removeItem('admin_token'); router.push('/admin'); };

    return (
        <div className={styles.page}>
            {deleteTarget && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--black-3)', border: '1px solid var(--glass-border)',
                        borderRadius: '20px', padding: '36px', maxWidth: '420px', width: '100%',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px', textAlign: 'center' }}>🗑️</div>
                        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Delete Product?</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.9rem' }}>
                            &ldquo;{deleteTarget.name}&rdquo; will be permanently removed.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmDelete} style={{ flex: 1 }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}><span>D & T</span><small>Admin</small></div>
                <nav className={styles.sideNav}>
                    <button className={`${styles.navItem} ${tab === 'upload' ? styles.navActive : ''}`} onClick={() => setTab('upload')}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 5v14M5 12l7-7 7 7" />
                        </svg>
                        {editId ? 'Edit Product' : 'Add Product'}
                    </button>
                    <button className={`${styles.navItem} ${tab === 'manage' ? styles.navActive : ''}`} onClick={() => setTab('manage')}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Manage Products
                        <span className={styles.count}>{products.length}</span>
                    </button>
                </nav>
                <div className={styles.sidebarBottom}>
                    <a href="/" className={styles.storeLink} target="_blank">View Store ↗</a>
                    <button className={styles.logoutBtn} onClick={logout}>Logout</button>
                </div>
            </aside>

            <main className={styles.content}>
                {successMsg && <div className={styles.toast}>{successMsg}</div>}
                {errorMsg && <div className={`${styles.toast} ${styles.toastError}`}>{errorMsg}</div>}

                {tab === 'upload' && (
                    <div className={styles.uploadPanel}>
                        <div className={styles.panelHeader}>
                            <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
                            {editId && <button className="btn btn-ghost" onClick={resetForm}>Cancel Edit</button>}
                        </div>

                        {/* ImgBB helper banner */}
                        <div style={{
                            background: 'rgba(180,180,255,0.07)', border: '1px solid rgba(180,180,255,0.2)',
                            borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
                            fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6
                        }}>
                            📸 <strong style={{ color: 'var(--text-primary)' }}>How to add images:</strong>&nbsp;
                            Upload your photo to <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: '#a0a0ff' }}>imgbb.com</a> (free) → click the image → copy the <em>Direct link</em> → paste it below.
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGrid}>
                                {/* Col 1 */}
                                <div className={styles.formCol}>
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input name="name" className="form-input" value={form.name}
                                            onChange={handleChange} placeholder="e.g. Vintage Flannel Shirt" required />
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className="form-group">
                                            <label>Price (₹) *</label>
                                            <input name="price" type="number" className="form-input" value={form.price}
                                                onChange={handleChange} placeholder="e.g. 899" required min="0" />
                                        </div>
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                                                {CATEGORIES.map(c => (
                                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Color</label>
                                        <input name="color" className="form-input" value={form.color}
                                            onChange={handleChange} placeholder="e.g. Faded Black" />
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" className="form-input" value={form.description}
                                            onChange={handleChange} placeholder="Describe the piece, condition, era, material..." />
                                    </div>

                                    <div className="form-group">
                                        <label>Video URL (optional)</label>
                                        <input name="video_url" className="form-input" value={form.video_url}
                                            onChange={handleChange} placeholder="https://..." />
                                    </div>

                                    <div className="form-group">
                                        <label>Sizes</label>
                                        <div className={styles.sizeGrid}>
                                            {ALL_SIZES.map(s => (
                                                <button key={s} type="button"
                                                    className={`${styles.sizeBtn} ${form.sizes.includes(s) ? styles.sizeBtnActive : ''}`}
                                                    onClick={() => toggleSize(s)}>{s}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Measurements</label>
                                        <div className={styles.measureGrid}>
                                            {['chest', 'length', 'shoulder', 'sleeve'].map(key => (
                                                <input key={key} name={key} className="form-input"
                                                    value={form.measurements[key]} onChange={handleMeasurement}
                                                    placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} (e.g. 42 in)`} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className="form-group">
                                            <label>Condition</label>
                                            <select name="condition" className="form-input" value={form.condition} onChange={handleChange}>
                                                <option value="Excellent">Excellent</option>
                                                <option value="Good">Good</option>
                                                <option value="Neat">Neat</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className="form-group">
                                            <label>Coupon Code (Optional)</label>
                                            <input name="coupon_code" className="form-input" value={form.coupon_code}
                                                onChange={handleChange} placeholder="e.g. WINTER50" />
                                        </div>
                                        <div className="form-group">
                                            <label>Discount Amount (₹)</label>
                                            <input name="discount_amount" type="number" className="form-input"
                                                value={form.discount_amount} onChange={handleChange} placeholder="e.g. 200" min="0" />
                                        </div>
                                    </div>
                                </div>

                                {/* Col 2 — Images */}
                                <div className={styles.formCol}>
                                    <div className="form-group">
                                        <label>Header / Main Image URL *</label>
                                        <input name="header_image" className="form-input" value={form.header_image}
                                            onChange={handleChange}
                                            placeholder="https://i.ibb.co/your-image.jpg" />
                                        {form.header_image && (
                                            <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', height: '220px', position: 'relative' }}>
                                                <Image src={form.header_image} alt="Preview" fill style={{ objectFit: 'cover' }}
                                                    onError={() => { }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Extra Image URLs <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span></label>
                                        <textarea name="extra_images" className="form-input" value={form.extra_images}
                                            onChange={handleChange}
                                            placeholder="https://i.ibb.co/img2.jpg, https://i.ibb.co/img3.jpg"
                                            style={{ minHeight: '80px' }} />
                                        <small style={{ color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                                            Separate multiple image links with a comma.
                                        </small>
                                    </div>

                                    {/* Preview card */}
                                    <div className={styles.previewCard}>
                                        <p className={styles.previewLabel}>Product Preview</p>
                                        <div className={styles.miniCard}>
                                            <div className={styles.miniImg}>
                                                {form.header_image ? (
                                                    <Image src={form.header_image} alt="preview" fill style={{ objectFit: 'cover' }} onError={() => { }} />
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '2rem' }}>👕</span>
                                                )}
                                            </div>
                                            <div className={styles.miniInfo}>
                                                <p className={styles.miniName}>{form.name || 'Product Name'}</p>
                                                <p className={styles.miniPrice}>
                                                    {form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '₹0'}
                                                </p>
                                                {form.sizes.length > 0 && (
                                                    <div className={styles.miniSizes}>
                                                        {form.sizes.map(s => <span key={s}>{s}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={submitting}>
                                    {submitting ? 'Saving...' : editId ? 'Update Product' : '+ Add to Store'}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>Reset</button>
                            </div>
                        </form>
                    </div>
                )}

                {tab === 'manage' && (
                    <div className={styles.managePanel}>
                        <div className={styles.panelHeader}>
                            <h2>Manage Products</h2>
                            <button className="btn btn-primary" onClick={() => { resetForm(); setTab('upload'); }}>+ Add New</button>
                        </div>

                        {loading ? (
                            <div className={styles.loadingWrap}><div className="spinner" /></div>
                        ) : products.length === 0 ? (
                            <div className="no-results">
                                <div className="icon">📦</div>
                                <p>No products yet. Add your first piece!</p>
                            </div>
                        ) : (
                            <div className={styles.table}>
                                <div className={styles.tableHead}>
                                    <span>Product</span><span>Category</span><span>Price</span><span>Sizes</span><span>Actions</span>
                                </div>
                                {products.map(p => (
                                    <div key={p.id} className={styles.tableRow}>
                                        <div className={styles.productCell}>
                                            <div className={styles.productThumb}>
                                                {p.header_image ? (
                                                    <Image src={p.header_image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <span>👕</span>
                                                )}
                                            </div>
                                            <span className={styles.productName}>{p.name}</span>
                                        </div>
                                        <span className="badge">{p.category}</span>
                                        <span className={styles.priceCell}>₹{typeof p.price === 'number' ? p.price.toLocaleString('en-IN') : p.price}</span>
                                        <span className={styles.sizesCell}>{(p.sizes || []).join(', ') || '—'}</span>
                                        <div className={styles.actions}>
                                            <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => handleEdit(p)}>Edit</button>
                                            <button className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => setDeleteTarget({ id: p.id, name: p.name })}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
