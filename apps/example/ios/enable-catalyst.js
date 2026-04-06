#!/usr/bin/env node
// Script to enable Mac Catalyst support on the ReactTestApp project

const fs = require('fs');
const path = require('path');

const iosDir = __dirname;
const reactTestAppProject = path.join(iosDir, '../node_modules/.generated/ios/ReactTestApp.xcodeproj/project.pbxproj');
const podsProject = path.join(iosDir, 'Pods/Pods.xcodeproj/project.pbxproj');

function enableCatalystInProject(projectPath, projectName) {
  if (!fs.existsSync(projectPath)) {
    console.log(`⚠️  Project not found at ${projectPath}`);
    return;
  }

  console.log(`Enabling Mac Catalyst support in ${projectName}...`);

  let content = fs.readFileSync(projectPath, 'utf8');
  let modified = content;

  // Replace SUPPORTS_MACCATALYST = NO with YES
  modified = modified.replace(/SUPPORTS_MACCATALYST = NO/g, 'SUPPORTS_MACCATALYST = YES');

  // If SUPPORTS_MACCATALYST doesn't exist at all, add it to all buildSettings sections
  if (!content.includes('SUPPORTS_MACCATALYST')) {
    // Find all buildSettings blocks and add SUPPORTS_MACCATALYST after PRODUCT_NAME
    modified = modified.replace(
      /(buildSettings = \{[^}]*PRODUCT_NAME = [^;]+;)/g,
      '$1\n\t\t\t\tSUPPORTS_MACCATALYST = YES;'
    );
  }

  // Also add SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD if not present
  if (!modified.includes('SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD')) {
    modified = modified.replace(
      /SUPPORTS_MACCATALYST = YES;/g,
      'SUPPORTS_MACCATALYST = YES;\n\t\t\t\tSUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = YES;'
    );
  }

  if (content !== modified) {
    fs.writeFileSync(projectPath, modified, 'utf8');
    console.log(`  ✅ Mac Catalyst support enabled in ${projectName}`);
  } else {
    console.log(`  ℹ️  Mac Catalyst already enabled in ${projectName}`);
  }
}

// Enable on ReactTestApp project
enableCatalystInProject(reactTestAppProject, 'ReactTestApp');

// Enable on Pods project
enableCatalystInProject(podsProject, 'Pods');

console.log('✅ Done! Mac Catalyst support is now enabled.');
