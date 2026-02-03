import { CheckCircle } from "lucide-react";

interface SuccessToastProps {
  message: string;
  points?: number;
}

const SuccessToast = ({ message, points }: SuccessToastProps) => {
  return (
    <div className="flex items-center gap-3 bg-secondary/90 text-secondary-foreground px-4 py-3 rounded-2xl shadow-warm animate-scale-in">
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">{message}</span>
      {points && (
        <span className="bg-card px-2 py-0.5 rounded-full text-sm font-bold">
          +{points} 🐾
        </span>
      )}
    </div>
  );
};

export default SuccessToast;
