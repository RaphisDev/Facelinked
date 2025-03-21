import "../global.css"
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

const SIDEBAR_WIDTH = 220;

// This component injects CSS for web platform only
export default function WebSidebarStyles() {
    useEffect(() => {
        // Only run on web platform
        if (Platform.OS === 'web') {
            // Create a style element
            const styleEl = document.createElement('style');

            // Define CSS for sidebar and content positioning
            styleEl.innerHTML = `
        @media (min-width: 769px) {
          /* Fixed sidebar styles */
          .web-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            width: ${SIDEBAR_WIDTH}px;
            background-color: white;
            box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            overflow-y: auto;
          }
          
          /* Main content styles */
          .web-main-content {
            margin-left: ${SIDEBAR_WIDTH}px;
          }
        }
      `;

            // Add style to document head
            document.head.appendChild(styleEl);

            // Clean up on unmount
            return () => {
                document.head.removeChild(styleEl);
            };
        }
    }, []);

    // This component doesn't render anything visible
    return null;
}