import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateTimePickerProps {
  value?: string; // format: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

function toDatetimeLocal(date: Date, hours: string, minutes: string): string {
  const d = new Date(date);
  d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimePicker({ value, onChange, placeholder = 'Pick date & time...', className }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [hours, setHours] = useState('09');
  const [minutes, setMinutes] = useState('00');

  // Sync internal state from external value
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          setHours(date.getHours().toString().padStart(2, '0'));
          setMinutes(date.getMinutes().toString().padStart(2, '0'));
        }
      } catch { /* ignore invalid dates */ }
    } else {
      setSelectedDate(undefined);
      setHours('09');
      setMinutes('00');
    }
  }, [value]);

  const handleConfirm = () => {
    if (selectedDate) {
      onChange(toDatetimeLocal(selectedDate, hours, minutes));
    }
    setOpen(false);
  };

  const displayValue = value
    ? (() => {
        try { return format(new Date(value), 'MMM d, yyyy  HH:mm'); }
        catch { return value; }
      })()
    : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-9 px-3',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          {displayValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          autoFocus
        />

        {/* Time picker */}
        <div className="border-t border-border px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Time:</span>
            <Select value={hours} onValueChange={setHours}>
              <SelectTrigger className="w-[70px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground font-bold">:</span>
            <Select value={minutes} onValueChange={setMinutes}>
              <SelectTrigger className="w-[70px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MINUTES.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleConfirm}
            className="w-full"
            size="sm"
            disabled={!selectedDate}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
