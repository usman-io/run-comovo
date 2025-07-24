
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormValues } from './types';

interface RoleSelectorProps {
  form: UseFormReturn<FormValues>;
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
              onValueChange={(value) => {
                console.log('Role changed to:', value);
                field.onChange(value);
                // Reset form values when role changes
                const newDefaults = { role: value as "runner" | "business" };
                if (value === "business") {
                  (newDefaults as any).countryCode = "+34";
                }
                form.reset(newDefaults);
              }}
              defaultValue={field.value}
              className="flex space-x-4"
            >
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="runner" />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">Runner</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="business" />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">Business</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RoleSelector;
