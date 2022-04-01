const formatSort = (sort: string): string => {
  switch (sort) {
    case "on":
      return "on";
    case "lh":
      return "lh";
    case "hl":
      return "hl";
    default:
      return "no";
  }
};

export default formatSort;
