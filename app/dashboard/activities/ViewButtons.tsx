import { Tooltip } from '@heroui/tooltip';
import { FaAddressCard } from 'react-icons/fa6';
import { PiUserListFill } from 'react-icons/pi';
import { COLORS, ViewType } from './interfaces';

interface ViewButtonProps {
  currentView: ViewType;
  onToggle: (view: ViewType) => void;
}

export function CardViewButton({ currentView, onToggle }: ViewButtonProps) {
  return (
    <Tooltip content="Tarjetas de actividades">
      <button
        onClick={() => onToggle('cards')}
        className={`${COLORS.HOVER} ${currentView === 'cards' ? COLORS.ACTIVE : ''}`}
      >
        <FaAddressCard size={32} />
      </button>
    </Tooltip>
  );
}

export function TableViewButton({ currentView, onToggle }: ViewButtonProps) {
  return (
    <Tooltip content="Lista de actividades">
      <button
        onClick={() => onToggle('table')}
        className={`${COLORS.HOVER} ${currentView === 'table' ? COLORS.ACTIVE : ''}`}
      >
        <PiUserListFill size={32} />
      </button>
    </Tooltip>
  );
}
