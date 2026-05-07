import { Checkbox } from '@heroui/react';

interface ActivityCheckboxProps {
  isSelected: boolean;
  onValueChange: (isSelected: boolean) => void;
  label?: string;
}

export const ActivityCheckbox = ({
  isSelected,
  onValueChange,
  label,
}: ActivityCheckboxProps) => {
  return (
    <Checkbox
      isSelected={isSelected}
      onValueChange={onValueChange}
      size="md"
      aria-label={label}
    />
  );
};
