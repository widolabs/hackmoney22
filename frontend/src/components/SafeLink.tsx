import React from "react";
import { Link, LinkProps } from "./Link";

/**
 * https://stackoverflow.com/questions/50709625/link-with-target-blank-and-rel-noopener-noreferrer-still-vulnerable
 */
export function SafeLink(props: LinkProps) {
  return <Link rel="noopener noreferrer" target="_blank" {...props} />;
}
