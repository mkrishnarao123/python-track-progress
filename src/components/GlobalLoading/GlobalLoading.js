import { useSelector } from 'react-redux';
import { selectIsGlobalLoading } from '../../store/loadingSlice';
import './GlobalLoading.css';

export default function GlobalLoading() {
  const isLoading = useSelector(selectIsGlobalLoading);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="global-loading-backdrop" role="status" aria-live="polite" aria-label="Loading">
      <div className="global-loading-card">
        <div className="global-loading-spinner" />
        <p>Syncing latest learning data...</p>
      </div>
    </div>
  );
}