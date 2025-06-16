
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onAddContact: () => void;
}

const EmptyState = ({ hasFilters, onAddContact }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        {hasFilters ? "No contacts found" : "No contacts yet"}
      </h3>
      <p className="text-slate-600 mb-4 leading-relaxed px-4">
        {hasFilters
          ? "Try adjusting your search or filters" 
          : "Add your first contact to start building your referral network"}
      </p>
      {!hasFilters && (
        <Button onClick={onAddContact} className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Your First Contact
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
