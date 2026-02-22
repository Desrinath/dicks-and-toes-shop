'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const EMPTY_FORM = {
    name: '', price: '', category: 'shirts', description: '',
    color: '', video_url: '',
    sizes: [],
    measurements: { chest: '', length: '', shoulder: '', sleeve: '' },
};
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CATEGORIES = ['shirts', 'jackets', 'pants', 'accessories'];

function getImg(url) {
    if (!url) return null;
    if (url.startsWith('/uploads/')) return `${API_URL}${url}`;
    return url;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [token, setToken] = useState(null);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('upload'); // 'upload' | 'manage'
    const [form, setForm] = useState(EMPTY_FORM);
    const [headerFile, setHeaderFile] = useState(null);
    const [detailFiles, setDetailFiles] = useState([]);
    const [headerPreview, setHeaderPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
    const headerRef = useRef(null);
    const detailRef = useRef(null);

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

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 5000);
    };

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

    const onHeaderChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeaderFile(file);
            setHeaderPreview(URL.createObjectURL(file));
        }
    };

    const onDetailChange = (e) => {
        setDetailFiles(Array.from(e.target.files || []));
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setHeaderFile(null);
        setDetailFiles([]);
        setHeaderPreview(null);
        setEditId(null);
        if (headerRef.current) headerRef.current.value = '';
        if (detailRef.current) detailRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('price', form.price);
            fd.append('category', form.category);
            fd.append('description', form.description);
            fd.append('color', form.color);
            fd.append('video_url', form.video_url);
            fd.append('sizes', JSON.stringify(form.sizes));
            fd.append('measurements', JSON.stringify(
                Object.fromEntries(Object.entries(form.measurements).filter(([, v]) => v))
            ));
            if (headerFile) fd.append('header_image', headerFile);
            detailFiles.forEach(f => fd.append('images', f));

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
        setForm({
            name: product.name || '',
            price: product.price || '',
            category: product.category || 'shirts',
            description: product.description || '',
            color: product.color || '',
            video_url: product.video_url || '',
            sizes: product.sizes || [],
            measurements: {
                chest: product.measurements?.chest || '',
                length: product.measurements?.length || '',
                shoulder: product.measurements?.shoulder || '',
                sleeve: product.measurements?.sleeve || '',
            },
        });
        setHeaderPreview(getImg(product.header_image));
        setTab('upload');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id, name) => {
        setDeleteTarget({ id, name });
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
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Server error ${res.status}`);
            }
            showSuccess('Product deleted successfully.');
            loadProducts();
        } catch (err) {
            showError(err.message || 'Could not delete product.');
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin');
    };

    return (
        <div className={styles.page}>
            {/* Inline Confirm Delete Modal */}
            {deleteTarget && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--black-3)', border: '1px solid var(--glass-border)',
                        borderRadius: '20px', padding: '36px', maxWidth: '420px', width: '100%',
                        animation: 'scaleIn 0.25s var(--ease-bounce) forwards'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px', textAlign: 'center' }}>🗑️</div>
                        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Delete Product?</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.9rem' }}>
                            &ldquo;{deleteTarget.name}&rdquo; will be permanently removed from the store.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setDeleteTarget(null)}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmDelete}
                                style={{ flex: 1 }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}>
                    <span>D & T</span>
                    <small>Admin</small>
                </div>
                <nav className={styles.sideNav}>
                    <button
                        className={`${styles.navItem} ${tab === 'upload' ? styles.navActive : ''}`}
                        onClick={() => setTab('upload')}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 5v14M5 12l7-7 7 7" />
                        </svg>
                        {editId ? 'Edit Product' : 'Add Product'}
                    </button>
                    <button
                        className={`${styles.navItem} ${tab === 'manage' ? styles.navActive : ''}`}
                        onClick={() => setTab('manage')}
                    >
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

            {/* Main content */}
            <main className={styles.content}>
                {/* Toasts */}
                {successMsg && <div className={styles.toast}>{successMsg}</div>}
                {errorMsg && <div className={`${styles.toast} ${styles.toastError}`}>{errorMsg}</div>}

                {/* Upload / Edit Tab */}
                {tab === 'upload' && (
                    <div className={styles.uploadPanel}>
                        <div className={styles.panelHeader}>
                            <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
                            {editId && (
                                <button className="btn btn-ghost" onClick={resetForm}>Cancel Edit</button>
                            )}
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

                                    {/* Sizes */}
                                    <div className="form-group">
                                        <label>Sizes</label>
                                        <div className={styles.sizeGrid}>
                                            {ALL_SIZES.map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    className={`${styles.sizeBtn} ${form.sizes.includes(s) ? styles.sizeBtnActive : ''}`}
                                                    onClick={() => toggleSize(s)}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Measurements */}
                                    <div className="form-group">
                                        <label>Measurements</label>
                                        <div className={styles.measureGrid}>
                                            {['chest', 'length', 'shoulder', 'sleeve'].map(key => (
                                                <input
                                                    key={key}
                                                    name={key}
                                                    className="form-input"
                                                    value={form.measurements[key]}
                                                    onChange={handleMeasurement}
                                                    placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} (e.g. 42 in)`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Col 2 — Images */}
                                <div className={styles.formCol}>
                                    <div className="form-group">
                                        <label>Header Image *</label>
                                        <div
                                            className={styles.dropzone}
                                            onClick={() => headerRef.current?.click()}
                                        >
                                            {headerPreview ? (
                                                <div className={styles.previewImg}>
                                                    <Image src={headerPreview} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                                    <div className={styles.previewOverlay}>Change Image</div>
                                                </div>
                                            ) : (
                                                <div className={styles.dropzoneInner}>
                                                    <span className={styles.dropIcon}>📷</span>
                                                    <p>Click to upload header image</p>
                                                    <span>JPG, PNG, WEBP</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={headerRef}
                                            type="file"
                                            accept="image/*"
                                            className={styles.fileInput}
                                            onChange={onHeaderChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Detail Images</label>
                                        <div
                                            className={styles.dropzone}
                                            onClick={() => detailRef.current?.click()}
                                        >
                                            <div className={styles.dropzoneInner}>
                                                <span className={styles.dropIcon}>🖼️</span>
                                                <p>
                                                    {detailFiles.length > 0
                                                        ? `${detailFiles.length} file(s) selected`
                                                        : 'Click to upload detail images'}
                                                </p>
                                                <span>Select multiple photos</span>
                                            </div>
                                        </div>
                                        <input
                                            ref={detailRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className={styles.fileInput}
                                            onChange={onDetailChange}
                                        />
                                    </div>

                                    {/* Preview card */}
                                    <div className={styles.previewCard}>
                                        <p className={styles.previewLabel}>Product Preview</p>
                                        <div className={styles.miniCard}>
                                            <div className={styles.miniImg}>
                                                {headerPreview ? (
                                                    <Image src={headerPreview} alt="preview" fill style={{ objectFit: 'cover' }} />
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
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${styles.submitBtn}`}
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? 'Saving...'
                                        : editId ? 'Update Product' : '+ Add to Store'
                                    }
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Manage Tab */}
                {tab === 'manage' && (
                    <div className={styles.managePanel}>
                        <div className={styles.panelHeader}>
                            <h2>Manage Products</h2>
                            <button className="btn btn-primary" onClick={() => { resetForm(); setTab('upload'); }}>
                                + Add New
                            </button>
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
                                    <span>Product</span>
                                    <span>Category</span>
                                    <span>Price</span>
                                    <span>Sizes</span>
                                    <span>Actions</span>
                                </div>
                                {products.map(p => (
                                    <div key={p.id} className={styles.tableRow}>
                                        <div className={styles.productCell}>
                                            <div className={styles.productThumb}>
                                                {p.header_image ? (
                                                    <Image
                                                        src={getImg(p.header_image)}
                                                        alt={p.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <span>👕</span>
                                                )}
                                            </div>
                                            <span className={styles.productName}>{p.name}</span>
                                        </div>
                                        <span className="badge">{p.category}</span>
                                        <span className={styles.priceCell}>
                                            ₹{typeof p.price === 'number' ? p.price.toLocaleString('en-IN') : p.price}
                                        </span>
                                        <span className={styles.sizesCell}>
                                            {(p.sizes || []).join(', ') || '—'}
                                        </span>
                                        <div className={styles.actions}>
                                            <button
                                                className="btn btn-ghost"
                                                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                                                onClick={() => handleEdit(p)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                                                onClick={() => handleDelete(p.id, p.name)}
                                            >
                                                Delete
                                            </button>
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
