
import React, { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddProductFormProps {
  onComplete: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onComplete }) => {
  const { addProduct } = useProducts();
  const { toast } = useToast();
  
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [stock, setStock] = useState("1");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!productId || !name || !category || !purchaseDate || !stock || !price) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addProduct({
        productId,
        name,
        category,
        purchaseDate,
        status: "In Stock",
        stock: parseInt(stock, 10),
        price: parseFloat(price),
      });

      toast({
        title: "Product Added",
        description: `${name} has been added to inventory.`,
      });
      
      // Reset form
      setProductId("");
      setName("");
      setCategory("");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setStock("1");
      setPrice("");
      
      onComplete();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Predefined categories
  const categories = [
    "Mobile Phones",
    "Laptops",
    "Tablets",
    "Accessories",
    "Other",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productId">Product ID *</Label>
          <Input
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g. iph13"
            required
            className="rounded-lg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. iPhone 13 Pro"
            required
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            required
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock">Initial Stock *</Label>
          <Input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="1"
            required
            className="rounded-lg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Purchase Price ($) *</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onComplete}
          disabled={isSubmitting}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-savvy-primary hover:bg-savvy-primary/90 rounded-full"
        >
          {isSubmitting ? "Adding Product..." : "Add Product"}
        </Button>
      </div>
    </form>
  );
};

export default AddProductForm;
