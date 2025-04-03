# The Final Cut - Wood Cutting Optimizer

A browser-based wood cutting optimization tool that helps woodworkers efficiently plan their cuts and minimize waste.

TheFinalCut is a professional-grade web application that helps woodworkers optimize their material usage and plan their cuts efficiently. The project consists of several key components:

Carpenter's Calculator:
Precise measurement input system with feet, inches, and fractions
Real-time calculation and conversion
Interactive interface with a unique sawdust visual effect that follows the mouse cursor

Cut List Management:
Dynamic cut list creation and modification
Ability to specify dimensions and quantities for multiple pieces
Interactive table interface for easy management of cutting requirements
Cutting Optimization Engine:

Uses the binpacking algorithm to optimize material usage
Calculates the most efficient way to cut pieces from standard sheets
Takes into account blade kerf (cutting width) in calculations
Multi-sheet support with navigation between different sheet layouts
Documentation & Export:

PDF export functionality for cut lists and layouts
Detailed reporting including sheet dimensions, quantities, and cutting efficiency
Visual representations of cutting layouts
Efficiency calculations for material usage

The application is built on Node.js with Express for the backend server, and uses modern JavaScript for the frontend. It includes interactive features like a canvas-based visualization of cutting layouts and a unique UI enhancement that creates animated sawdust particles following the mouse cursor, adding a playful yet professional touch to the interface.

This is a practical tool aimed at helping woodworkers reduce waste, save time in planning cuts, and maintain accurate documentation of their cutting plans.


## Features

- Carpenter's Calculator for easy measurement conversions
- Cut list management with width, length, and quantity
- Blade kerf adjustment
- Visual cutting layout preview
- No installation required - runs entirely in the browser

## How to Use

1. Simply open `TheFinalCut.html` in your web browser
2. Use the Carpenter's Calculator on the left to convert measurements
3. Configure your stock sheet dimensions and blade kerf
4. Add pieces to your cut list with their dimensions and quantities
5. Click "Optimize Cuts" to see the cutting layout

## Technical Details

- Built with pure JavaScript - no backend required
- Uses HTML5 Canvas for layout visualization
- Responsive design with Bootstrap 5
- Simple first-fit optimization algorithm

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas:
- Chrome
- Firefox
- Safari
- Edge
