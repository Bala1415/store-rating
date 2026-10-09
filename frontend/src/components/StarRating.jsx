import React, { useState } from 'react';

/**
 * StarRating component
 * Supports both read-only display and interactive selection (1-5 stars)
 */
export default function StarRating({
  value = 0,
  interactive = false,
  onChange = () => {},
  size = 20,
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = interactive && hoverValue > 0 ? hoverValue : Number(value) || 0;

  return (
    <div className="star-rating" role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = displayValue >= star;
        const isHalf = !isFilled && displayValue >= star - 0.5;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className={`interactive-star-btn ${star <= (hoverValue || value) ? 'active' : ''}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={star <= (hoverValue || value) ? '#f59e0b' : '#cbd5e1'}
                stroke="none"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        }

        return (
          <span key={star} style={{ display: 'inline-flex' }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={isFilled ? '#f59e0b' : isHalf ? '#fbbf24' : '#cbd5e1'}
              stroke="none"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
