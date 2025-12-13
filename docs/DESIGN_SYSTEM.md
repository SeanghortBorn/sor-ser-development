# Design System Standards

## Overview
This document outlines the standardized design system applied across the application for consistency, cleanliness, and a modern minimalist aesthetic.

## Core Design Principles
- **Minimalist**: Clean, uncluttered interfaces with ample white space
- **Consistent**: Uniform spacing, rounded corners, and transitions
- **Modern**: Smooth animations and hover effects
- **Accessible**: Clear visual hierarchy and readable typography

## Design Tokens

### Rounded Corners
```css
rounded-2xl    /* 1rem / 16px - Primary standard for cards, buttons, sections */
rounded-xl     /* 0.75rem / 12px - Secondary (legacy, being phased out) */
rounded-full   /* Full circle - For badges, avatars, pills */
```

**Usage:**
- All cards and containers: `rounded-2xl`
- All buttons: `rounded-2xl`
- Metric boxes within cards: `rounded-2xl`
- Input fields: `rounded-2xl`

### Spacing System

#### Padding
```css
p-8     /* Standard card padding: 2rem / 32px */
p-6     /* Smaller nested elements: 1.5rem / 24px */
p-12    /* Large hero sections: 3rem / 48px */
p-16    /* Extra large sections: 4rem / 64px */

/* Asymmetric padding */
px-8 py-3.5    /* Buttons: horizontal 2rem, vertical 0.875rem */
px-5 py-2.5    /* Small buttons: horizontal 1.25rem, vertical 0.625rem */
```

**Standard Usage:**
- Main page container: `p-8`
- Cards and sections: `p-8`
- Nested content boxes: `p-6`
- Hero sections: `py-20 px-12` or `p-12 md:p-16`

#### Margins
```css
mb-8     /* Standard section bottom margin: 2rem */
mb-6     /* Smaller spacing: 1.5rem */
mb-16    /* Large section spacing: 4rem */
mb-24    /* Extra large page end spacing: 6rem */

mt-20    /* Top spacing for major sections */
```

**Standard Usage:**
- Between major sections: `mb-8`
- Between subsections: `mb-6`
- Page endings: `mb-24`

#### Gaps (Grid/Flex)
```css
gap-8    /* Standard grid gap: 2rem */
gap-6    /* Smaller grid gap: 1.5rem */
gap-3    /* Button groups: 0.75rem */
```

**Standard Usage:**
- Card grids: `gap-8`
- Metric grids: `gap-6` or `gap-8`
- Button groups: `gap-3`

### Shadows
```css
shadow-sm              /* Subtle shadow for cards at rest */
hover:shadow-md        /* Medium shadow on hover */
hover:shadow-lg        /* Large shadow for CTAs and important elements */
shadow-lg              /* Persistent large shadow for hero sections */
hover:shadow-xl        /* Extra large shadow for hero hover */
```

**Standard Usage:**
- Default card state: `shadow-sm`
- Card hover state: `hover:shadow-md`
- Important buttons/CTAs: `shadow-sm hover:shadow-lg`
- Hero sections: `shadow-lg hover:shadow-xl`

### Transitions
```css
transition-all duration-200 ease-in-out    /* Standard smooth transition */
```

**Standard Usage:**
- All interactive elements should include this
- Combines with hover effects for smooth animations

### Hover Effects
```css
hover:scale-105        /* Subtle zoom for buttons */
hover:scale-[1.02]     /* Very subtle zoom for cards */
active:scale-95        /* Press down effect for buttons */
hover:shadow-md        /* Shadow increase for cards */
hover:shadow-lg        /* Shadow increase for buttons */
```

**Standard Usage:**
- Buttons: `hover:scale-105 active:scale-95 hover:shadow-lg`
- Cards: `hover:scale-[1.02] hover:shadow-md`
- Interactive elements: Combine scale with shadow changes

## Component Standards

### Cards
```jsx
<div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-8">
  {/* Content */}
</div>
```

### Metric Cards (Small)
```jsx
<div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-8">
  <p className="text-sm text-gray-600">Label</p>
  <p className="text-3xl font-bold text-blue-600">Value</p>
</div>
```

