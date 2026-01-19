# Situation Dashboard - Enhancement Roadmap

This document outlines planned improvements and new features for the Situation dashboard application.

---

## Recently Completed

### Map-Centric Dashboard Refactor ✓ COMPLETED

Replaced the grid-based dashboard with a full-screen interactive map interface:

- **Full-screen Leaflet map** as the dashboard background (replaces grid layout)
- **Floating widgets** - Draggable, resizable panels that float over the map
- **Pin system** - Drop pins on the map and link widgets to them
- **Location context** - Clicking a pin opens linked widgets with location data
- **Minimized widget bar** - Collapsed widgets appear in a tray at the bottom
- **Add Widget menu** - Quick access to spawn any widget type
- **Persistent state** - Pins, widgets, and map position saved to localStorage

*Implemented across multiple commits. Key files: `src/components/map-dashboard/`, `src/stores/MapDashboardContext.tsx`, `src/types/pin.types.ts`, `src/types/floating.types.ts`*

### Global Refresh Control ✓ COMPLETED

- Refresh all widgets simultaneously
- Pause/resume all polling
- Show global connection status

*Implemented in commit 6630048: PollingContext with pause/resume, GlobalRefreshControls component with connection status indicator.*

### Notes Widget ✓ COMPLETED

- Quick notes that persist with dashboard
- Markdown support

*Implemented in commit d0f8a04: Notes widget with localStorage persistence.*

### RSS Feed Widget ✓ COMPLETED

- Custom RSS/Atom feed URLs
- Multiple feed support
- Auto-refresh with configurable interval

*Implemented in commit fb594b8: RSS feed widget for subscribing to RSS/Atom feeds.*

---

## Pin System Enhancements

### Pin Categories/Icons
Allow pins to have different icons based on category (e.g., news, flight, location, alert). Custom icon upload support.

### Pin Clustering
When zoomed out, cluster nearby pins into groups showing count. Click to zoom into cluster.

### Pin Search/Filter
Search pins by label. Filter pins by linked widget type or category.

### Pin Import/Export
Export pins as GeoJSON or KML. Import from common formats or paste coordinates.

### Pin Radius Selection
Draw a radius around pins for location-based filtering. Widgets respect the radius when filtering data.

### Pin Groups
Organize pins into named groups (e.g., "Active Incidents", "Monitored Locations"). Toggle group visibility.

---

## Floating Widget Enhancements

### Widget Snapping
Snap widgets to screen edges and other widgets. Grid-based snapping option for alignment.

### Widget Layouts/Presets
Save current widget arrangement as a named layout. Quick-switch between saved layouts.

### Widget Linking
Link widgets together so actions in one affect another:
- Selecting an event centers the map on its location
- Map region selection filters Event Feed results
- Flight tracker syncs with weather widget

### Widget Stacking/Tabbing
Stack multiple widgets into a tabbed container. Drag widgets onto each other to create tabs.

### Picture-in-Picture Mode
Minimize a widget to a small floating thumbnail. Useful for video widgets.

### Widget Lock
Lock widget position/size to prevent accidental moves. Lock button in widget header.

---

## Dashboard-Wide Enhancements

### Theme Toggle UI
Add a visible theme switcher in the dashboard header allowing users to toggle between light, dark, and system themes. Persist preference to localStorage.

### Keyboard Shortcuts
Implement keyboard navigation for power users:
- `Ctrl+N` - Add new widget
- `P` - Toggle add-pin mode
- `Delete` - Remove selected widget
- `Escape` - Close dialogs/cancel modes
- `Ctrl+Z/Y` - Undo/redo actions

### Confirmation Dialogs
Add confirmation prompts before destructive actions:
- Widget deletion
- Pin deletion
- Dashboard clear/reset

### Dashboard Templates
Provide pre-configured dashboard templates:
- "Election Tracker" - Event feed + Polymarket + Map with US regions
- "Flight Monitor" - Flight tracker + Weather + Airport news
- "News Dashboard" - Multiple event feeds + Bluesky + RSS

### Undo/Redo System
Track action history to allow reverting accidental changes with keyboard shortcuts.

### Dashboard Sharing
Generate shareable URL with encoded dashboard state. Optional: cloud sync for cross-device access.

---

## Cross-Widget Communication

### Location Context Integration
Widgets opened from pins receive location context:
- Event Feed filters by pin coordinates + radius
- Weather widget shows conditions for pin location
- Flight tracker shows nearby aircraft

