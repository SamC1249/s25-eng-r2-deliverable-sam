"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Database } from "@/lib/schema";

// Define the kingdom type from the database schema
type Kingdom = Database["public"]["Enums"]["kingdom"];

// Define the kingdoms enum with explicit type
const kingdoms = z.enum([
  "Animalia",
  "Plantae", 
  "Fungi",
  "Protista",
  "Archaea",
  "Bacteria"
] as const);

// Define the species schema with strict types
const speciesSchema = z.object({
  scientific_name: z.string().trim().min(1),
  common_name: z.string().nullable(),
  kingdom: z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"] as const),
  total_population: z.number().int().positive().min(1).nullable(),
  image: z.string().url().nullable(),
  description: z.string().nullable()
});

type FormData = z.infer<typeof speciesSchema>;
type Species = Database["public"]["Tables"]["species"]["Row"];

interface EditSpeciesDialogProps {
  species: Species;
  onClose: () => void;
}

export default function EditSpeciesDialog({
  species,
  onClose,
}: EditSpeciesDialogProps): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);

  // Define default values with proper type checking
  const defaultValues: FormData = {
    scientific_name: species.scientific_name,
    common_name: species.common_name,
    kingdom: species.kingdom,
    total_population: species.total_population,
    image: species.image,
    description: species.description
  };

  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (input: FormData): Promise<void> => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .update({
        scientific_name: input.scientific_name,
        common_name: input.common_name,
        kingdom: input.kingdom,
        total_population: input.total_population,
        image: input.image,
        description: input.description,
      })
      .eq("id", species.id);

    if (error) {
      toast({
        title: "Error updating species",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    form.reset(defaultValues);
    setOpen(false);
    router.refresh();
    toast({
      title: "Species updated",
      description: `Successfully updated ${input.scientific_name}`,
    });
    onClose();
  };

  const handleOpenChange = (openState: boolean): void => {
    setOpen(openState);
    if (!openState) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Species</DialogTitle>
          <DialogDescription>
            Update the details of this species below, then click "Save Changes."
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e: BaseSyntheticEvent): void => {
              void form.handleSubmit(onSubmit)(e);
            }}
          >
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="scientific_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Scientific Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common_name"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Common Name</FormLabel>
                      <FormControl>
                        <Input
                          value={value ?? ""}
                          placeholder="Common Name"
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="kingdom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kingdom</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value as typeof kingdoms._def.values[number])}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a kingdom" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {kingdoms.options.map((kingdom, index) => (
                            <SelectItem key={index} value={kingdom}>
                              {kingdom}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_population"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Total Population</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={value ?? ""}
                          placeholder="Total Population"
                          {...rest}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input value={value ?? ""} placeholder="Image URL" {...rest} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          value={value ?? ""}
                          placeholder="Description"
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="flex gap-2">
                <Button type="submit" className="ml-1 mr-1 flex-auto">
                  Save Changes
                </Button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    className="ml-1 mr-1 flex-auto"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
