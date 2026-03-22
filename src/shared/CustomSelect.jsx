import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ id, name, options, value, onChange, placeholder, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || null;

  const handleSelect = (option) => {
    // Mimic native event target structure for standard handleChange functions
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  return (
    <div className="select-container" ref={dropdownRef}>
      <div 
        className={`select-trigger ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        id={id}
        style={style}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg 
          className={`select-arrow ${isOpen ? 'open' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {isOpen && (
        <ul className="select-menu">
          {options.map((option) => (
            <li 
              key={option.value} 
              className={`select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