### Time Context
Shared time range filter across widgets. Time slider or date picker affects all time-aware widgets.

### Entity Linking
Click an entity (flight, event, market) to highlight related data in other widgets.

---

## Background Map Enhancements

### Layer Switching
Add tile layer options:
- OpenStreetMap (default)
- Satellite imagery
- Terrain view
- Dark mode tiles
- Weather radar overlay

### Heatmap Mode
Toggle heatmap visualization for:
- Event density
- Pin clustering
- Activity hotspots

### Drawing Tools
Draw regions on the map:
- Rectangle selection
- Polygon drawing
- Circle radius tool
- Use drawn regions to filter widgets

### Location Bookmarks
Save map positions (center + zoom) as named bookmarks. Quick navigation dropdown.

### Map Overlays
Toggle data overlays:
- Country borders
- Time zones
- Flight paths
- Weather systems

---

## Event Feed Widget Enhancements

### Category/Topic Filters
Add dropdown filters for event categories:
- Politics
- Natural disasters
- Conflicts
- Economy
- Technology
- Sports

### Region Filter
Filter events by geographic region:
- Continent selection
- Country dropdown
- Custom region from map selection

### Keyword Alert Notifications
Browser notifications when configured keywords appear in new events. Configurable alert sounds and notification preferences.

### Source Filtering
Filter by news source type or reliability rating.

### Saved Searches
Save and quickly load common search/filter configurations.

---

## Polymarket Widget Enhancements

### Watchlist/Favorites
Star markets to add them to a personal watchlist. Quick access to favorited markets from widget header.

### Multi-Market Comparison
Compare 2-4 markets side by side in a single widget view with synchronized time scales.

### Price Alerts
Configure notifications when market prices cross thresholds (e.g., "Alert me if YES > 60%").

### Category Browsing
Browse available markets by category:
- Politics
- Sports
- Crypto
- Entertainment
- Science

### Outcome History
View resolved markets and their final outcomes for historical analysis.

---

## Flight Tracker Widget Enhancements

### Multi-Flight Tracking
Track 2-3 flights simultaneously on the same map with different colored trails.

### Airport Information
Show departure and arrival airport details:
- Airport name and code
- Terminal/gate information
- Weather conditions
- Delay status

### Weather Integration
Display weather conditions at the aircraft's current position.

### ETA and Status Alerts
Show estimated arrival time and notify on status changes (landing, diverting, delayed).

### Flight Path Prediction
Show predicted flight path to destination.

---

## Bluesky Feed Widget Enhancements

### Thread Expansion
Click to expand and view full conversation threads.

### Media Gallery View
Grid view for posts with media content.

### Post Bookmarking
Save interesting posts for later reference.

### Multi-Column View
Display multiple search queries in separate columns within one widget.

---

## YouTube Widget Enhancements

### Playlist Support
Enter playlist URLs to cycle through videos or display a playlist sidebar.

### Picture-in-Picture
Float video in corner while interacting with other widgets.

---

## New Widget Ideas

### Weather Widget
- Current conditions for selected location (or pin location)
- 7-day forecast
- Severe weather alerts
- Radar overlay option

### Stock/Crypto Ticker
- Real-time price updates
- Sparkline charts
- Watchlist support
- Price alerts

### Web Embed Widget
- Embed any webpage via iframe
- Useful for custom tools/dashboards

### Calendar Widget
- Upcoming events timeline
- Integration with external calendars (Google, Outlook)

### Timer/Countdown Widget
- Countdown to specific dates/events
- Multiple timers support
- Alarm notifications

### Quick Links Widget
- Customizable link grid
- Bookmark important URLs
- Icon/favicon display

---

## Technical Improvements

### Performance
- Implement virtual scrolling for all list-based widgets
- Lazy load widget components
- Optimize re-renders with better memoization
- Debounce map state updates during pan/zoom

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for popovers and menus
- Focus indicators
- Screen reader support
- High contrast mode option

### Loading States
- Skeleton loaders instead of spinners
- Progressive loading for large datasets
- "Stale data" indicators when data is old

### Offline Support
- Offline detection banner
- Queue actions when offline
- Sync when connection restored

### Mobile/Touch Support
- Touch-friendly drag handles
- Pinch to zoom on map
- Responsive floating panel sizes
- Bottom sheet for mobile widget settings
