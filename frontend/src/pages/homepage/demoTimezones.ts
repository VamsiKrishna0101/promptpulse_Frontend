export type TimezoneOption = {
  value: string
  label: string
}

const COUNTRY_TIMEZONES: Record<string, TimezoneOption[]> = {
  IN: [{ value: "Asia/Kolkata", label: "India Standard Time" }],
  US: [
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "America/Anchorage", label: "Alaska Time" },
    { value: "Pacific/Honolulu", label: "Hawaii Time" },
  ],
  CA: [
    { value: "America/Toronto", label: "Eastern Time" },
    { value: "America/Winnipeg", label: "Central Time" },
    { value: "America/Edmonton", label: "Mountain Time" },
    { value: "America/Vancouver", label: "Pacific Time" },
  ],
  AU: [
    { value: "Australia/Sydney", label: "Sydney / Melbourne" },
    { value: "Australia/Brisbane", label: "Brisbane" },
    { value: "Australia/Adelaide", label: "Adelaide" },
    { value: "Australia/Perth", label: "Perth" },
  ],
  GB: [{ value: "Europe/London", label: "United Kingdom" }],
  IE: [{ value: "Europe/Dublin", label: "Ireland" }],
  DE: [{ value: "Europe/Berlin", label: "Germany" }],
  FR: [{ value: "Europe/Paris", label: "France" }],
  IT: [{ value: "Europe/Rome", label: "Italy" }],
  ES: [{ value: "Europe/Madrid", label: "Spain" }],
  NL: [{ value: "Europe/Amsterdam", label: "Netherlands" }],
  BE: [{ value: "Europe/Brussels", label: "Belgium" }],
  CH: [{ value: "Europe/Zurich", label: "Switzerland" }],
  AT: [{ value: "Europe/Vienna", label: "Austria" }],
  SE: [{ value: "Europe/Stockholm", label: "Sweden" }],
  NO: [{ value: "Europe/Oslo", label: "Norway" }],
  DK: [{ value: "Europe/Copenhagen", label: "Denmark" }],
  FI: [{ value: "Europe/Helsinki", label: "Finland" }],
  PL: [{ value: "Europe/Warsaw", label: "Poland" }],
  PT: [
    { value: "Europe/Lisbon", label: "Portugal mainland" },
    { value: "Atlantic/Azores", label: "Azores" },
  ],
  GR: [{ value: "Europe/Athens", label: "Greece" }],
  TR: [{ value: "Europe/Istanbul", label: "Turkey" }],
  UA: [{ value: "Europe/Kyiv", label: "Ukraine" }],
  RO: [{ value: "Europe/Bucharest", label: "Romania" }],
  CZ: [{ value: "Europe/Prague", label: "Czech Republic" }],
  HU: [{ value: "Europe/Budapest", label: "Hungary" }],
  BG: [{ value: "Europe/Sofia", label: "Bulgaria" }],
  HR: [{ value: "Europe/Zagreb", label: "Croatia" }],
  RS: [{ value: "Europe/Belgrade", label: "Serbia" }],
  SI: [{ value: "Europe/Ljubljana", label: "Slovenia" }],
  SK: [{ value: "Europe/Bratislava", label: "Slovakia" }],
  LT: [{ value: "Europe/Vilnius", label: "Lithuania" }],
  LV: [{ value: "Europe/Riga", label: "Latvia" }],
  EE: [{ value: "Europe/Tallinn", label: "Estonia" }],
  IS: [{ value: "Atlantic/Reykjavik", label: "Iceland" }],
  RU: [
    { value: "Europe/Moscow", label: "Moscow" },
    { value: "Asia/Yekaterinburg", label: "Yekaterinburg" },
    { value: "Asia/Novosibirsk", label: "Novosibirsk" },
    { value: "Asia/Vladivostok", label: "Vladivostok" },
  ],
  CN: [{ value: "Asia/Shanghai", label: "China" }],
  HK: [{ value: "Asia/Hong_Kong", label: "Hong Kong" }],
  SG: [{ value: "Asia/Singapore", label: "Singapore" }],
  MY: [{ value: "Asia/Kuala_Lumpur", label: "Malaysia" }],
  ID: [
    { value: "Asia/Jakarta", label: "Western Indonesia" },
    { value: "Asia/Makassar", label: "Central Indonesia" },
    { value: "Asia/Jayapura", label: "Eastern Indonesia" },
  ],
  PH: [{ value: "Asia/Manila", label: "Philippines" }],
  TH: [{ value: "Asia/Bangkok", label: "Thailand" }],
  VN: [{ value: "Asia/Ho_Chi_Minh", label: "Vietnam" }],
  JP: [{ value: "Asia/Tokyo", label: "Japan" }],
  KR: [{ value: "Asia/Seoul", label: "South Korea" }],
  TW: [{ value: "Asia/Taipei", label: "Taiwan" }],
  BD: [{ value: "Asia/Dhaka", label: "Bangladesh" }],
  PK: [{ value: "Asia/Karachi", label: "Pakistan" }],
  LK: [{ value: "Asia/Colombo", label: "Sri Lanka" }],
  NP: [{ value: "Asia/Kathmandu", label: "Nepal" }],
  AE: [{ value: "Asia/Dubai", label: "United Arab Emirates" }],
  SA: [{ value: "Asia/Riyadh", label: "Saudi Arabia" }],
  QA: [{ value: "Asia/Qatar", label: "Qatar" }],
  KW: [{ value: "Asia/Kuwait", label: "Kuwait" }],
  BH: [{ value: "Asia/Bahrain", label: "Bahrain" }],
  OM: [{ value: "Asia/Muscat", label: "Oman" }],
  IL: [{ value: "Asia/Jerusalem", label: "Israel" }],
  JO: [{ value: "Asia/Amman", label: "Jordan" }],
  LB: [{ value: "Asia/Beirut", label: "Lebanon" }],
  EG: [{ value: "Africa/Cairo", label: "Egypt" }],
  ZA: [{ value: "Africa/Johannesburg", label: "South Africa" }],
  NG: [{ value: "Africa/Lagos", label: "Nigeria" }],
  KE: [{ value: "Africa/Nairobi", label: "Kenya" }],
  MA: [{ value: "Africa/Casablanca", label: "Morocco" }],
  MX: [
    { value: "America/Mexico_City", label: "Mexico City" },
    { value: "America/Tijuana", label: "Baja California" },
  ],
  BR: [
    { value: "America/Sao_Paulo", label: "Sao Paulo" },
    { value: "America/Manaus", label: "Amazonas" },
  ],
  AR: [{ value: "America/Argentina/Buenos_Aires", label: "Argentina" }],
  CL: [{ value: "America/Santiago", label: "Chile" }],
  CO: [{ value: "America/Bogota", label: "Colombia" }],
  PE: [{ value: "America/Lima", label: "Peru" }],
  VE: [{ value: "America/Caracas", label: "Venezuela" }],
  UY: [{ value: "America/Montevideo", label: "Uruguay" }],
  PY: [{ value: "America/Asuncion", label: "Paraguay" }],
  EC: [{ value: "America/Guayaquil", label: "Ecuador" }],
  NZ: [{ value: "Pacific/Auckland", label: "New Zealand" }],
}

const DEFAULT_TIMEZONE: TimezoneOption = { value: "Etc/UTC", label: "UTC" }

export function getTimezonesForCountry(countryCode?: string | null) {
  if (!countryCode) return [DEFAULT_TIMEZONE]
  return COUNTRY_TIMEZONES[countryCode.toUpperCase()] ?? [DEFAULT_TIMEZONE]
}

export function getCountryFromBrowserLocale() {
  try {
    const locale = new Intl.Locale(navigator.language)
    return locale.region ?? "IN"
  } catch {
    return "IN"
  }
}
