"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    mappls: any;
    initMap1: () => void;
  }
}

export function TestMapplsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Mappls Map
  const initializeMap = () => {
    if (!mapRef.current || !window.mappls) {
      console.log('❌ Map container or Mappls SDK not ready');
      return;
    }

    try {
      console.log('🗺️ Initializing Mappls Map...');
      
      // Create the map exactly like in your HTML example
      const map = new window.mappls.Map(mapRef.current, {
        // Default Indore center coordinates
        center: [75.8577, 22.7196],
        zoom: 18
      });

      // Set zoom level as specified in your HTML
      map.setZoom(18);
      
      setMapInstance(map);
      setLoading(false);
      console.log('✅ Mappls map initialized successfully!');
      
    } catch (err) {
      console.error('❌ Mappls map initialization failed:', err);
      setError(`Map initialization failed: ${err}`);
      setLoading(false);
    }
  };

  // Load Mappls SDK script
  useEffect(() => {
    if (window.mappls) {
      console.log('✅ Mappls SDK already loaded');
      initializeMap();
      return;
    }

    console.log('📦 Loading Mappls SDK...');
    
    // Define the global callback function
    window.initMap1 = () => {
      console.log('✅ Mappls SDK callback triggered');
      setTimeout(() => {
        initializeMap();
      }, 100);
    };

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://apis.mappls.com/advancedmaps/api/b8a5269c-04a7-42cf-8501-3b1371f1ed73/map_sdk?layer=vector&v=3.0&callback=initMap1';
    script.defer = true;
    script.async = true;
    
    script.onload = () => {
      console.log('📦 Mappls script loaded');
    };
    
    script.onerror = (err) => {
      console.error('❌ Failed to load Mappls script:', err);
      setError('Failed to load Mappls SDK');
      setLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (window.initMap1) {
        delete window.initMap1;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-96 bg-red-100 border border-red-300 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-red-600 text-xl mb-2">❌</div>
          <div className="text-red-800 font-semibold">Map Loading Failed</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-96 bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-blue-800 font-semibold">Loading Mappls Map...</div>
          <div className="text-blue-600 text-sm mt-1">Initializing JavaScript SDK</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
