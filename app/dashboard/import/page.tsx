'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Upload, FileSpreadsheet, Users, Wrench, FileText,
  CheckCircle, ChevronRight, Download, AlertCircle, Info, X
} from 'lucide-react'

type Step = 'choix' | 'upload' | 'apercu' | 'confirmation'
type TypeImport = 'clients' | 'missions' | 'devis' | null

const COLONNES_CLIENTS  = ['Prenom', 'Nom', 'Telephone', 'Email', 'Adresse', 'Code postal', 'Ville', 'Notes']
const COLONNES_MISSIONS = ['Titre', 'Description', 'Categorie', 'Client', 'Date prevue', 'Heure', 'Responsable', 'Montant estime', 'Duree estimee']
const COLONNES_DEVIS    = ['Numero', 'Client', 'Description prestation', 'Quantite', 'Prix unitaire HT', 'TVA', 'Notes']

// ── CSV generators ────────────────────────────────────────────────────────────
function makeCSV(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map(r => r.map(v => `"${v}"`).join(';')).join('\n')
}

const TEMPLATES: Record<NonNullable<TypeImport>, { headers: string[]; example: string[][] }> = {
  clients: {
    headers: COLONNES_CLIENTS,
    example: [
      ['Marie', 'Dupont', '06 12 34 56 78', 'marie@email.com', '12 rue de la Paix', '75001', 'Paris', 'Préfère les RDV matin'],
      ['Paul', 'Martin', '07 98 76 54 32', 'paul.martin@email.fr', '5 avenue Victor Hugo', '69001', 'Lyon', ''],
    ],
  },
  missions: {
    headers: COLONNES_MISSIONS,
    example: [
      ['Installation chaudière', 'Remplacement chaudière gaz', 'Installation', 'Marie Dupont', '2026-05-15', '09:00', 'Jean', '850', '3h'],
      ['Entretien clim', 'Révision annuelle', 'Entretien', 'Paul Martin', '2026-05-20', '14:00', 'Jean', '120', '1h'],
    ],
  },
  devis: {
    headers: COLONNES_DEVIS,
    example: [
      ['DEV-2026-001', 'Marie Dupont', 'Installation chaudière gaz condensation', '1', '750', '20', 'Garantie 2 ans'],
      ['DEV-2026-002', 'Paul Martin', 'Révision climatiseur', '1', '120', '20', ''],
    ],
  },
}

