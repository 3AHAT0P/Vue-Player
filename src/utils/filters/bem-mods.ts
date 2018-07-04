export default (template: string, mods: Hash) => {
  if (mods == null) return template;
  return (Object as any).entries(mods).reduce((res: string[], [key, value]: any[]) => {
    if (value === '@') return `${template}--${key}`;
    res.push(`${template}--${key}-${value}`);
    return res;
  }, [template]).join(' ');
};
