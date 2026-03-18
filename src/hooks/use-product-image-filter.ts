import { useSiteSetting } from "./use-site-settings";

/**
 * Filters products based on the admin site setting "show_only_products_with_images".
 * When enabled, only products that have at least one image in product_images are shown.
 */
export const useProductImageFilter = () => {
  const { value: showOnlyWithImages, loading } = useSiteSetting('show_only_products_with_images');

  const filterProducts = <T extends { product_images?: any[] }>(products: T[]): T[] => {
    if (!showOnlyWithImages) return products;
    return products.filter(p => p.product_images && p.product_images.length > 0);
  };

  return { filterProducts, loading, showOnlyWithImages };
};
