'use client'

import { useStore } from '@/lib/store'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar, X, Clock, MapPin, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// ─── Helpers ───────────────────────────────────────────────────────────────
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Config ────────────────────────────────────────────────────────────────
const TODAY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
const TODAY_ISO = isoDate(TODAY)
const HOUR_START = 7
const HOUR_END   = 20
const SLOT_H     = 56 // px par heure

function getMonday(d: Date) {
  const copy = new Date(d)
  const day  = copy.getDay() || 7
  copy.setDate(copy.getDate() - day + 1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function parseHeure(h: string) {
  const [hh, mm] = h.replace('h', ':').split(':').map(Number)
  return hh + (mm || 0) / 60
}

function topPx(hour: number) {
  return (hour - HOUR_START) * SLOT_H
}

const DAYS_FR  = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_SHORT = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']

const STATUT_STYLE: Record<string, { bar: string; bg: string; text: string; dot: string; badge: string }> = {
  nouveau:  { bar: 'bg-blue-500',   bg: 'bg-blue-50  border-blue-200',  text: 'text-blue-800',   dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700'   },
  en_cours: { bar: 'bg-orange-500', bg: 'bg-orange-50 border-orange-200',text: 'text-orange-800', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  termine:  { bar: 'bg-green-500',  bg: 'bg-green-50  border-green-200', text: 'text-green-800',  dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700'  },
  annule:   { bar: 'bg-gray-400',   bg: 'bg-gray-50   border-gray-200',  text: 'text-gray-600',   dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-500'   },
}

// ─── Mini-calendrier picker ─────────────────────────────────────────────────
type PickerMode = 'days' | 'months' | 'years'

function MiniCalendar({
  selected,
  onSelect,
  onClose,
}: {
  selected: Date
  onSelect: (d: Date) => void
  onClose: () => void
}) {
  const [view, setView] = useState<PickerMode>('days')
  const [cursor, setCursor] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function click(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', click)
    return () => document.removeEventListener('mousedown', click)
  }, [onClose])

  const decadeStart = Math.floor(cursor.getFullYear() / 10) * 10

  function buildDays() {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const start = new Date(first)
    const dow   = (first.getDay() + 6) % 7
    start.setDate(1 - dow)
    const cells: Date[] = []
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(start))
      start.setDate(start.getDate() + 1)
    }
    return cells
  }

  return (
    <div
      ref={ref}
      className="absolute z-50 top-10 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 select-none"
      style={{ minWidth: 272 }}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => {
            if (view === 'days')   setCursor(c => new Date(c.getFullYear(), c.getMonth() - 1, 1))
            if (view === 'months') setCursor(c => new Date(c.getFullYear() - 1, c.getMonth(), 1))
            if (view === 'years')  setCursor(c => new Date(c.getFullYear() - 10, c.getMonth(), 1))
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {view !== 'years' && (
            <button
              onClick={() => setView('months')}
              className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors px-1 rounded"
            >
              {MONTHS_FR[cursor.getMonth()]}
            </button>
          )}
          <button
            onClick={() => setView(view === 'years' ? 'days' : 'years')}
            className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors px-1 rounded"
          >
            {view === 'years' ? `${decadeStart} – ${decadeStart + 9}` : cursor.getFullYear()}
          </button>
        </div>

        <button
          onClick={() => {
            if (view === 'days')   setCursor(c => new Date(c.getFullYear(), c.getMonth() + 1, 1))
            if (view === 'months') setCursor(c => new Date(c.getFullYear() + 1, c.getMonth(), 1))
            if (view === 'years')  setCursor(c => new Date(c.getFullYear() + 10, c.getMonth(), 1))
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {view === 'days' && (
        <>
          <div className="grid grid-cols-7 mb-1">
            {DAYS_FR.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {buildDays().map((d, i) => {
              const iso = isoDate(d)
              const isThisMonth = d.getMonth() === cursor.getMonth()
              const isToday     = iso === TODAY_ISO
              const isSelected  = iso === isoDate(selected)
              return (
                <button
                  key={i}
                  onClick={() => { onSelect(d); onClose() }}
                  className={`
                    w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-all
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                    ${isToday && !isSelected ? 'border-2 border-blue-500 text-blue-600 font-bold' : ''}
                    ${!isSelected && !isToday && isThisMonth ? 'text-gray-700 hover:bg-blue-50' : ''}
                    ${!isThisMonth && !isSelected ? 'text-gray-300 hover:bg-gray-50' : ''}
                  `}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </>
      )}

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {MONTHS_SHORT.map((m, i) => {
            const isCurrent = i === new Date().getMonth() && cursor.getFullYear() === new Date().getFullYear()
            const isSelected = i === selected.getMonth() && cursor.getFullYear() === selected.getFullYear()
            return (
              <button
                key={i}
                onClick={() => {
                  setCursor(new Date(cursor.getFullYear(), i, 1))
                  setView('days')
                }}
                className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  isSelected ? 'bg-blue-600 text-white' : isCurrent ? 'border-2 border-blue-400 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          {Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i).map(y => {
            const isSelected = y === selected.getFullYear()
            const isNow      = y === TODAY.getFullYear()
            const isDecade   = y >= decadeStart && y < decadeStart + 10
            return (
              <button
                key={y}
                onClick={() => {
                  setCursor(new Date(y, cursor.getMonth(), 1))
                  setView('months')
                }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected ? 'bg-blue-600 text-white' :
                  isNow      ? 'border-2 border-blue-400 text-blue-600' :
                  !isDecade  ? 'text-gray-300 hover:bg-gray-50' :
                               'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {y}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => { onSelect(TODAY); setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)); setView('days') }}
          className="w-full text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Aller à aujourd&apos;hui
        </button>
      </div>
    </div>
  )
}

// ─── Vue mobile : liste du jour sélectionné ─────────────────────────────────
function MobileView({ missions }: { missions: ReturnType<typeof useStore>['missions'] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(TODAY)

  // Génère 14 jours autour d'aujourd'hui pour le sélecteur horizontal
  const dateRange = Array.from({ length: 14 }, (_, i) => addDays(TODAY, i - 3))
  const selectedIso = isoDate(selectedDate)

  const dayMissions = missions
    .filter(m => m.date_prevue === selectedIso)
    .sort((a, b) => parseHeure(a.heure_prevue) - parseHeure(b.heure_prevue))

  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll the selected day into center on mount
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-today="true"]') as HTMLElement
      if (el) el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="flex flex-col h-full space-y-4">

      {/* Sélecteur de jour horizontal */}
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {dateRange.map((d) => {
          const iso = isoDate(d)
          const isSelected = iso === selectedIso
          const isToday = iso === TODAY_ISO
          const hasMissions = missions.some(m => m.date_prevue === iso)
          return (
            <button
              key={iso}
              data-today={isToday ? 'true' : undefined}
              onClick={() => setSelectedDate(d)}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0 transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : isToday
                  ? 'border-2 border-blue-500 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {DAYS_FR[(d.getDay() + 6) % 7]}
              </span>
              <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
              <span className="text-[9px]">{MONTHS_SHORT[d.getMonth()]}</span>
              {hasMissions && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* En-tête du jour */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">
            {DAYS_FULL[(selectedDate.getDay() + 6) % 7]} {selectedDate.getDate()} {MONTHS_FR[selectedDate.getMonth()]}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {dayMissions.length === 0 ? 'Aucune mission' : `${dayMissions.length} mission${dayMissions.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/dashboard/missions/nouvelle">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" />
            Mission
          </Button>
        </Link>
      </div>

      {/* Liste des missions du jour */}
      {dayMissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">Aucune mission ce jour</p>
          <Link href="/dashboard/missions/nouvelle">
            <Button size="sm" variant="outline" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Planifier une mission
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {dayMissions.map((m) => {
            const style = STATUT_STYLE[m.statut] ?? STATUT_STYLE.nouveau
            return (
              <Link key={m.id} href={`/dashboard/missions/${m.id}`}>
                <div className={`rounded-xl border p-4 ${style.bg} hover:shadow-md transition-all cursor-pointer`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${style.bar}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold leading-snug truncate ${style.text}`}>{m.titre}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                          {m.statut === 'en_cours' ? 'En cours' : m.statut === 'nouveau' ? 'Nouveau' : m.statut === 'termine' ? 'Terminé' : 'Annulé'}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${style.text} opacity-80`}>{m.client_nom}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs ${style.text} opacity-70`}>
                          <Clock className="w-3 h-3" /> {m.heure_prevue}
                          {m.duree_estimee && ` · ${m.duree_estimee}`}
                        </span>
                        {m.categorie && (
                          <span className={`flex items-center gap-1 text-xs ${style.text} opacity-70`}>
                            <Wrench className="w-3 h-3" /> {m.categorie}
                          </span>
                        )}
                        {m.adresse && (
                          <span className={`flex items-center gap-1 text-xs ${style.text} opacity-70`}>
                            <MapPin className="w-3 h-3" /> {m.adresse}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Page principale ────────────────────────────────────────────────────────
export default function PlanningPage() {
  const { missions } = useStore()
  const [anchor, setAnchor] = useState<Date>(getMonday(TODAY))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [numDays, setNumDays]  = useState<5 | 7>(5)

  const days = Array.from({ length: numDays }, (_, i) => addDays(anchor, i))
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
  const totalH = (HOUR_END - HOUR_START) * SLOT_H

  function goWeek(delta: number) { setAnchor(a => addDays(a, delta * numDays)) }
  function goToday()              { setAnchor(getMonday(TODAY)) }
  function goToDate(d: Date)      { setAnchor(getMonday(d)) }

  const lastDay = days[days.length - 1]
  const sameMonth = anchor.getMonth() === lastDay.getMonth()
  const headerLabel = sameMonth
    ? `${anchor.getDate()} – ${lastDay.getDate()} ${MONTHS_FR[anchor.getMonth()]} ${anchor.getFullYear()}`
    : `${anchor.getDate()} ${MONTHS_SHORT[anchor.getMonth()]} – ${lastDay.getDate()} ${MONTHS_SHORT[lastDay.getMonth()]} ${lastDay.getFullYear()}`

  const isCurrentWeek = isoDate(anchor) === isoDate(getMonday(TODAY))

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>

      {/* ── Vue mobile ── */}
      <div className="md:hidden flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        <MobileView missions={missions} />
      </div>

      {/* ── Vue desktop (timeline Outlook) ── */}
      <div className="hidden md:flex flex-col flex-1" style={{ minHeight: 0 }}>

        {/* Barre de navigation */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100 shrink-0">

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => goWeek(-1)} className="px-2 py-1.5 hover:bg-gray-50 transition-colors text-gray-500 border-r border-gray-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => goWeek(+1)} className="px-2 py-1.5 hover:bg-gray-50 transition-colors text-gray-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={goToday}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                isCurrentWeek
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Aujourd&apos;hui
            </button>

            <div className="relative">
              <button
                onClick={() => setPickerOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Calendar className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-semibold text-gray-800">{headerLabel}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${pickerOpen ? 'rotate-90' : ''}`} />
              </button>
              {pickerOpen && (
                <MiniCalendar
                  selected={anchor}
                  onSelect={goToDate}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              {([5, 7] as const).map(n => (
                <button
                  key={n}
                  onClick={() => { setNumDays(n); setAnchor(getMonday(anchor)) }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    numDays === n ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {n === 5 ? 'Sem. (5j)' : '7 jours'}
                </button>
              ))}
            </div>
            <Link href="/dashboard/missions/nouvelle">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1.5" />
                Nouvelle mission
              </Button>
            </Link>
          </div>
        </div>

        {/* Grille Outlook */}
        <div className="flex-1 overflow-y-auto mt-4" style={{ minHeight: 0 }}>
          <div className="flex">

            {/* Colonne heures */}
            <div className="w-14 shrink-0 select-none">
              <div className="h-10" />
              {hours.map(h => (
                <div key={h} className="relative" style={{ height: SLOT_H }}>
                  <span className="absolute -top-2.5 right-2 text-[10px] font-medium text-gray-400 leading-none">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${numDays}, minmax(0, 1fr))` }}>
              {days.map((day) => {
                const iso         = isoDate(day)
                const isToday     = iso === TODAY_ISO
                const isWeekend   = day.getDay() === 0 || day.getDay() === 6
                const dayMissions = missions.filter(m => m.date_prevue === iso)

                return (
                  <div key={iso} className={`flex flex-col border-l border-gray-100 ${isWeekend ? 'bg-gray-50/50' : ''}`}>

                    <div className={`h-10 flex flex-col items-center justify-center border-b shrink-0 ${isToday ? 'border-blue-200' : 'border-gray-100'}`}>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>
                        {DAYS_FR[(day.getDay() + 6) % 7]}
                      </span>
                      <span className={`text-base font-bold leading-none mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-blue-600 text-white' : 'text-gray-800'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="relative" style={{ height: totalH }}>

                      {hours.map(h => (
                        <div
                          key={h}
                          className="absolute w-full border-t border-gray-100"
                          style={{ top: (h - HOUR_START) * SLOT_H }}
                        />
                      ))}

                      {hours.map(h => (
                        <div
                          key={`half-${h}`}
                          className="absolute w-full border-t border-dashed border-gray-50"
                          style={{ top: (h - HOUR_START) * SLOT_H + SLOT_H / 2 }}
                        />
                      ))}

                      {isToday && (
                        <div
                          className="absolute w-full z-20 flex items-center"
                          style={{ top: topPx(new Date().getHours() + new Date().getMinutes() / 60) }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0" />
                          <div className="flex-1 h-px bg-red-400" />
                        </div>
                      )}

                      {dayMissions.map((m) => {
                        const style = STATUT_STYLE[m.statut] ?? STATUT_STYLE.nouveau
                        const start = parseHeure(m.heure_prevue)
                        const dureeParse = m.duree_estimee?.match(/(\d+)h(\d*)/)
                        const dureH = dureeParse ? parseInt(dureeParse[1]) + (dureeParse[2] ? parseInt(dureeParse[2]) / 60 : 0) : 1
                        const top  = topPx(start)
                        const height = Math.max(dureH * SLOT_H - 3, 28)

                        return (
                          <Link key={m.id} href={`/dashboard/missions/${m.id}`}>
                            <div
                              className={`absolute left-1 right-1 rounded-lg border overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 ${style.bg}`}
                              style={{ top: top + 2, height }}
                            >
                              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${style.bar}`} />
                              <div className="pl-2.5 pr-1.5 py-1">
                                <p className={`text-[10px] font-bold leading-none ${style.text}`}>{m.heure_prevue}</p>
                                <p className={`text-[11px] font-semibold leading-tight mt-0.5 truncate ${style.text}`}>{m.client_nom}</p>
                                {height > 40 && (
                                  <p className={`text-[10px] leading-tight truncate opacity-75 ${style.text}`}>{m.categorie}</p>
                                )}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Légende statuts */}
        <div className="flex items-center gap-4 pt-3 mt-2 border-t border-gray-100 shrink-0">
          {Object.entries(STATUT_STYLE).map(([key, s]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <span className="text-xs text-gray-500 capitalize">
                {key === 'en_cours' ? 'En cours' : key === 'termine' ? 'Terminé' : key === 'nouveau' ? 'Nouveau' : 'Annulé'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
