type VendorApplication = {
  selectedEvents: string
  spaceLabel: string
  spacePrice: number
  eventCount: number
  estimatedTotal: number
  businessName: string
  contactName: string
  email: string
  phone: string
  website: string
  instagram: string
  businessDescription: string
  inventoryPriceRange: string
  promotionAgreed: boolean
  vendorTermsAgreed: boolean
  vendorTermsVersion: string
  vendorTermsAcceptedAt: string
  categories: string[]
  photoUrls: string[]
}

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const LEFT = 54
const RIGHT = 558
const TOP = 724
const BOTTOM = 58

const PROMOTION_COMMITMENT =
  'We handle the venue, production, and overall marketing. Promotion is most successful when vendors are actively involved. Vendors are required to begin posting two (2) weeks prior to the event, posting twice per week for a total of four (4) posts, and tagging @assemblyvintageco. Posts may include Instagram feed posts, reels, or TikTok videos. Stories alone do not count toward the four required posts. Vendors who do not participate in consistent promotion may not be considered for future markets.'

const IMPORTANT_DETAILS = [
  'Vendors must bring their own tables, racks, and display materials.',
  'Clothing vendors must bring a mirror.',
  'Early breakdown is not permitted.',
  'Vendors are responsible for their merchandise.',
  'Electricity is not guaranteed unless otherwise specified.',
  'One fitting room will be provided.',
]

const VENDOR_AGREEMENT = [
  'Please review the following terms carefully. By submitting your application, you agree to these terms and acknowledge that they are binding.',
  'By applying to Assembly Vintage Market, I/We confirm that I/We have read and agree to follow all market rules and guidelines. I/We certify that the undersigned is the responsible party for this application.',
  'I/We agree to hold harmless Assembly Vintage Market, its organizers, partners, venue owners, and team members from any claims, damages, or liabilities related to participation in the market.',
  'Assembly Vintage Market is a curated event, and vendor selection and placement are at the discretion of the market team. While we do our best to accommodate everyone, specific placement cannot be guaranteed, and adjustments may be made as needed. Vendors who do not comply with market or venue rules may be asked to leave without refund.',
  'Vendor fees are non-refundable, and events will take place rain or shine.',
  'Assembly Vintage Market reserves the right to make changes to event details, including location, date, time, or format. If circumstances beyond our control prevent the event from taking place, vendors waive any claims for compensation, and all parties will be released from further obligations.',
  'Vendors are responsible for securing any required licenses, insurance, and for collecting and paying applicable taxes. Assembly Vintage Market is not responsible for vendor tax or licensing compliance.',
  'Vendors are responsible for their merchandise and agree that Assembly Vintage Market is not liable for loss, theft, or damage.',
  'By submitting this application, I/We agree to the terms outlined above.',
]

