
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./FormSchema";

interface ParticipantsSectionProps {
  form: UseFormReturn<FormValues>;
}

const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({ form }) => {
  const watchUnlimitedSpots = form.watch("unlimitedSpots");
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="unlimitedSpots"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  // When unlimited spots is checked, clear maxParticipants
                  if (checked) {
                    form.setValue("maxParticipants", undefined);
                  } else {
                    // When unlimited spots is unchecked, set default value
                    form.setValue("maxParticipants", 20);
                  }
                }}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Unlimited spots</FormLabel>
              <FormDescription>
                Check this if there is no limit to the number of participants
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      {!watchUnlimitedSpots && (
        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Participants</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1}
                  {...field}
                  value={field.value || ""}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    field.onChange(isNaN(value) ? undefined : value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ParticipantsSection;
