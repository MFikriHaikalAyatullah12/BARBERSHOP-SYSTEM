import { format, addMinutes, startOfDay, endOfDay, isBefore, isAfter, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDate(date: Date, pattern: string = 'dd MMMM yyyy'): string {
  return format(date, pattern, { locale: id })
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm', { locale: id })
}

export function formatDateTime(date: Date): string {
  return format(date, 'dd MMMM yyyy, HH:mm', { locale: id })
}

export function formatDateTimeShort(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: id })
}

export function addDurationToDate(date: Date, durationInMinutes: number): Date {
  return addMinutes(date, durationInMinutes)
}

export function getStartOfDay(date: Date): Date {
  return startOfDay(date)
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date)
}

export function isTimeSlotAvailable(
  startTime: Date,
  endTime: Date,
  existingBookings: Array<{ startTime: Date; endTime: Date }>
): boolean {
  for (const booking of existingBookings) {
    // Check if the new booking overlaps with existing booking
    if (
      (isBefore(startTime, booking.endTime) && isAfter(endTime, booking.startTime)) ||
      (isBefore(booking.startTime, endTime) && isAfter(booking.endTime, startTime))
    ) {
      return false
    }
  }
  return true
}

export function generateTimeSlots(
  startHour: number = 9, // 9 AM
  endHour: number = 19, // 7 PM
  intervalMinutes: number = 30
): Array<{ value: string; label: string }> {
  const slots: Array<{ value: string; label: string }> = []
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push({
        value: time,
        label: time
      })
    }
  }
  
  return slots
}

export function isValidBookingTime(dateTime: Date): boolean {
  const now = new Date()
  const hour = dateTime.getHours()
  const dayOfWeek = dateTime.getDay()
  
  // Check if booking is not on Sunday (0 = Sunday)
  if (dayOfWeek === 0) {
    return false
  }
  
  // Check if booking is within operating hours (9 AM - 7 PM)
  if (hour < 9 || hour >= 19) {
    return false
  }
  
  // Check if booking is not in the past
  if (dateTime < now) {
    return false
  }
  
  // For today, check if time is at least 1 hour from now
  const today = new Date()
  const isToday = dateTime.toDateString() === today.toDateString()
  
  if (isToday) {
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000))
    if (dateTime < oneHourFromNow) {
      return false
    }
  }
  
  return true
}

export function getBookingDateRange(): { minDate: string; maxDate: string } {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + 30) // Allow booking up to 30 days in advance
  
  return {
    minDate: tomorrow.toISOString().split('T')[0],
    maxDate: maxDate.toISOString().split('T')[0]
  }
}

export function parseDateTimeString(dateString: string, timeString: string): Date {
  // Create date in local timezone
  const dateTime = new Date(`${dateString}T${timeString}:00`)
  return dateTime
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  return addMinutes(startTime, durationMinutes)
}

export function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 6 // Monday to Saturday
}

export function getNextBusinessDay(date: Date = new Date()): Date {
  const nextDay = new Date(date)
  nextDay.setDate(date.getDate() + 1)
  
  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1)
  }
  
  return nextDay
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} jam`
  }
  
  return `${hours} jam ${remainingMinutes} menit`
}