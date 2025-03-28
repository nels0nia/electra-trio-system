
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Users, Shield } from 'lucide-react';

type RoleType = "voter" | "candidate" | "admin";

interface RoleSelectorProps {
  value: RoleType;
  onChange: (value: RoleType) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <Label>Account Type</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-4"
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
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="admin" id="admin" />
          <Label htmlFor="admin" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Admin
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default RoleSelector;
