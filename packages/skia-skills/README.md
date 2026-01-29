# React Native Skia Skills

Claude Code skills for React Native Skia development.

## Installation

### Via npx (recommended)

```bash
# Install to current project
npx @shopify/react-native-skia-skills

# Install globally
npx @shopify/react-native-skia-skills --global
```

### Manual Installation

1. Copy `skills/react-native-skia.md` to your project's `.claude/skills/` directory
2. Or copy to `~/.claude/skills/` for global availability

## Usage

In Claude Code, invoke the skill with:

```
/react-native-skia
```

## Building from Source

If you're developing the skill:

```bash
# From the monorepo root
cd packages/skia-skills
npm run build
```

This bundles the documentation from `apps/docs/docs` into the skill file.

## What's Included

The skill bundles the complete React Native Skia documentation:

- Canvas and rendering contexts
- Shapes (Path, Polygons, Ellipses, Box, Vertices, Atlas, Patch)
- Paint properties and styles
- Shaders (Language, Gradients, Images, Colors, Perlin Noise)
- Image filters (Blur, Shadows, Morphology, Displacement, Runtime Shaders)
- Text rendering (Text, Paragraph, Blob, Path, Glyphs)
- Animations (Reanimated 3, Hooks, Gestures, Textures)
- And more...
