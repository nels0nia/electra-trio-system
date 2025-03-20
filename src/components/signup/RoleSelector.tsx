
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, Users } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { SignupFormData } from '@/schemas/signupSchema';

interface RoleSelectorProps {
  form: UseFormReturn<SignupFormData>;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Account Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RoleSelector;