### Buttons (Primary)
```jsx
<button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95 shadow-sm">
  Button Text
</button>
```

### Buttons (Secondary/Outline)
```jsx
<button className="px-8 py-3.5 border-2 border-white text-white rounded-2xl font-semibold transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95 hover:bg-white shadow-sm">
  Button Text
</button>
```

### Grid Layouts
```jsx
{/* 4-column metric grid */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
  {/* Cards */}
</div>

{/* 2-column chart grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
  {/* Charts */}
</div>

{/* 3-column feature grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Features */}
</div>
```

### Hero Sections
```jsx
<div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl py-20 px-12 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
  {/* Hero content */}
</div>
```

### Section Containers
```jsx
<section className="mb-16 w-full">
  {/* Section content */}
</section>
```

## Color Palette

### Primary Colors
- Blue: `bg-blue-600`, `text-blue-600`, `hover:bg-blue-700`
- Indigo: `bg-indigo-600`, `from-blue-600 to-indigo-600`

### Success/Error/Warning
- Green: `bg-green-600`, `text-green-600`
- Red: `bg-red-600`, `text-red-600`
- Orange: `bg-orange-600`, `text-orange-600`
- Purple: `bg-purple-600`, `text-purple-600`

### Neutral Colors
- Gray backgrounds: `bg-gray-50`, `bg-gray-100`
- Gray text: `text-gray-600`, `text-gray-700`, `text-gray-900`
- White: `bg-white`

## Typography

### Headings
```css
text-3xl font-bold                  /* Page titles */
text-2xl font-bold                  /* Section titles */
text-lg font-semibold               /* Subsection titles */
text-sm font-medium                 /* Card labels */
```

### Body Text
```css
text-base                           /* Regular body text */
text-sm                             /* Secondary text */
text-xs                             /* Small notes/captions */
```

## Implementation Checklist

When creating or updating components:

- [ ] Use `rounded-2xl` for all cards and major elements
- [ ] Apply `p-8` for card padding
- [ ] Use `gap-8` for grid layouts
- [ ] Add `mb-8` between major sections
- [ ] Include `shadow-sm hover:shadow-md` on cards
- [ ] Add `transition-all duration-200 ease-in-out` to interactive elements
- [ ] Use `hover:scale-105` and `active:scale-95` on buttons
- [ ] Apply `hover:scale-[1.02]` on cards
- [ ] Ensure consistent spacing with `gap-6` or `gap-8`
- [ ] Use standardized button padding: `px-8 py-3.5`

## Updated Files

### Currently Updated
1. `/resources/js/Pages/Users/ArticleDetail.jsx` ✅
2. `/resources/js/Pages/Homes/index.jsx` ✅
3. `/resources/js/Pages/Homes/FeatureCard.jsx` ✅
4. `/resources/js/Pages/Users/Progress.jsx` ✅ (partial)

### To Be Updated
- Libraries page
- User management pages
- Settings pages
- Form components
- Modal components
- Navigation components

## Benefits

### User Experience
- More modern and professional appearance
- Cleaner, less cluttered interface
- Better visual hierarchy
- Smoother interactions

### Developer Experience
- Easier to maintain consistency
- Faster development with standard patterns
- Clear guidelines for new features
- Reduced decision fatigue

### Performance
- Consistent use of CSS classes improves caching
- Smooth transitions enhance perceived performance
- Optimized spacing reduces layout shifts

## Migration Guide

To update existing components:

1. Replace `rounded-xl` → `rounded-2xl`
2. Replace `p-6` → `p-8` (for main cards)
3. Replace `gap-6` → `gap-8` (for main grids)
4. Replace `mb-6` → `mb-8` (for section spacing)
5. Add `hover:shadow-md` to all cards
6. Ensure all buttons have scale hover effects
7. Update padding: `px-4 py-2` → `px-5 py-2.5` or `px-8 py-3.5`
8. Increase section margins for better breathing room

## Notes

- Always test responsive behavior after applying changes
- Maintain accessibility standards (contrast, focus states)
- Use consistent transition timing across all components
- Consider dark mode support for future iterations
