import i18n from '@/lib/i18n';

/**
 * Translate an enum value using the i18n enums section.
 * Falls back to the raw value if no translation exists.
 *
 * Usage:
 *   tEnum('requestStatus', 'PENDING')        → "In asteptare" (RO) / "Pending" (EN)
 *   tEnum('resourceCategory', 'MEETING_ROOM') → "Sala de sedinte" (RO)
 */
export function tEnum(enumGroup: string, value: string): string {
  const key = `enums.${enumGroup}.${value}`;
  const translated = i18n.t(key);
  return translated === key ? value : translated;
}
