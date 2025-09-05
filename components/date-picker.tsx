import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const [year, setYear] = React.useState(
    date ? date.getFullYear() : currentYear
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 bg-red-300" />
          {date
            ? format(date, 'PPP', { locale: es })
            : placeholder || 'Seleccionar fecha'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-2 p-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="mb-2 p-1 border rounded text-sm bg-white dark:bg-gray-800"
          >
            {years.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Calendar
            mode="single"
            selected={date}
            onSelect={newDate => {
              setDate(newDate);
              setIsOpen(false);
            }}
            initialFocus
            locale={es}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            month={new Date(year, date ? date.getMonth() : 0)}
            onMonthChange={m => setYear(m.getFullYear())}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
