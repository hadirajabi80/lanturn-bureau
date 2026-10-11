const DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Western → Persian digits. */
export const fa = (v: number | string) => String(v).replace(/\d/g, (d) => DIGITS[+d]);

export const WIN_LABEL = {
  single: 'برد ساده',
  mars: 'مارس!',
  backgammon: 'مارس کامل!',
} as const;

export const COLOR_NAME = ['سفید', 'سیاه'] as const;
