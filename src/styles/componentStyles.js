const MAIN_COLOR = "#CC2626";
const BUTTON_HOVER_COLOR = "#A62626";
const TEXT_COLOR = "#FFFFFF";
const myStyles = {
  root: {
    flexGrow: 1,
  },
  appBar: {
    background: MAIN_COLOR,
    alignItems: "center",
  },
  toolbar: {
    // align: "center",
  },
  title: {
    // align: "center",
  },
  content: {
    align: "center",
  },
  button: {
    color: TEXT_COLOR,
    background: MAIN_COLOR,
    marginTop: 8,
    borderRadius: 10,
    fontStyle: "normal",
    fontWeight: 500,
    boxShadow:
      "0px 0px 2px rgba(0, 0, 0, 0.12), 0px 2px 2px rgba(0, 0, 0, 0.24)",
    "&:hover": {
      backgroundColor: BUTTON_HOVER_COLOR,
    },
    "&:disabled": {
      backgroundColor: "lightgray",
    },
  },
  boldText: {
    fontWeight: "bold",
  },
  eventTable: {
    maxHeight: window.innerHeight / 2,
  },
  transactDrawer: {
    borderRadius: "32px 32px 0px 0px",
  },
  checkbox: {
    color: MAIN_COLOR,
    "&:checked": {
      color: MAIN_COLOR,
    },
  },
  amountField: {
    borderColor: MAIN_COLOR,
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  closeButton: {
    justifyContent: "left",
    margin: 4,
  },
  slider: {
    color: MAIN_COLOR,
  },
  sliderThumb: {
    "&:hover, &$active": {
      boxShadow: `0 0 0px 8px ${MAIN_COLOR}80`,
    },
  },
  progress: {
    marginTop: 16,
    color: MAIN_COLOR,
  },
  passwordEnter: {
    margin: 24,
    border: `2px solid ${MAIN_COLOR}`,
    boxSizing: "border-box",
    borderRadius: "32px",
  },
  headerText: {
    textAlign: "center",
  },
};

export { myStyles, MAIN_COLOR };
