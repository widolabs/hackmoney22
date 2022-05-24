import {
  Checkbox,
  darken,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { widoChartStyles } from "../hooks/widoChartStyles";
import { formatAsShortCurrency } from "../utils/number";

const StyledBarChart = styled(BarChart)(widoChartStyles);

const data = [
  {
    name: "USDC",
    "Total issuance": 49179894108, // May 1st
    "Cash reserves": 49179894108, // May 1st
  },
  {
    name: "UST", // May 1st
    "Total issuance": 18561479012, // May 1st
    "LFG collateral": 1000000000, // May 1st
    "Protocol market cap": 27145587486, // Luna – May 1st
  },
  // {
  //   name: "UST", // May 12th
  //   "Total issuance": 15682326993, // May 10th – coingecko
  //   "LFG collateral": 1000000000, // May 10th
  //   "Protocol market cap": 11693885984, // Luna – May 10th
  // },
  {
    name: "DAI",
    "Total issuance": 8459041180, // May 1st – coingecko
    // https://makerburn.com/#/rundown
    "Other collateral": (13.14 - 4.37 - 1.24 - 5.96) * 1000000000, // May 1st – defillama
    "USDC collateral": 4.37 * 1000000000, // May 1st – defillama
    "WBTC collateral": 1.24 * 1000000000, // May 1st – defillama
    "ETH collateral": 5.96 * 1000000000, // May 1st – defillama
    // https://www.coingecko.com/en/coins/maker
    "Protocol market cap": 1291718700, // May 1st
  },
  {
    name: "FRAX",
    // https://www.coingecko.com/en/coins/frax
    "Total issuance": 2702884757, // May 1st – coingecko
    "USDC collateral": 2702884757 * 0.8675,
    // https://www.coingecko.com/en/coins/frax-share
    "Protocol market cap": 1414776804, // May 1st – coingecko
  },
  // {
  //   name: "MIM",
  //   "Total issuance": 1873964111,
  //   // http://dashboard.abracadabra.money/
  //   "UST collateral": 0.8925 * 1000000000,
  //   "wMEMO collateral": 0.3787 * 1000000000,
  //   "yvFTM collateral": 0.2756 * 1000000000,
  //   "ETH collateral": 0.2079 * 1000000000,
  //   "Other collateral": (3.24 - 0.8925 - 0.2756 - 0.2079 - 0.3787) * 1000000000,
  //   // https://www.coingecko.com/en/coins/spell-token
  //   "Protocol market cap": 124317947,
  // },
  {
    name: "LUSD",
    "Total issuance": 479105000, // May 1st – dune
    // https://dune.com/dani/Liquity
    "ETH collateral": 1010020000, // May 1st – dune
    // https://www.coingecko.com/en/coins/liquity
  },
];

export function StablecoinCollateralizationPage() {
  const [logScale, setLogScale] = useState(false);
  const [showList, setShowList] = useState([
    "USDC",
    "UST",
    "DAI",
    "FRAX",
    // "MIM",
    "LUSD",
  ]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogScale(event.target.checked);
  };

  const filteredData = data.filter((item) => showList.includes(item.name));

  return (
    <>
      <Stack
        height="100vh"
        flexGrow={1}
        alignItems="center"
        spacing={1}
        padding={2}
      >
        <FormControl variant="outlined" sx={{ width: 240, paddingBottom: 10 }}>
          <InputLabel id="select-coins-label">Coins</InputLabel>
          <Select
            multiple
            labelId="select-coins-label"
            value={showList}
            label="Coins"
            onChange={(event) => {
              setShowList(event.target.value as string[]);
            }}
          >
            <MenuItem value="USDC">USDC</MenuItem>
            <MenuItem value="UST">UST</MenuItem>
            <MenuItem value="DAI">DAI</MenuItem>
            <MenuItem value="FRAX">FRAX</MenuItem>
            {/* <MenuItem value="MIM">MIM</MenuItem> */}
            <MenuItem value="LUSD">LUSD</MenuItem>
          </Select>
        </FormControl>
        <Paper elevation={21} sx={{ padding: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h4">Stablecoin collateralization</Typography>
            <FormControlLabel
              componentsProps={{ typography: { variant: "caption" } }}
              control={
                <Checkbox
                  size="1px"
                  checked={logScale}
                  onChange={handleChange}
                />
              }
              label="Logarithmic scale"
            />
          </Stack>
          <StyledBarChart
            width={800}
            height={450}
            data={filteredData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              axisLine={false}
              dataKey="name"
              padding={{ left: 4, right: 4 }}
            />
            <YAxis
              axisLine={false}
              allowDataOverflow
              scale={logScale ? "log" : "linear"}
              domain={logScale ? [50000000, 100000000000] : [0, "auto"]}
              padding={{ top: 16 }}
              tickFormatter={(value) => formatAsShortCurrency(value)}
            />
            <Tooltip formatter={(value) => formatAsShortCurrency(value, 2)} />
            <Legend />
            <Bar dataKey="Total issuance" fill="#000000" />
            <Bar dataKey="Cash reserves" stackId="collateral" fill="#85bb65" />
            <Bar dataKey="ETH collateral" stackId="collateral" fill="#8A3DFF" />
            <Bar
              dataKey="WBTC collateral"
              stackId="collateral"
              fill="#ffbb11"
            />
            <Bar
              dataKey="USDC collateral"
              stackId="collateral"
              fill="#2775CA"
            />

            <Bar dataKey="UST collateral" stackId="collateral" fill="#3FB1F7" />
            <Bar
              dataKey="wMEMO collateral"
              stackId="collateral"
              fill="#23C23E"
            />
            <Bar
              dataKey="yvFTM collateral"
              stackId="collateral"
              fill="#F88C4F"
            />
            <Bar dataKey="LFG collateral" stackId="collateral" fill="#FA5449" />
            <Bar
              dataKey="Other collateral"
              stackId="collateral"
              fill="#A8A8A8"
            />
            <Bar dataKey="Protocol market cap" fill="#f5c360" />
          </StyledBarChart>
          <Typography variant="caption">
            Last update: May 1, 2022 by joinwido.com
          </Typography>
        </Paper>
      </Stack>
    </>
  );
}
