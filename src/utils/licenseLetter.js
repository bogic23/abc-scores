import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'

const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export function formatLicenseIssueDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

export async function createLicenseLetter(request, issuedAt = request.issuedAt?.toDate?.() || request.issuedAt || new Date()) {
  const templateUrl = `${import.meta.env.BASE_URL}license_letter.docx`
  const response = await fetch(templateUrl)
  if (!response.ok) {
    throw new Error(`The license letter template could not be loaded (${response.status}).`)
  }

  const zip = new PizZip(await response.arrayBuffer())
  const licenseDocument = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    linebreaks: true,
    paragraphLoop: true,
  })
  licenseDocument.render({
    Title_Scores: request.licenseTitle || request.scoreTitle,
    Licensed_To: request.licensedTo || request.requesterName,
    Date_Issued: formatLicenseIssueDate(issuedAt),
  })

  return licenseDocument.getZip().generate({ type: 'blob', mimeType: docxMimeType })
}

function safeFilenamePart(value) {
  return value.replace(/[<>:"/\\|?*]/g, '-').replace(/[. ]+$/g, '').trim() || 'License'
}

export function downloadLicenseLetter(blob, scoreTitle, licensedTo) {
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `License Letter - ${safeFilenamePart(scoreTitle)} (${safeFilenamePart(licensedTo)}).docx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}
