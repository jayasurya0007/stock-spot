
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMap = React.forwardRef(({ center, markers }, ref) => {
	const containerRef = useRef(null);
	const mapInstance = useRef(null);

	// Expose setView to parent via ref
	React.useImperativeHandle(ref, () => ({
		setView: (coords, zoom = 13) => {
			if (mapInstance.current) {
				mapInstance.current.setView(coords, zoom);
			}
		}
	}), []);

	useEffect(() => {
		// Remove any existing map instance
		if (mapInstance.current) {
			mapInstance.current.remove();
			mapInstance.current = null;
		}
		if (!containerRef.current) return;
		// Create map
		const map = L.map(containerRef.current).setView(center, 13);
		mapInstance.current = map;
		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(map);
		// Add markers
		markers.forEach(({ position, popup }) => {
			L.marker(position).addTo(map).bindPopup(popup);
		});
		// Cleanup on unmount
		return () => {
			map.remove();
			mapInstance.current = null;
		};
	}, [center, markers]);

	return (
		<div ref={containerRef} style={{ height: 400, width: '100%', borderRadius: '12px' }} />
	);
});

export default LeafletMap;
