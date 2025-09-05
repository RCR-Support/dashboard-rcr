import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, ChevronDown, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

const searchSelectVariants = cva(
  'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
  {
    variants: {
      variant: {
        default:
          'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary:
          'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SearchSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof searchSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  modalPopover?: boolean;
  className?: string;
}

export const SearchSelect = React.forwardRef<
  HTMLButtonElement,
  SearchSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = '',
      placeholder = 'Seleccione una opción',
      modalPopover = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValue, setSelectedValue] =
      React.useState<string>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const handleSelect = (option: string) => {
      setSelectedValue(option);
      onValueChange(option);
      setIsPopoverOpen(false);
    };

    const handleClear = (event: React.MouseEvent) => {
      event.stopPropagation();
      setSelectedValue('');
      onValueChange('');
    };

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true);
      }
    };

    const selectedOption = options.find(opt => opt.value === selectedValue);

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={() => setIsPopoverOpen(true)}
            className={cn(
              'flex w-full p-1 rounded-md border-1 border-gray-500 dark:border-gray-200 min-h-10 h-auto items-center justify-between bg-inherit text-gray-400 hover:bg-inherit [&_svg]:pointer-events-auto',
              className
            )}
          >
            <div className="flex items-center justify-between w-full mx-auto">
              <span className="text-sm text-muted-foreground mx-3">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <div className="flex items-center">
                {selectedValue && (
                  <>
                    <XIcon
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={handleClear}
                    />
                    <Separator orientation="vertical" className="mx-2 h-4" />
                  </>
                )}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground',
                    isPopoverOpen ? 'transform rotate-180' : ''
                  )}
                />
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white dark:bg-gray-800"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder="Buscar..."
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>No se encontraron resultados</CommandEmpty>
              <CommandGroup>
                {options.map(option => {
                  const isSelected = selectedValue === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => setIsPopoverOpen(false)}
                  className="justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  Cerrar
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

SearchSelect.displayName = 'SearchSelect';
