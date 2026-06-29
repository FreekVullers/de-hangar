import { useEffect, useState } from 'react';

interface DebouncedInputProps {
  value: string;
  onDebouncedChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
  type?: string;
  list?: string;
}

export function DebouncedInput({
  value,
  onDebouncedChange,
  delay = 250,
  placeholder,
  className,
  type = 'text',
  list,
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onDebouncedChange(localValue);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [localValue, delay, onDebouncedChange]);

  return (
    <input
      type={type}
      list={list}
      value={localValue}
      onChange={(event) => setLocalValue(event.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}