export default (blockName: string, elementName: string) => {
  if (elementName == null) return blockName;
  return `${blockName}__${elementName}`;
};
