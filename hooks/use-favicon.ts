import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SiteSettings } from '@shared/types';

/**
 * Hook to dynamically update favicon from settings
 */
export function useFavicon() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/admin/settings'],
  });

  useEffect(() => {
    if (settings?.favicon) {
      // Find existing favicon link
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      
      if (!link) {
        // Create new favicon link if it doesn't exist
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      
      // Update favicon href
      link.href = settings.favicon;
    }
  }, [settings?.favicon]);
}
