import React, { ForwardedRef, forwardRef } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { SystemStyleObject, Theme } from "@mui/system";
import { AppBarProps, Container, Stack } from "@mui/material";

export type WidoAppBarProps = Pick<AppBarProps, "sx"> & {
  sx?: SystemStyleObject<Theme>;
  onIconClick: () => void;
  title?: string;
  /**
   * @default <MenuIcon />
   */
  icon?: JSX.Element;
  /**
   * @default false
   */
  iconAlwaysVisible?: boolean;
  /**
   * @default false
   */
  hideTitleOnMobile?: boolean;
  subContent?: JSX.Element;
  titleContent?: JSX.Element;
};

const WidoAppBar = forwardRef(
  (props: WidoAppBarProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      onIconClick: handleDrawerToggle,
      sx,
      title,
      icon = <MenuIcon />,
      iconAlwaysVisible = false,
      hideTitleOnMobile = false,
      subContent,
      titleContent,
      ...rest
    } = props;

    let iconSxDisplay;
    if (!iconAlwaysVisible) {
      iconSxDisplay = { md: "none" };
    }

    return (
      <AppBar
        ref={ref}
        position="fixed"
        sx={(theme) => ({
          zIndex: theme.wido.zIndexAppbar,
          [theme.breakpoints.up("md")]: {
            paddingLeft: `${theme.wido.menuDrawerWidth}px`,
            paddingRight: `${theme.wido.filterDrawerWidth}px`,
          },
          [theme.breakpoints.up("xl")]: {
            paddingRight: `${theme.wido.filterDrawerWidthXL}px`,
          },
          ...sx,
        })}
        {...rest}
      >
        <Toolbar disableGutters sx={{ paddingY: 1 }}>
          <Container>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack
                direction="row"
                alignItems="flex-start"
                spacing={1}
                flexGrow={1}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ display: iconSxDisplay }}
                >
                  {icon}
                </IconButton>
                <Stack
                  direction="row"
                  alignItems="center"
                  flexWrap="wrap"
                  flexGrow={1}
                >
                  {title && (
                    <Typography
                      sx={{
                        display: hideTitleOnMobile
                          ? { xs: "none", sm: "block" }
                          : "block",
                        paddingY: 0.5,
                        marginRight: 1,
                      }}
                      variant="h6"
                      noWrap
                    >
                      {title}
                    </Typography>
                  )}
                  {titleContent}
                </Stack>
              </Stack>
              {subContent}
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
    );
  }
);

WidoAppBar.displayName = "WidoAppBar";

export default WidoAppBar;
