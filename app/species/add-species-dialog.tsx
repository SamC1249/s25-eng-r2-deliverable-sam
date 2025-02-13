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
import { useState, type BaseSyntheticEvent, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define kingdom enum for use in the schema and select dropdown
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

// Define the species schema using Zod for validation
const speciesSchema = z.object({
  scientific_name: z.string().trim().min(1).transform((val) => val?.trim()),
  common_name: z
    .string()
    .nullable()
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z
    .string()
    .url()
    .nullable()
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  description: z
    .string()
    .nullable()
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

type FormData = z.infer<typeof speciesSchema>;

// Define Wikipedia API response types
interface WikipediaSearchResponse {
  query?: {
    search?: Array<{
      title: string;
    }>;
  };
}

interface WikipediaDetailsResponse {
  query?: {
    pages: Record<
      string,
      {
        extract?: string;
        thumbnail?: {
          source: string;
        };
      }
    >;
  };
}

// Provide default values for the form fields
const defaultValues: Partial<FormData> = {
  scientific_name: "",
  common_name: null,
  kingdom: "Animalia",
  total_population: null,
  image: null,
  description: null,
};

export default function AddSpeciesDialog({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  // Function to search Wikipedia and autofill the description and image
  const handleSearch = async (): Promise<void> => {
    if (!searchQuery.trim()) {
      toast({ title: "Please enter a search term.", variant: "destructive" });
      return;
    }
    try {
      // Query Wikipedia's search API for the species name
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
          searchQuery
        )}&utf8=&origin=*`
      );
      const searchData = (await searchResponse.json()) as WikipediaSearchResponse;

      if (!searchData?.query?.search || searchData.query.search.length === 0) {
        toast({ title: "No matching article found.", variant: "destructive" });
        return;
      }

      // Use the first search result
      const firstResult = searchData.query.search[0];
      if (!firstResult) {
        toast({ title: "No search results found.", variant: "destructive" });
        return;
      }

      const pageTitle = firstResult.title;

      // Retrieve the article's extract and image from Wikipedia
      const detailsResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=500&redirects=1&titles=${encodeURIComponent(
          pageTitle
        )}&origin=*`
      );
      const detailsData = (await detailsResponse.json()) as WikipediaDetailsResponse;

      const pages = detailsData.query?.pages;
      if (!pages) {
        toast({
          title: "Error fetching data",
          description: "No pages found in Wikipedia data.",
          variant: "destructive",
        });
        return;
      }

      // Ensure that a page ID exists before using it as an index (fixing TS2538)
      const pageKeys = Object.keys(pages);
      if (pageKeys.length === 0) {
        toast({
          title: "Error fetching data",
          description: "No pages available for the provided search term.",
          variant: "destructive",
        });
        return;
      }

      const page = pages[pageKeys[0] as any];
      if (!page) {
        toast({
          title: "Error fetching data",
          description: "No page data available for the provided search term.",
          variant: "destructive",
        });
        return;
      }

      const description = page.extract || "";
      const imageUrl = page.thumbnail ? page.thumbnail.source : "";

      // Autofill the form fields for description and image
      form.setValue("description", description);
      form.setValue("image", imageUrl);

      toast({
        title: "Wikipedia data loaded successfully!",
        description: `Data for "${pageTitle}" loaded.`,
      });
    } catch (error) {
      console.error("Error fetching Wikipedia data:", error);
      toast({
        title: "Error fetching data",
        description: "An error occurred while fetching Wikipedia data.",
        variant: "destructive",
      });
    }
  };

  // Submit handler for adding a species to Supabase
  const onSubmit = async (input: FormData): Promise<void> => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").insert([
      {
        author: userId,
        common_name: input.common_name,
        description: input.description,
        kingdom: input.kingdom,
        scientific_name: input.scientific_name,
        total_population: input.total_population,
        image: input.image,
      },
    ]);

    if (error) {
      toast({ title: "Something went wrong.", description: error.message, variant: "destructive" });
      return;
    }

    // Reset the form and close the dialog.
    form.reset(defaultValues);
    setOpen(false);
    router.refresh();
    toast({
      title: "New species added!",
      description: `Successfully added ${input.scientific_name}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Icons.add className="mr-3 h-5 w-5" />
          Add Species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Species</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new species to the database.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Input
            placeholder="Search Wikipedia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleSearch} variant="secondary" className="w-full">
            Search Wikipedia
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
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
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a kingdom" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {kingdoms.options.map((kingdom) => (
                            <SelectItem key={kingdom} value={kingdom}>
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
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                        <Input
                          value={value ?? ""}
                          placeholder="Image URL"
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
                <Button type="submit" className="flex-1">
                  Add Species
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" className="flex-1">
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
