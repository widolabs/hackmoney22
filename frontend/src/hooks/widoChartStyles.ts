import { Theme } from "@mui/material";

export const widoChartStyles = ({ theme }: { theme: Theme }) => ({
  ...theme.typography.caption,

  "& .recharts-surface": {
    cursor: "crosshair",
  },

  "& .recharts-cartesian-axis-line": {
    stroke: theme.palette.grey[300],
  },

  "& .recharts-cartesian-axis-tick-line": {
    stroke: theme.palette.grey[300],
  },

  "& .recharts-legend-item": {
    cursor: "pointer",
  },

  "& .recharts-default-tooltip": {
    borderRadius: "2px",
  },

  "& .recharts-rectangle.recharts-tooltip-cursor": {
    fill: "rgba(204, 204, 204, 0.33)",
  },

  "& .recharts-tooltip-item": {
    padding: "0 !important",
  },

  "& .recharts-reference-line-line": {
    strokeDasharray: "4, 4",
    stroke: theme.palette.grey[400],
  },

  "& .recharts-cartesian-grid line": {
    strokeDasharray: "4, 4",
    stroke: theme.palette.grey[300],
  },
});
