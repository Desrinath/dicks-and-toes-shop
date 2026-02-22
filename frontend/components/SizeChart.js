import styles from './SizeChart.module.css';

export default function SizeChart({ measurements = {}, sizes = [] }) {
    const hasMeasurements = Object.keys(measurements).length > 0;

    if (!hasMeasurements && !sizes.length) return null;

    return (
        <div className={styles.wrap}>
            {sizes.length > 0 && (
                <div className={styles.block}>
                    <h4 className={styles.heading}>Available Sizes</h4>
                    <div className={styles.sizeGrid}>
                        {sizes.map(size => (
                            <span key={size} className={styles.sizeTag}>{size}</span>
                        ))}
                    </div>
                </div>
            )}

            {hasMeasurements && (
                <div className={styles.block}>
                    <h4 className={styles.heading}>Measurements</h4>
                    <table className={styles.table}>
                        <tbody>
                            {Object.entries(measurements).map(([key, val]) => (
                                <tr key={key} className={styles.row}>
                                    <td className={styles.key}>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                                    <td className={styles.val}>{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className={styles.note}>All measurements are approximate. DM us to confirm your size.</p>
                </div>
            )}
        </div>
    );
}
