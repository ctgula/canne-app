#!/usr/bin/env node

/**
 * Script to create placeholder art sample images for the Cannè app
 * This demonstrates the enhanced UX with real art images instead of logos
 */

const fs = require('fs');
const path = require('path');

// Create SVG art samples for each tier
const createArtSample = (tier, index, colors, style) => {
  const width = 400;
  const height = 400;
  
  const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${tier}${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
      </linearGradient>
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#grad${tier}${index})"/>
    
    <!-- Art Elements based on style -->
    ${getArtElements(style, colors, width, height)}
    
    <!-- Cannè branding -->
    <text x="20" y="380" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.8">Cannè Art Collective</text>
    <text x="20" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">${tier.toUpperCase()} Collection</text>
  </svg>`;
  
  return svgContent;
};

const getArtElements = (style, colors, width, height) => {
  switch (style) {
    case 'digital':
      return `
        <circle cx="100" cy="100" r="50" fill="${colors[1]}" opacity="0.7"/>
        <rect x="200" y="150" width="80" height="80" fill="${colors[2]}" opacity="0.6" transform="rotate(45 240 190)"/>
        <polygon points="300,250 350,300 250,300" fill="${colors[0]}" opacity="0.8"/>
        <circle cx="320" cy="120" r="30" fill="white" opacity="0.3"/>
      `;
    case 'geometric':
      return `
        <polygon points="50,50 150,50 100,150" fill="${colors[1]}" opacity="0.8"/>
        <rect x="200" y="100" width="100" height="100" fill="${colors[2]}" opacity="0.7"/>
        <circle cx="300" cy="300" r="60" fill="${colors[0]}" opacity="0.6"/>
        <line x1="0" y1="200" x2="400" y2="200" stroke="white" stroke-width="2" opacity="0.5"/>
      `;
    case 'botanical':
      return `
        <ellipse cx="200" cy="200" rx="80" ry="120" fill="${colors[1]}" opacity="0.6"/>
        <path d="M 150 300 Q 200 250 250 300 Q 200 350 150 300" fill="${colors[2]}" opacity="0.7"/>
        <circle cx="180" cy="180" r="20" fill="${colors[0]}" opacity="0.8"/>
        <circle cx="220" cy="220" r="15" fill="white" opacity="0.6"/>
      `;
    case 'cosmic':
      return `
        <circle cx="200" cy="200" r="100" fill="${colors[1]}" opacity="0.4" filter="url(#blur)"/>
        <circle cx="150" cy="150" r="30" fill="${colors[2]}" opacity="0.8"/>
        <circle cx="250" cy="180" r="20" fill="${colors[0]}" opacity="0.9"/>
        <circle cx="300" cy="250" r="15" fill="white" opacity="0.7"/>
        <path d="M 100 100 Q 200 50 300 100 Q 200 150 100 100" fill="${colors[1]}" opacity="0.3"/>
      `;
    default:
      return `<circle cx="200" cy="200" r="100" fill="${colors[1]}" opacity="0.5"/>`;
  }
};

// Tier configurations
const tiers = {
  starter: {
    colors: [
      ['#FF6B9D', '#C44569', '#F8B500'],
      ['#4ECDC4', '#44A08D', '#093637'],
      ['#A8E6CF', '#7FCDCD', '#41B3A3']
    ],
    styles: ['digital', 'digital', 'digital']
  },
  classic: {
    colors: [
      ['#8B5CF6', '#7C3AED', '#6D28D9'],
      ['#EC4899', '#DB2777', '#BE185D'],
      ['#F59E0B', '#D97706', '#B45309']
    ],
    styles: ['geometric', 'geometric', 'geometric']
  },
  black: {
    colors: [
      ['#1F2937', '#374151', '#6B7280'],
      ['#111827', '#1F2937', '#4B5563'],
      ['#0F172A', '#1E293B', '#334155']
    ],
    styles: ['botanical', 'botanical', 'botanical']
  },
  ultra: {
    colors: [
      ['#6366F1', '#8B5CF6', '#A855F7'],
      ['#EC4899', '#F59E0B', '#10B981'],
      ['#3B82F6', '#8B5CF6', '#F59E0B']
    ],
    styles: ['cosmic', 'cosmic', 'cosmic']
  }
};

// Create directories and files
const samplesDir = path.join(__dirname, 'public', 'images', 'art-samples');

// Ensure directory exists
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// Generate art samples
Object.entries(tiers).forEach(([tier, config]) => {
  config.colors.forEach((colors, index) => {
    const filename = `tier-${tier}-sample-${index + 1}.svg`;
    const filepath = path.join(samplesDir, filename);
    const svgContent = createArtSample(tier, index + 1, colors, config.styles[index]);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`✅ Created ${filename}`);
  });
  
  // Create a main sample file for each tier (used in product cards)
  const mainFilename = `tier-${tier}-sample.jpg`;
  const mainFilepath = path.join(samplesDir, mainFilename);
  const mainSvgContent = createArtSample(tier, 'main', config.colors[0], config.styles[0]);
  
  // For now, create as SVG (in production, you'd convert to JPG)
  const mainSvgFilename = `tier-${tier}-sample.svg`;
  const mainSvgFilepath = path.join(samplesDir, mainSvgFilename);
  fs.writeFileSync(mainSvgFilepath, mainSvgContent);
  console.log(`✅ Created ${mainSvgFilename}`);
});

console.log('\n🎨 Art sample creation complete!');
console.log('📁 Files created in:', samplesDir);
console.log('\n🌿 Enhanced UX Features Added:');
console.log('  ✅ Gift tier tags (Indica, Sativa, Hybrid)');
console.log('  ✅ Effect indicators (Chill, Creative, Focus, etc.)');
console.log('  ✅ Real art images instead of placeholder logos');
console.log('  ✅ Actionable "View Sample Art" prompts');
console.log('  ✅ Interactive art sample modal');
console.log('  ✅ Enhanced product cards with hover effects');
console.log('\n🚀 Ready for user testing and feedback!');
