import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/LazyImage";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: any;
  badgeLabel?: string;
  badgeEmoji?: string;
}

const ProductCard = ({ product, badgeLabel, badgeEmoji }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      await addToCart(product.id);
    } catch (error) {
      // Error handled in context
    }
  };

  const inCart = isInCart(product.id);

  return (
    <div className="group bg-white rounded-3xl border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative p-4">
        <Link to={`/product/${product.id}`}>
          {product.product_images && product.product_images.length > 0 ? (
            <LazyImage
              src={product.product_images[0].image_url}
              alt={product["Material Desc"] || "Product"}
              className="w-full h-52 rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
            />
          ) : (
            <div className="w-full h-52 bg-muted rounded-2xl border-2 border-foreground flex items-center justify-center">
              <span className="text-muted-foreground font-display">No Image</span>
            </div>
          )}
        </Link>

        {/* Badge */}
        {badgeLabel && (
          <Badge className="absolute top-6 left-6 bg-accent text-accent-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
            {badgeEmoji ? `${badgeEmoji} ` : ""}{badgeLabel}
          </Badge>
        )}
        {product.QTY && product.QTY <= 3 && product.QTY > 0 && (
          <Badge className="absolute top-6 right-6 bg-secondary text-secondary-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
            🔥 Low Stock
          </Badge>
        )}

        {/* Quick Wishlist */}
        <Button
          size="icon"
          className="absolute top-16 right-6 h-10 w-10 rounded-full bg-accent hover:bg-accent/80 border-2 border-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-5 w-5 fill-white text-white" />
        </Button>
      </div>

      <div className="px-6 pb-6 flex flex-col flex-1">
        <div className="text-xs font-bold text-muted-foreground mb-1 font-display uppercase">
          {product["Brand Desc"]} {product.SubBrand && `• ${product.SubBrand}`}
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-bold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product["Material Desc"]}
          </h3>
        </Link>

        {product.age_range && (
          <Badge variant="outline" className="text-xs mb-3 font-display border-2 w-fit">
            Age: {product.age_range}
          </Badge>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {product.discount_price ? (
            <>
              <span className="text-base font-display text-muted-foreground line-through">
                ₹{product["MRP (INR)"]}
              </span>
              <span className="text-2xl font-display font-bold text-primary">
                ₹{product.discount_price}
              </span>
              <Badge className="bg-primary text-primary-foreground font-bold text-xs border-2 border-foreground">
                {Math.round((1 - product.discount_price / product["MRP (INR)"]) * 100)}% OFF
              </Badge>
            </>
          ) : (
            <span className="text-2xl font-display font-bold text-primary">
              ₹{product["MRP (INR)"]}
            </span>
          )}
        </div>

        {/* Add to Cart Button - pushed to bottom */}
        <div className="mt-auto">
          {inCart ? (
            <Button
              className="w-full rounded-full h-12 font-display font-bold text-base shadow-lg hover-pop border-2 border-foreground"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); }}
              variant="secondary"
              disabled={!product.QTY || product.QTY === 0}
            >
              Go to Cart 🛒
            </Button>
          ) : (
            <Button
              className="w-full rounded-full h-12 font-display font-bold text-base shadow-lg hover-pop border-2 border-foreground"
              onClick={handleAddToCart}
              disabled={!product.QTY || product.QTY === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {!product.QTY || product.QTY === 0 ? "Out of Stock 🚫" : "Add to Cart 🛒"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