function downloadCSV(type: NonNullable<TypeImport>) {
  const { headers, example } = TEMPLATES[type]
  const csv = makeCSV(headers, example)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `modele-${type}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  // Handle both ; and , delimiters, strip BOM
  const cleaned = text.replace(/^\uFEFF/, '')
  const delimiter = cleaned.includes(';') ? ';' : ','
  return cleaned
    .split(/\r?\n/)
    .filter(l => l.trim())
    .map(line =>
      line.split(delimiter).map(cell =>
        cell.replace(/^"(.*)"$/, '$1').trim()
      )
    )
}

function normalizeHeader(h: string): string {
  return h.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '_')
}

export default function ImportPage() {
  const { addClient } = useStore()

  const [step, setStep] = useState<Step>('choix')
  const [typeImport, setTypeImport] = useState<TypeImport>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [importCount, setImportCount] = useState(0)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setParseError(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const parsed = parseCSV(text)
        if (parsed.length < 2) { setParseError('Le fichier semble vide ou mal formaté.'); return }
        setHeaders(parsed[0])
        setRows(parsed.slice(1))
        setStep('apercu')
      } catch {
        setParseError('Impossible de lire le fichier. Vérifiez le format.')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleImport() {
    if (typeImport === 'clients') {
      const errors: string[] = []
      let count = 0
      const hMap: Record<string, number> = {}
      headers.forEach((h, i) => { hMap[normalizeHeader(h)] = i })

      const get = (row: string[], ...keys: string[]) => {
        for (const k of keys) {
          const idx = hMap[normalizeHeader(k)]
          if (idx !== undefined && row[idx]?.trim()) return row[idx].trim()
        }
        return ''
      }

      rows.forEach((row, i) => {
        const prenom = get(row, 'prenom', 'prénom', 'firstname', 'first_name')
        const nom    = get(row, 'nom', 'name', 'lastname', 'last_name')
        if (!prenom && !nom) { errors.push(`Ligne ${i + 2} : prénom et nom manquants`); return }

        addClient({
          prenom: prenom || '—',
          nom:    nom    || '—',
          telephone:  get(row, 'telephone', 'téléphone', 'tel', 'phone'),
          email:      get(row, 'email', 'mail'),
          adresse:    get(row, 'adresse', 'address', 'rue'),
          code_postal: get(row, 'code postal', 'code_postal', 'cp', 'zipcode'),
          ville:      get(row, 'ville', 'city'),
          notes:      get(row, 'notes', 'note', 'commentaire'),
        })
        count++
      })

      setImportCount(count)
      setImportErrors(errors)
    }
    setStep('confirmation')
  }

  function reset() {
    setStep('choix')
    setTypeImport(null)
    setFileName(null)
    setRows([])
    setHeaders([])
    setParseError(null)
    setImportCount(0)
    setImportErrors([])
    if (fileRef.current) fileRef.current.value = ''
  }

  const colonnes = typeImport === 'clients' ? COLONNES_CLIENTS
    : typeImport === 'missions' ? COLONNES_MISSIONS
    : COLONNES_DEVIS

  const previewHeaders = headers.length ? headers.slice(0, 4) : colonnes.slice(0, 4)
  const previewRows = rows.length ? rows.slice(0, 3) : []

  return (
    <div className="space-y-5 max-w-2xl">

      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-gray-500" />
          Importer des données
        </h1>
        <p className="text-sm text-gray-500 mt-1">Centralisez vos données existantes en quelques étapes</p>
      </div>

      {/* Étapes */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {(['choix', 'upload', 'apercu', 'confirmation'] as Step[]).map((s, i) => {
          const stepOrder = ['choix', 'upload', 'apercu', 'confirmation']
          const currentIdx = stepOrder.indexOf(step)
          const thisIdx = stepOrder.indexOf(s)
          const isDone = thisIdx < currentIdx
          const isCurrent = s === step
          return (
            <div key={s} className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full transition-colors ${
                isCurrent ? 'bg-blue-600 text-white' :
                isDone    ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? '✓ ' : ''}{i + 1}. {s === 'choix' ? 'Type' : s === 'upload' ? 'Fichier' : s === 'apercu' ? 'Aperçu' : 'Terminé'}
              </span>
              {i < 3 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            </div>
          )
        })}
      </div>

      {/* ─── Étape 1 : Choisir le type ─── */}
      {step === 'choix' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">Que souhaitez-vous importer ?</p>
          {[
            { key: 'clients' as TypeImport,  icon: Users,     label: 'Clients',              desc: 'Carnet d\'adresses, fiches clients, contacts professionnels', badge: 'Import complet' },
            { key: 'missions' as TypeImport, icon: Wrench,    label: 'Missions / Historique', desc: 'Interventions passées, historique des prestations, planning',  badge: 'Bientôt' },
            { key: 'devis' as TypeImport,    icon: FileText,  label: 'Devis & Factures',      desc: 'Anciens devis, factures, propositions commerciales',           badge: 'Bientôt' },
          ].map(({ key, icon: Icon, label, desc, badge }) => (
            <button
              key={key!}
              onClick={() => { if (key === 'clients') { setTypeImport(key); setStep('upload') } }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all group ${
                key === 'clients'
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                key === 'clients' ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-100'
              }`}>
                <Icon className={`w-5 h-5 ${key === 'clients' ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    badge === 'Import complet' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{badge}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              {key === 'clients' && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />}
            </button>
          ))}

          <Card className="border-gray-200 bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Info className="w-3 h-3" /> Formats acceptés
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                {['Excel (.xlsx → export CSV)', 'CSV (.csv)', 'Google Sheets (export)', 'Numbers (export CSV)', 'LibreOffice Calc', 'Texte tabulé (.tsv)'].map(f => (
                  <span key={f} className="flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-gray-400 shrink-0" /> {f}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Étape 2 : Upload ─── */}
      {step === 'upload' && typeImport && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep('choix')} className="text-xs text-gray-400 hover:text-gray-600">← Retour</button>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-medium text-gray-600 capitalize">{typeImport}</span>
          </div>

          {/* Colonnes attendues */}
          <Card className="border-blue-100 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Colonnes attendues</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {colonnes.map(col => (
                  <span key={col} className="px-2 py-0.5 bg-white border border-blue-200 rounded text-xs font-medium text-blue-700">
                    {col}
                  </span>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">L&apos;ordre des colonnes peut varier. La 1ʳᵉ ligne doit contenir les en-têtes.</p>
            </CardContent>
          </Card>

          {/* Zone de dépôt */}
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-blue-300 hover:bg-blue-50 transition-all">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Glissez votre fichier ici</p>
              <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir</p>
              <p className="text-xs text-gray-300 mt-2">.csv · .tsv — jusqu&apos;à 10 Mo</p>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFileChange} />
            </div>
          </label>

          {parseError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {parseError}
            </div>
          )}

          {/* Télécharger un modèle */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Download className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700">Pas encore de fichier prêt ?</p>
              <p className="text-xs text-gray-500">Téléchargez le modèle CSV pré-rempli, complétez-le et réimportez-le.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-xs h-7"
              onClick={() => downloadCSV(typeImport)}
              type="button"
            >
              <Download className="w-3 h-3 mr-1" />
              Modèle {typeImport}
            </Button>
          </div>
        </div>
      )}

      {/* ─── Étape 3 : Aperçu ─── */}
      {step === 'apercu' && fileName && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep('upload')} className="text-xs text-gray-400 hover:text-gray-600">← Retour</button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{fileName}</p>
              <p className="text-xs text-green-600">{rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''} · {headers.length} colonne{headers.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Aperçu réel du contenu */}
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Aperçu des données</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {previewHeaders.map(col => (
                        <th key={col} className="text-left text-gray-500 font-semibold pb-2 pr-3 uppercase tracking-wide">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {previewRows.length > 0
                      ? previewRows.map((row, i) => (
                          <tr key={i}>
                            {previewHeaders.map((_, j) => (
                              <td key={j} className="py-2 pr-3 text-gray-700 max-w-[120px] truncate">{row[j] || '—'}</td>
                            ))}
                          </tr>
                        ))
                      : [1,2,3].map(i => (
                          <tr key={i}>
                            {previewHeaders.map(c => <td key={c} className="py-2 pr-3 text-gray-300">— — —</td>)}
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
              {rows.length > 3 && (
                <p className="text-xs text-gray-400 mt-2">+ {rows.length - 3} ligne{rows.length - 3 > 1 ? 's' : ''} supplémentaire{rows.length - 3 > 1 ? 's' : ''}</p>
              )}
            </CardContent>
          </Card>

          {typeImport !== 'clients' && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              L&apos;import de {typeImport} sera disponible prochainement. Seuls les clients sont importables pour l&apos;instant.
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={() => { setStep('upload'); if (fileRef.current) fileRef.current.value = '' }}>
              Changer de fichier
            </Button>
            <Button
              onClick={handleImport}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={typeImport !== 'clients'}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Importer {rows.length} {typeImport}
            </Button>
          </div>
        </div>
      )}

      {/* ─── Étape 4 : Confirmation ─── */}
      {step === 'confirmation' && (
        <div className="space-y-4">
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import réussi !</h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-gray-800">{importCount} {typeImport}</span> ont été ajouté{importCount > 1 ? 's' : ''} à votre espace.
              </p>
            </div>
          </div>

          {importErrors.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {importErrors.length} ligne{importErrors.length > 1 ? 's' : ''} ignorée{importErrors.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {importErrors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-700">{e}</p>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={reset}>
              Importer un autre fichier
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = `/dashboard/${typeImport}`}
            >
              Voir les {typeImport}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
