import { SCROLL_OFFSET } from '../../constants/config';

/**
 * Reusable Modal shell — renders the overlay backdrop, close button, and
 * wraps whatever children are passed in.
 *
 * @param {object}   props
 * @param {Function} props.onClose     – called when backdrop or × is clicked
 * @param {string}   [props.className] – extra class applied to .modal-content
 * @param {React.ReactNode} props.children
 */
export default function Modal({ onClose, className = '', children }) {
  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-content${className ? ` ${className}` : ''}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        {children}
      </div>
    </div>
  );
}
