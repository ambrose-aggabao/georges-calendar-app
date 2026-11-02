# George's Calendar App

A simple, Google Calendar–style desktop calendar with reminders, a monkey of the month, and a 🍌 on every holiday.

## Start it
Double-click **George's Calendar App** on the Desktop or in the Start menu.
(To recreate the shortcuts: `powershell -ExecutionPolicy Bypass -File Install.ps1`)

## Use it
- **Create** an event with the Create button, or click any day or time slot.
- Click an event to edit or delete it.
- Views: Day / Week / Month. Keyboard: `T` today, `D` `W` `M` views, `C` create, `←` `→` previous/next.
- **Reminders** pop up inside the app with a chime, and as a Windows notification if you allow it.
  They fire while the app is open (it can be minimized).

## Where things live
- Your events: `%APPDATA%\GeorgesCalendar\events.json`
- App files: `app\` (UI), `georges_calendar.pyw` (launcher), `tools\make_icon.py` (rebuilds the icon from `app\logo.svg`)

Requires Python 3 and Microsoft Edge (both already on Windows 11 setups like this one).
