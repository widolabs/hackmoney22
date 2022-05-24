import React, { ForwardedRef } from "react";
import { Typography, TypographyProps } from "@mui/material";
import { WarningRounded } from "@mui/icons-material";
import { orange } from "@mui/material/colors";

type RefType = ForwardedRef<HTMLDivElement>;

const OldLabel = React.forwardRef((props: TypographyProps, ref: RefType) => {
  const { color = orange[700], sx, ...rest } = props;

  return (
    <Typography
      ref={ref}
      variant="subtitle2"
      component="span"
      sx={{
        display: "inline-flex",
        color,
        ...sx,
      }}
      {...rest}
    >
      <WarningRounded fontSize="small" sx={{ marginRight: 0.5 }} />
      Old
    </Typography>
  );
});
OldLabel.displayName = "OldLabel";

export default OldLabel;
