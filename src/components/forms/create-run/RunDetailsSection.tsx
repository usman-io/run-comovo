
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { formatPace } from '@/utils/helpers';
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./FormSchema";

interface RunDetailsSectionProps {
  form: UseFormReturn<FormValues>;
}

const RunDetailsSection: React.FC<RunDetailsSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="distance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distance ({field.value} km)</FormLabel>
            <FormControl>
              <Slider
                min={1}
                max={50}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(values) => field.onChange(values[0])}
              />
            </FormControl>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 km</span>
              <span>50 km</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="pace"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Pace ({formatPace(field.value)})</FormLabel>
            <FormControl>
              <Slider
                min={3}
                max={12}
                step={1/6} // This makes it increment by 10 seconds (1/6 of a minute)
                defaultValue={[field.value]}
                onValueChange={(values) => field.onChange(values[0])}
              />
            </FormControl>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Fast (3:00)</span>
              <span>Slow (12:00)</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RunDetailsSection;
