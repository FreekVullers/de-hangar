import { ReactNode } from 'react';

interface OperationDetailsProps {
  children: ReactNode;
}

export default function OperationDetails({ children }: OperationDetailsProps) {
  return (
    <div className="mt-6 rounded-xl border border-gray-700 p-4">
      {children}
    </div>
  );
}