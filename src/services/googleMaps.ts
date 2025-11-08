export function loadGoogleMaps(apiKey: string, libraries: string[] = ['places']): Promise<typeof window.google> {
  return new Promise((resolve, reject) => {
    if (!apiKey) return reject(new Error('Google Maps API key missing'));
    if ((window as any).google && (window as any).google.maps) {
      return resolve(window.google);
    }

    const id = `gmaps-script-${apiKey}`;
    if (document.getElementById(id)) {
      // script present but google may not be ready yet
      const check = () => {
        if ((window as any).google && (window as any).google.maps) resolve(window.google);
        else setTimeout(check, 50);
      };
      return check();
    }

    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.defer = true;
    const libs = libraries.length ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}${libs}&v=weekly`;
    script.onerror = (e) => reject(new Error('Failed to load Google Maps script'));
    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) resolve(window.google);
      else reject(new Error('Google Maps SDK not available after load'));
    };
    document.head.appendChild(script);
  });
}