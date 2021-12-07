/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      collapsed: false,
      type: "category",
      label: "Getting started",
      items: ["getting-started/installation", "getting-started/hello-world"],
    },
    {
      collapsed: false,
      type: "category",
      label: "Paint",
      items: ["paint/overview", "paint/properties"],
    },
    {
      collapsed: false,
      type: "category",
      label: "Shaders",
      items: [
        "shaders/language",
        "shaders/images",
        "shaders/gradients",
        "shaders/perlin-noise",
        "shaders/colors",
      ],
    },
    {
      type: "doc",
      label: "Transformations",
      id: "transformations",
    },
    {
      type: "doc",
      label: "Images",
      id: "images",
    },
    {
      type: "doc",
      label: "Group",
      id: "group",
    },
    {
      type: "doc",
      label: "Runtime Effects",
      id: "runtime-effects",
    },
    {
      collapsed: false,
      type: "category",
      label: "Shapes",
      items: ["circle"],
    },
    {
      collapsed: false,
      type: "category",
      label: "Animations",
      items: ["animations"],
    },
  ],
};

module.exports = sidebars;
