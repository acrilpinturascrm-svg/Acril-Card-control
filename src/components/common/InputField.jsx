import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material'; // Import Material UI TextField

const InputField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  InputProps, // <-- Add this prop
  ...props
}) => (
  <TextField
    fullWidth // Makes the TextField take full width
    type={type}
    label={placeholder} // Use placeholder as label for Material UI
    value={value}
    onChange={onChange}
    error={!!error} // Convert error string to boolean
    helperText={error} // Display error message
    variant="outlined" // Standard Material UI variant
    margin="normal" // Adds some vertical spacing
    InputProps={InputProps} // <-- Pass it to TextField
    {...props}
  />
);

InputField.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  InputProps: PropTypes.object, // <-- Add propType
};

export default InputField;
