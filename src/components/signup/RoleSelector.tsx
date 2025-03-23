
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Users } from 'lucide-react';

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <Label>Account Type</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="voter" id="voter" />
          <Label htmlFor="voter" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Voter
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="candidate" id="candidate" />
          <Label htmlFor="candidate" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Candidate
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoleSelector;
