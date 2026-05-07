import { Card, CardBody } from '@heroui/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-blue-500',
  description 
}: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow dark:bg-[#282c34]">
      <CardBody className="flex flex-row items-center gap-4 p-6">
        <div className={`p-3 rounded-lg bg-default-100 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-default-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-default-400 mt-1">{description}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
