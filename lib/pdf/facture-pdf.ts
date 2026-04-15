import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Facture } from '@/lib/store'

type Settings = {
  nom_entreprise: string
  siret: string
  adresse: string
  ville: string
  code_postal: string
  telephone: string
  email: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export async function generateFacturePDF(facture: Facture, settings: Partial<Settings>) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 15

  // ─── Couleurs ────────────────────────────────────────────────────────────
  const BLUE   = [37, 99, 235]   as [number, number, number]
  const DARK   = [17, 24, 39]    as [number, number, number]
  const GRAY   = [107, 114, 128] as [number, number, number]
  const LGRAY  = [249, 250, 251] as [number, number, number]
  const GREEN  = [22, 163, 74]   as [number, number, number]

  // ─── Header entreprise ───────────────────────────────────────────────────
  // Barre bleue en haut
  doc.setFillColor(...BLUE)
  doc.rect(0, 0, W, 32, 'F')

  // Nom entreprise
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text(settings.nom_entreprise || 'Mon Entreprise', margin, 14)

  // Infos entreprise
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(219, 234, 254)
  const infoLines = [
    settings.adresse && `${settings.adresse}`,
    (settings.code_postal || settings.ville) && `${settings.code_postal || ''} ${settings.ville || ''}`.trim(),
    settings.telephone && `Tél : ${settings.telephone}`,
    settings.email && settings.email,
    settings.siret && `SIRET : ${settings.siret}`,
  ].filter(Boolean)

  let infoY = 20
  infoLines.forEach(line => {
    doc.text(String(line), margin, infoY)
    infoY += 4
  })

  // ─── Titre FACTURE ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text('FACTURE', W - margin, 14, { align: 'right' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(facture.numero, W - margin, 22, { align: 'right' })

  // ─── Bandeau statut ──────────────────────────────────────────────────────
  const statutColor: Record<string, [number, number, number]> = {
    brouillon: [229, 231, 235],
    envoyee:   [219, 234, 254],
    payee:     [220, 252, 231],
    annulee:   [254, 226, 226],
  }
  const statutLabel: Record<string, string> = {
    brouillon: 'BROUILLON',
    envoyee:   'ENVOYÉE',
    payee:     'PAYÉE',
    annulee:   'ANNULÉE',
  }
  doc.setFillColor(...(statutColor[facture.statut] || [229, 231, 235]))
  doc.rect(0, 32, W, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...(facture.statut === 'payee' ? GREEN : GRAY))
  doc.text(statutLabel[facture.statut] || facture.statut.toUpperCase(), W / 2, 37.5, { align: 'center' })

  // ─── Bloc CLIENT + DATES ─────────────────────────────────────────────────
  let y = 48

  // Encadré client
  doc.setFillColor(...LGRAY)
  doc.roundedRect(margin, y, 85, 35, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('FACTURÉ À', margin + 4, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.text(facture.client_nom, margin + 4, y + 15)

  // Encadré dates
  doc.setFillColor(...LGRAY)
  doc.roundedRect(W - margin - 85, y, 85, 35, 2, 2, 'F')

  const dateX = W - margin - 81
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('DÉTAILS', dateX, y + 7)

  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  const dateLines = [
    [`Émission :`, fmtDate(facture.created_at)],
    [`Échéance :`, fmtDate(facture.date_echeance)],
    facture.date_paiement ? [`Paiement :`, fmtDate(facture.date_paiement)] : null,
    facture.devis_numero ? [`Devis :`, facture.devis_numero] : null,
  ].filter(Boolean) as string[][]

  dateLines.forEach((([label, val], i) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(label, dateX, y + 16 + i * 6)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(val, dateX + 25, y + 16 + i * 6)
  }))

  y += 42

  // ─── Tableau des prestations ─────────────────────────────────────────────
  const tableBody = facture.lignes.map(l => [
    l.description,
    String(l.quantite),
    l.unite,
    fmt(l.prix_unitaire),
    fmt(l.total),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qté', 'Unité', 'P.U. HT', 'Total HT']],
    body: tableBody,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: DARK,
    },
    alternateRowStyles: {
      fillColor: LGRAY,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'right', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
    },
  })

  const afterTable = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5

  // ─── Totaux ──────────────────────────────────────────────────────────────
  const totX = W - margin - 70
  const totW = 70

  doc.setFillColor(...LGRAY)
  doc.rect(totX, afterTable, totW, 28, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text('Total HT', totX + 4, afterTable + 8)
  doc.text(`TVA ${facture.tva_taux}%`, totX + 4, afterTable + 16)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(fmt(facture.total_ht), totX + totW - 4, afterTable + 8, { align: 'right' })
  doc.text(fmt(facture.total_ttc - facture.total_ht), totX + totW - 4, afterTable + 16, { align: 'right' })

  // Total TTC mis en valeur
  doc.setFillColor(...BLUE)
  doc.rect(totX, afterTable + 20, totW, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Total TTC', totX + 4, afterTable + 27)
  doc.text(fmt(facture.total_ttc), totX + totW - 4, afterTable + 27, { align: 'right' })

  // ─── Notes ───────────────────────────────────────────────────────────────
  if (facture.notes) {
    const notesY = afterTable + 38
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY)
    doc.text('Notes', margin, notesY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    const noteLines = doc.splitTextToSize(facture.notes, W - margin * 2)
    doc.text(noteLines, margin, notesY + 6)
  }

  // ─── Pied de page ────────────────────────────────────────────────────────
  const footerY = 285
  doc.setDrawColor(...(BLUE as [number, number, number]))
  doc.setLineWidth(0.5)
  doc.line(margin, footerY, W - margin, footerY)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  const footerParts = [
    settings.nom_entreprise,
    settings.siret && `SIRET ${settings.siret}`,
    settings.adresse && `${settings.adresse}${settings.ville ? `, ${settings.ville}` : ''}`,
    'TVA non applicable, art. 293B du CGI',
  ].filter(Boolean)
  doc.text(footerParts.join(' · '), W / 2, footerY + 5, { align: 'center' })

  // ─── Téléchargement ──────────────────────────────────────────────────────
  doc.save(`${facture.numero}.pdf`)
}
