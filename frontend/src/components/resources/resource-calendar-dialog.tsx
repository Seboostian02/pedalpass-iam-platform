import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, type View, type SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAllReservations } from '@/hooks/use-resources';
import { CalendarDays } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resourceName: string;
  userEmail: string;
  justification: string;
}

interface ResourceCalendarDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectSlot: (start: Date, end: Date) => void;
}

const toLocalDatetime = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export function ResourceCalendarDialog({ open, onClose, onSelectSlot }: ResourceCalendarDialogProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('week');

  const rangeStart = useMemo(() => {
    return toLocalDatetime(subMonths(startOfMonth(currentDate), 1));
  }, [currentDate]);

  const rangeEnd = useMemo(() => {
    return toLocalDatetime(addMonths(endOfMonth(currentDate), 1));
  }, [currentDate]);

  const { data: reservations } = useAllReservations(rangeStart, rangeEnd, open);

  const events: CalendarEvent[] = useMemo(() => {
    if (!reservations) return [];
    return reservations
      .filter(r => r.scheduledStart && r.scheduledEnd)
      .map(r => ({
        id: r.id,
        title: `${r.resource.name} — ${r.userEmail}`,
        start: new Date(r.scheduledStart!),
        end: new Date(r.scheduledEnd!),
        status: r.status,
        resourceName: r.resource.name,
        userEmail: r.userEmail,
        justification: r.justification,
      }));
  }, [reservations]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const isApproved = event.status === 'APPROVED';
    return {
      style: {
        backgroundColor: isApproved ? 'oklch(0.45 0.15 145)' : 'oklch(0.55 0.15 85)',
        color: '#fff',
        borderRadius: '4px',
        border: 'none',
        fontSize: '0.75rem',
        padding: '2px 4px',
      },
    };
  }, []);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    onSelectSlot(slotInfo.start, slotInfo.end);
  }, [onSelectSlot]);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Reservations
          </DialogTitle>
          <DialogDescription>
            View existing reservations across all resources. Click an empty slot to make a new reservation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 rbc-dark">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            view={view}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            views={['month', 'week', 'day']}
            defaultView="week"
            selectable
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            tooltipAccessor={(event) => `${event.resourceName}\n${event.userEmail}\n${event.justification}`}
            style={{ height: '60vh' }}
            step={30}
            timeslots={2}
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'oklch(0.45 0.15 145)' }} />
            Approved
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'oklch(0.55 0.15 85)' }} />
            Pending
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
