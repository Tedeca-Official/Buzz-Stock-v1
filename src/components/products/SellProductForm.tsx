
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useProducts, Product } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface SellProductFormProps {
  product: Product;
  onComplete: () => void;
}

type FormValues = {
  quantity: number;
  salePrice: number;
  buyerName: string;
};

const SellProductForm: React.FC<SellProductFormProps> = ({ product, onComplete }) => {
  const { markAsSold } = useProducts();
  const { toast } = useToast();
  const { user } = useAuth();
  const [saleDate, setSaleDate] = useState<Date>(new Date());

  const form = useForm<FormValues>({
    defaultValues: {
      quantity: 1,
      salePrice: product.price || 0,
      buyerName: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Ensure the quantity is not more than available stock
      if (data.quantity > product.stock) {
        toast({
          title: "Error",
          description: `Cannot sell more than available stock (${product.stock})`,
          variant: "destructive",
        });
        return;
      }

      // Use the current user's email as the seller and the form input as the buyer
      const sellerName = user?.email?.split('@')[0] || "Unknown";
      
      await markAsSold(
        product.id, 
        saleDate.toISOString().split('T')[0], 
        data.quantity, 
        data.salePrice,
        sellerName,
        data.buyerName // Add buyer name
      );

      toast({
        title: "Product Sold",
        description: `Successfully marked ${product.name} as sold to ${data.buyerName}.`,
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark product as sold.",
        variant: "destructive",
      });
      console.error("Error in SellProductForm:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-gray-500">Current stock: {product.stock}</p>
          <p className="text-sm text-gray-500">Product ID: {product.productId}</p>
        </div>

        <FormField
          control={form.control}
          name="buyerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buyer Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter buyer's name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Sale Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(saleDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={saleDate}
                onSelect={(date) => date && setSaleDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(Math.max(1, parseInt(e.target.value) || 1))} 
                  min={1} 
                  max={product.stock}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ""} // Ensure it can be empty
                  onChange={(e) => field.onChange(e.target.value)} // Allow user to clear input
                  step="0.01" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">
            Complete Sale
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SellProductForm;
