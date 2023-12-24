export const getLanguageFromCode = (code: string) =>
  new Intl.DisplayNames(['en'], {type: 'language'}).of(code);