function cleanPdfText(value: unknown) {
  return String(value ?? '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00D7/g, 'x')
    .replace(/\u2032/g, "'")
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapePdf(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrapText(value: unknown, maxChars: number) {
  const text = cleanPdfText(value)
  if (!text) return ['-']
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length <= maxChars) {
      line = next
      continue
    }
    if (line) lines.push(line)
    if (word.length > maxChars) {
      let rest = word
      while (rest.length > maxChars) {
        lines.push(rest.slice(0, maxChars))
        rest = rest.slice(maxChars)
      }
      line = rest
    } else {
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function textCommand(text: string, x: number, y: number, size = 10, bold = false, coral = false) {
  const color = coral ? '0.953 0.478 0.365 rg' : '0.067 0.067 0.067 rg'
  return `BT ${color} /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdf(cleanPdfText(text))}) Tj ET`
}

function buildPdf(pages: string[]) {
  const objectBodies: string[] = []
  const pageObjectIds = pages.map((_, index) => 5 + index * 2)
  const streamObjectIds = pages.map((_, index) => 6 + index * 2)

  objectBodies[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objectBodies[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>`
  objectBodies[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  objectBodies[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

  pages.forEach((stream, index) => {
    const pageId = pageObjectIds[index]
    const streamId = streamObjectIds[index]
    objectBodies[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`
    objectBodies[streamId] = `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`
  })

  const maxId = objectBodies.length - 1
  let pdf = '%PDF-1.4\n%ASSEMBLY\n'
  const offsets = new Array(maxId + 1).fill(0)

  for (let id = 1; id <= maxId; id += 1) {
    offsets[id] = Buffer.byteLength(pdf, 'utf8')
    pdf += `${id} 0 obj\n${objectBodies[id]}\nendobj\n`
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`
  for (let id = 1; id <= maxId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new TextEncoder().encode(pdf)
}

export function buildVendorApplicationPdf({
  applicationId,
  submittedAt,
  application,
}: {
  applicationId: string
  submittedAt: string
  application: VendorApplication
}) {
  const pages: string[][] = []
  let commands: string[] = []
  let y = TOP
  let pageNumber = 0

  const startPage = () => {
    if (commands.length) pages.push(commands)
    commands = []
    pageNumber += 1
    y = TOP
    commands.push('0.953 0.478 0.365 RG 3 w 54 746 m 558 746 l S')
    commands.push(textCommand('ASSEMBLY VINTAGE MARKET', LEFT, 762, 9, true))
    commands.push(textCommand('VENDOR APPLICATION RECORD', LEFT, 714, 24, true))
    commands.push(textCommand(`Application ID: ${applicationId}`, LEFT, 694, 8))
    commands.push(textCommand(`Submitted: ${submittedAt}`, LEFT, 681, 8))
    y = 652
  }

  const ensure = (height: number) => {
    if (y - height < BOTTOM) startPage()
  }

  const addSection = (number: string, title: string) => {
    ensure(42)
    commands.push(textCommand(number, LEFT, y, 10, true, true))
    commands.push(textCommand(title.toUpperCase(), LEFT + 28, y, 13, true))
    y -= 26
  }

  const addField = (label: string, value: unknown) => {
    const lines = wrapText(value, 82)
    const height = 15 + lines.length * 13
    ensure(height)
    commands.push(textCommand(label.toUpperCase(), LEFT, y, 7.5, true, true))
    y -= 13
    for (const line of lines) {
      commands.push(textCommand(line, LEFT, y, 10))
      y -= 13
    }
    y -= 8
  }

  const addParagraph = (value: unknown, bullet = false) => {
    const lines = wrapText(value, bullet ? 86 : 90)
    const height = lines.length * 12 + 10
    ensure(height)
    for (let index = 0; index < lines.length; index += 1) {
      const prefix = bullet && index === 0 ? '- ' : bullet ? '  ' : ''
      commands.push(textCommand(prefix + lines[index], LEFT, y, 9))
      y -= 12
    }
    y -= 8
  }

  startPage()

  addSection('01', 'Market')
  addField('Selected events', application.selectedEvents)
  addField('Space size', application.spaceLabel)
  addField('Space price per event', `$${application.spacePrice}`)
  addField('Event count', application.eventCount)
  addField('Estimated booth fees', `$${application.estimatedTotal}`)
  addField('Business / shop name', application.businessName)
  addField('Contact name', application.contactName)
  addField('Email', application.email)
  addField('Phone', application.phone)

  addSection('02', 'Your Shop')
  addField('Categories', application.categories.join(', '))
  addField('Business description', application.businessDescription)
  addField('Inventory price range', application.inventoryPriceRange)
  addField('Website', application.website || 'Not provided')
  addField('Instagram', application.instagram || 'Not provided')
  addField('Submitted photo links', application.photoUrls.join(' | '))

  addSection('03', 'Expectations')
  addField('Promotion commitment accepted', application.promotionAgreed ? 'YES - ACCEPTED' : 'NO')
  addParagraph(PROMOTION_COMMITMENT)
  commands.push(textCommand('IMPORTANT DETAILS', LEFT, y, 8, true, true))
  y -= 16
  for (const detail of IMPORTANT_DETAILS) addParagraph(detail, true)

  addSection('04', 'Agreement')
  addField('Vendor terms accepted', application.vendorTermsAgreed ? 'YES - ACCEPTED' : 'NO')
  addField('Agreement version', application.vendorTermsVersion)
  addField('Accepted at', application.vendorTermsAcceptedAt)
  commands.push(textCommand('VENDOR SELECTION & CURATION NOTICE', LEFT, y, 8, true, true))
  y -= 16
  addParagraph('Submitting an application does not guarantee acceptance. All vendors are subject to curation and approval by Assembly Vintage Market.')
  addParagraph("As a new market, we're still getting to know the space and how best to curate the vendor mix. While we hope to include as many vendors as possible, we may not be able to accommodate everyone this time.")
  addParagraph('Please know we plan to host additional markets and would love to stay connected for future events.')
  commands.push(textCommand('ASSEMBLY VINTAGE MARKET - VENDOR AGREEMENT', LEFT, y, 8, true, true))
  y -= 16
  for (const paragraph of VENDOR_AGREEMENT) addParagraph(paragraph)

  ensure(72)
  commands.push('0.75 0.75 0.72 RG 1 w 54 92 m 558 92 l S')
  commands.push(textCommand('SUBMISSION RECORD', LEFT, 74, 7.5, true, true))
  commands.push(textCommand('This PDF is a record of the vendor application and commitments submitted to Assembly Vintage Market.', LEFT, 61, 8))

  if (commands.length) pages.push(commands)

  pages.forEach((pageCommands, index) => {
    pageCommands.push(textCommand(`ASSEMBLY VINTAGE MARKET  |  PAGE ${index + 1} OF ${pages.length}`, LEFT, 30, 7, true))
  })

  return buildPdf(pages.map((page) => page.join('\n')))
}
