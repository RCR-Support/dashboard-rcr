import { Button } from '@heroui/react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            as={Link}
            href={action.href}
            color={action.color || 'primary'}
            variant="flat"
            startContent={<Icon className="h-4 w-4" />}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
