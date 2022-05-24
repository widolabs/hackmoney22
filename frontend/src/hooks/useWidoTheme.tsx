import { createTheme, PaletteColor, ThemeProvider } from "@mui/material";
import { green, grey, red } from "@mui/material/colors";
import createPalette from "@mui/material/styles/createPalette";
import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { noop } from "../utils/utils";

type WidoThemeConfig = {
  menuDrawerWidth: number;
  filterDrawerWidth: number;
  filterDrawerWidthXS: string;
  filterDrawerWidthXL: number;
  zIndexAppbar: number;
  zIndexMenuDrawer: number;
};

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: PaletteColor;
    accent: PaletteColor;
    positive: PaletteColor;
    negative: PaletteColor;
  }
  interface PaletteOptions {
    tertiary?: PaletteColor;
    accent?: PaletteColor;
    positive?: PaletteColor;
    negative?: PaletteColor;
  }
  interface Theme {
    wido: WidoThemeConfig;
  }
  interface ThemeOptions {
    wido: WidoThemeConfig;
  }
}
declare module "@mui/system/createTheme/shape" {
  interface Shape {
    borderRadiusFab: number;
  }
}

declare module "@mui/material/styles/createTypography" {
  interface Typography {
    number: {
      fontFeatureSettings: string;
      fontFamily: string;
    };
    monospace: {
      fontVariantNumeric: string;
    };
  }
  interface TypographyOptions {
    number: {
      fontFeatureSettings: string;
      fontFamily: string;
    };
    monospace: {
      fontVariantNumeric: string;
    };
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    accent: true;
    tertiary: true;
    positive: true;
    negative: true;
  }
}
declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    accent: true;
    tertiary: true;
    positive: true;
    negative: true;
  }
}
declare module "@mui/material/Badge" {
  interface BadgePropsColorOverrides {
    accent: true;
    tertiary: true;
    positive: true;
    negative: true;
  }
}

export const initialState: WidoTheme = {
  darkMode: false,
};

export type WidoTheme = {
  darkMode: boolean;
};

export type WidoThemeAPI = {
  widoTheme: WidoTheme;
  toggleDarkMode: () => void;
};

const WidoThemeContext = createContext<WidoThemeAPI>({
  widoTheme: initialState,
  toggleDarkMode: noop,
});

interface WidoThemeProviderProps {
  children?: ReactNode;
}

export const WidoThemeProvider = (props: WidoThemeProviderProps) => {
  const { children } = props;

  const [widoTheme, setWidoTheme] = useState<WidoTheme>(initialState);

  const widoThemeApi: WidoThemeAPI = useMemo(
    () => ({
      widoTheme,
      toggleDarkMode: () => {
        setWidoTheme((prev) => ({ darkMode: !prev.darkMode }));
      },
    }),
    [widoTheme, setWidoTheme]
  );

  const palette = useMemo(
    () =>
      createPalette({
        mode: widoTheme.darkMode ? "dark" : "light",
        action: widoTheme.darkMode
          ? {
              hover: "rgba(255, 255, 255, 0.15)",
              hoverOpacity: 0.15,
            }
          : {
              hover: "rgba(0, 0, 0, 0.15)",
              hoverOpacity: 0.15,
            },
        background: widoTheme.darkMode
          ? {}
          : {
              default: "#f3f3f3",
            },
        primary: {
          main: "#25BE90",
        },
        secondary: {
          main: widoTheme.darkMode ? grey[200] : grey[800],
        },
      }),
    [widoTheme]
  );

  const accent = useMemo(
    () =>
      palette.augmentColor({
        color: {
          main: "#1f0047",
        },
        name: "accent",
      }),
    [palette]
  );

  const tertiary = useMemo(
    () =>
      palette.augmentColor({
        color: {
          main: widoTheme.darkMode ? grey[800] : grey[50],
        },
        name: "tertiary",
      }),
    [palette, widoTheme]
  );

  const positive = useMemo(
    () =>
      palette.augmentColor({
        color: {
          // `success` uses green[800]
          main: green[700],
        },
        name: "positive",
      }),
    [palette]
  );

  const negative = useMemo(
    () =>
      palette.augmentColor({
        color: {
          // `error` uses red[700]
          main: red[600],
        },
        name: "negative",
      }),
    [palette]
  );

  const muiTheme = useMemo(() => {
    const menuDrawerWidth = 260;
    const containerMaxWidth = 1200;

    const theme = createTheme({
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          // xl: 1536,
          xl: containerMaxWidth + menuDrawerWidth,
        },
      },
      palette: {
        ...palette,
        accent,
        tertiary,
        positive,
        negative,
      },
      shape: {
        borderRadiusFab: 24,
      },
      transitions: {
        duration: {
          complex: 375,
          standard: 300,
          enteringScreen: 225,
          leavingScreen: 195,
          short: 140, // @default 250
          shorter: 120, // @default 200
          shortest: 80, // @default 150
        },
      },
      mixins: {
        toolbar: {
          minHeight: 56,
          "@media all": {
            minHeight: 56,
          },
        },
      },
      wido: {
        menuDrawerWidth: 260,
        filterDrawerWidth: 220,
        filterDrawerWidthXS: "100%",
        filterDrawerWidthXL: 260,
        zIndexAppbar: 1201,
        zIndexMenuDrawer: 1202,
      },
      typography: {
        fontFamily: [
          "'Montserrat'",
          "'Helvetica'",
          "'Arial'",
          "sans-serif",
        ].join(","),
        number: {
          // https://rsms.me/inter/#features/ss01
          // https://rsms.me/inter/#features/ss02
          fontFeatureSettings: "'ss01' on, 'ss02' on",
          // https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-number
          fontFamily: "Inter, monospace !important",
        },
        monospace: {
          fontVariantNumeric: "tabular-nums",
        },
      },
      components: {
        MuiInput: {
          styleOverrides: {
            input: {
              "&::placeholder": {
                opacity: 0.66,
              },
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            input: {
              "&::placeholder": {
                opacity: 0.66,
              },
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: ({ theme }) => ({
              padding: theme.spacing(2),
            }),
          },
        },
        MuiDialogActions: {
          styleOverrides: {
            root: ({ theme }) => ({
              padding: theme.spacing(2),
            }),
          },
        },
      },
    });

    theme.shadows[21] = "0 0 0 1px rgb(0 0 0 / 12%);";
    theme.shadows[22] = "0 0 0 1px rgb(0 0 0 / 50%);";

    return theme;
  }, [palette, accent, tertiary, positive, negative]);
  console.log("📜 LOG > muiTheme", muiTheme);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", widoTheme.darkMode);
  }, [widoTheme]);

  return (
    <WidoThemeContext.Provider value={widoThemeApi}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </WidoThemeContext.Provider>
  );
};

export const useWidoTheme = () => useContext(WidoThemeContext);
