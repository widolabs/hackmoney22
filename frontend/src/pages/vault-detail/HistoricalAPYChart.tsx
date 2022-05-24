import React, { memo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  Legend,
  ComposedChart,
  ResponsiveContainer,
} from "recharts";

import { formatAsPercentage, formatAsShortNumber } from "../../utils/number";
import { HistoricalAPYRaw } from "../../state/apiSlice";
import { styled, Theme, useMediaQuery, useTheme } from "@mui/material";
import { shortDateFormat } from "../../utils/date";
import { widoChartStyles } from "../../hooks/widoChartStyles";

let StyledComposedChart = styled(ComposedChart)(widoChartStyles);
StyledComposedChart = styled(StyledComposedChart)(
  ({ theme }: { theme: Theme }) => ({
    "& .legend-item-0:not(.inactive) .recharts-legend-icon": {
      fill: theme.palette.grey[800],
    },

    "& .legend-item-0:not(.inactive) .recharts-legend-item-text": {
      color: `${theme.palette.grey[800]} !important`,
    },
  })
);

type HistoricalAPYChartProps = {
  handleMouseLeave: () => void;
  tooltipFormatter: (value, name, props) => void;
  data: HistoricalAPYRaw[];
  inactiveAxis: "tvl" | "net_apy" | "";
  setInactiveAxis: (axis: "tvl" | "net_apy" | "") => void;
  todaysValue: HistoricalAPYRaw;
};

export const HistoricalAPYChart = memo((props: HistoricalAPYChartProps) => {
  const {
    handleMouseLeave,
    tooltipFormatter,
    data,
    inactiveAxis,
    setInactiveAxis,
    todaysValue,
  } = props;

  const theme = useTheme();
  const mobileScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ResponsiveContainer>
      <StyledComposedChart
        data={[...data, todaysValue]}
        onMouseLeave={handleMouseLeave}
        margin={{ top: 12 }}
      >
        <XAxis
          padding={{ left: 4, right: 4 }}
          dataKey="timestamp"
          tickFormatter={shortDateFormat}
          interval="preserveStartEnd"
          // minTickGap={7}
          // tickCount={7}
        />
        <YAxis
          hide={mobileScreen}
          padding={{ bottom: 4 }}
          dataKey="net_apy"
          tickFormatter={(value: number) => formatAsPercentage(value, 0)}
          // domain={["auto", "dataMax"]}
        />
        <YAxis
          hide={mobileScreen}
          padding={{ bottom: 4 }}
          orientation="right"
          dataKey="tvl"
          yAxisId="tvlAxis"
          tickFormatter={(value: number) => `$${formatAsShortNumber(value, 0)}`}
          // domain={["auto", "dataMax"]}
        />
        <Legend
          onClick={(data) => {
            const { inactive, dataKey } = data;

            if (inactive) {
              setInactiveAxis("");
            } else {
              setInactiveAxis(dataKey);
            }
          }}
        />
        <Bar
          hide={inactiveAxis === "tvl"}
          name="Total value locked"
          yAxisId="tvlAxis"
          dataKey="tvl"
          fill={theme.palette.grey["300"]}
          barSize={4}
        />
        <Tooltip
          isAnimationActive={false}
          contentStyle={{ display: "none" }}
          formatter={tooltipFormatter}
          cursor={{ stroke: theme.palette.grey["500"], strokeWidth: 1.5 }}
        />
        <Line
          hide={inactiveAxis === "net_apy"}
          name="APY"
          type="monotone"
          dataKey="net_apy"
          stroke={theme.palette.positive.main}
          dot={false}
          strokeWidth={2.5}
        />
      </StyledComposedChart>
    </ResponsiveContainer>
  );
});
HistoricalAPYChart.displayName = "HistoricalAPYChart";
