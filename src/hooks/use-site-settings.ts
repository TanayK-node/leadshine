import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteSetting = (key: string) => {
  const [value, setValue] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSetting();
  }, [key]);

  const fetchSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) throw error;
      setValue(data?.value === true);
    } catch {
      setValue(false);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (newValue: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: newValue as any, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
      setValue(newValue);
      return true;
    } catch {
      return false;
    }
  };

  return { value, loading, updateSetting, refetch: fetchSetting };
};
