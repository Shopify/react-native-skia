import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/installation"
          >
            Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

// eslint-disable-next-line import/no-default-export
export default function Home() {
  //const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="React Native Skia"
      description="High Performance 2D Graphics"
    >
      <HomepageHeader />
      <main />
    </Layout>
  );
}
