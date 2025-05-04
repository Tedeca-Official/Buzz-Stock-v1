
import React from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Package, ShoppingBag, TrendingDown } from "lucide-react";

const Dashboard = () => {
  const { products } = useProducts();

  // Calculate dashboard stats
  const totalProducts = products.length;
  const inStock = products.filter((p) => p.status === "In Stock").length;
  const sold = products.filter((p) => p.status === "Sold").length;
  const lowStock = products.filter((p) => p.status === "In Stock" && p.stock <= 2).length;

  // Get recent products (last 5)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Total Products" 
          value={totalProducts} 
          description="Total products in system"
          icon={<Package className="h-8 w-8 text-savvy-primary" />} 
        />
        <StatCard 
          title="In Stock" 
          value={inStock} 
          description="Products available"
          icon={<ShoppingBag className="h-8 w-8 text-savvy-secondary" />} 
        />
        <StatCard 
          title="Sold" 
          value={sold} 
          description="Products sold"
          icon={<BarChart className="h-8 w-8 text-savvy-accent" />} 
        />
        <StatCard 
          title="Low Stock" 
          value={lowStock} 
          description="Products to reorder"
          icon={<TrendingDown className="h-8 w-8 text-red-500" />} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Recent Products</CardTitle>
            <CardDescription className="dark:text-gray-300">Latest products added to inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex justify-between p-3 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <div>
                    <p className="font-medium dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium dark:text-white">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      Added on {formatDate(product.purchaseDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Category Distribution</CardTitle>
            <CardDescription className="dark:text-gray-300">Products by category</CardDescription>
          </CardHeader>
          <CardContent>
            {getCategoryDistribution(products).map((category) => (
              <div key={category.name} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium dark:text-white">{category.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-300">{category.count} products</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-savvy-primary rounded-full h-2"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="mr-4">{icon}</div>
        <div>
          <h3 className="text-gray-500 dark:text-gray-300 text-sm font-medium">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="ml-1 text-xs text-gray-400 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getCategoryDistribution(products: any[]) {
  const categories: Record<string, number> = {};
  products.forEach(product => {
    if (categories[product.category]) {
      categories[product.category]++;
    } else {
      categories[product.category] = 1;
    }
  });

  const totalProducts = products.length;
  return Object.keys(categories).map(name => ({
    name,
    count: categories[name],
    percentage: Math.round((categories[name] / totalProducts) * 100)
  }));
}

export default Dashboard;
