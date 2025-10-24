import React from 'react';
import PropTypes from 'prop-types';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // Map custom variants to Material UI variants and colors
  const muiVariant = variant === 'outline' ? 'outlined' : 'contained';
  let muiColor = 'primary'; // Default MUI color

  switch (variant) {
    case 'primary':
      muiColor = 'error'; // Using 'error' for red, as 'primary' is typically blue in MUI
      break;
    case 'secondary':
      muiColor = 'warning'; // Using 'warning' for yellow
      break;
    case 'danger':
      muiColor = 'error';
      break;
    case 'success':
      muiColor = 'success';
      break;
    default:
      muiColor = 'primary';
  }

  // Map custom sizes to Material UI sizes
  const muiSize = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  }[size];

  return (
    <MuiButton
      type={type}
      variant={muiVariant}
      color={muiColor}
      size={muiSize}
      onClick={onClick}
      disabled={disabled || loading}
      className={className} // Pass through custom class names if any
      {...props}
    >
      {loading ? (
        <>
          {/* Using Material UI's CircularProgress for loading indicator */}
          <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          Procesando...
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
