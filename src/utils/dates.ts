/** A visit date is a calendar date, not a UTC timestamp. */
export function visitDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year,month,day]=value.split('-').map(Number);
    return new Date(year,month-1,day,12);
  }
  return new Date(value);
}
export function todayLocal(): string {
  const date=new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
