
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/schemas/signupSchema';
import RoleSelector from './RoleSelector';
import { sqlService } from '@/services/sql';

const SignupForm = () => {
  const navigate = useNavigate();
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'voter',
      termsAccepted: false,
    },
  });
  
  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await sqlService.registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      
      if (response.success) {
        toast.success('Registration successful!');
        navigate('/login');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          {...form.register('name')}
          className="mt-1"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          className="mt-1"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register('password')}
          className="mt-1"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...form.register('confirmPassword')}
          className="mt-1"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <RoleSelector
        value={form.watch('role')}
        onChange={(value) => form.setValue('role', value, { shouldValidate: true })}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={form.watch('termsAccepted')}
          onCheckedChange={(checked) => 
            form.setValue('termsAccepted', checked as boolean)
          }
        />
        <Label htmlFor="terms" className="text-sm">
          I accept the terms and conditions
        </Label>
      </div>
      {form.formState.errors.termsAccepted && (
        <p className="text-sm text-destructive mt-1">
          {form.formState.errors.termsAccepted.message}
        </p>
      )}

      <Button type="submit" className="w-full">
        Sign Up
      </Button>
    </form>
  );
};

export default SignupForm;
