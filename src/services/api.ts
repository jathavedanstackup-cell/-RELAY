/**
 * RELAY API Service Layer (Client-Side REST Contract)
 * 
 * Centralized service layer abstracting future Django REST API endpoints.
 * Provides realistic demo data that can be swapped for real fetch/axios
 * calls without modifying UI components.
 */

import {
  CaseData,
  CaseOutcome,
  DocumentItem,
  ConnectionItem,
  ApprovalAction,
  ActivityEvent,
  Task
} from '../types';

// Initial Mock Cases Dataset matching Google Stitch RELAY Design
const INITIAL_CASES: Record<string, CaseData> = {
  '1048': {
    id: '1048',
    caseNumber: '1048',
    title: 'Flight cancellation & full statutory compensation',
    originalRequest: 'My flight from New York to London was cancelled. I need to be rebooked, arrange a hotel, and file compensation.',
    status: 'in_progress',
    statusLabel: 'IN PROGRESS',
    updatedAt: 'Last updated 42s ago',
    autonomousLead: 'Relay Logistics Pod A',
    totalTasks: 5,
    completedTasks: 3,
    progressPercent: 60,
    stages: [
      {
        stage: 'understand',
        label: '1. UNDERSTAND',
        status: 'completed',
        timestamp: '10:41:02',
        summary: 'Identified cancellation & travel constraints'
      },
      {
        stage: 'plan',
        label: '2. PLAN',
        status: 'completed',
        timestamp: '10:42:15',
        summary: 'Generated 4-task execution plan'
      },
      {
        stage: 'execute',
        label: '3. EXECUTE',
        status: 'active',
        summary: '3 of 5 tasks finished · 60%'
      },
      {
        stage: 'verify',
        label: '4. VERIFY',
        status: 'pending',
        summary: 'Awaiting airline confirmation ticket'
      },
      {
        stage: 'resolved',
        label: '5. RESOLVED',
        status: 'pending',
        summary: 'Target: All outcomes guaranteed'
      }
    ],
    currentAction: {
      description: 'Searching fare inventory & locking provisional hotel hold at Hilton T5 London',
      agentName: 'Action Agent (BA Corporate API + Amadeus GDS)',
      elapsed: '04m 18s',
      latency: '84ms',
      nonce: '0x98f2..c1a'
    },
    approval: {
      id: 'appr-1048-1',
      caseId: '1048',
      title: 'Action Requiring Approval: Rebook on British Airways BA178',
      subTitle: 'Human Authorization Boundary',
      expiresInSeconds: 642,
      flightDetails: {
        flightNumber: 'BA178',
        route: 'JFK → LHR',
        departureTime: '8:40 PM Tonight',
        arrivalTime: '8:45 AM GMT',
        aircraft: 'Boeing 777-300ER',
        cabin: 'World Traveller Plus (Premium Economy)',
        seat: '14B',
        baseFare: '$0.00 base',
        expeditedDelta: '+$84.00',
        reclaimableNote: 'Fully covered & reclaimable under EU261 / UK statutory duty of care.'
      },
      rationale: 'Minimizes total schedule slippage to 3h 15m. Confirms passenger arrives in London in time for 10:00 AM stakeholder sync.',
      confidenceScore: '99.4%',
      provenanceHash: '0x8f4e..c90a1b',
      status: 'pending'
    },
    tasks: [
      {
        id: 't1',
        title: 'Task 1: Rebooking flight JFK → LHR',
        description: 'BA178 8:40 PM selected. Inventory seat 14B reserved for 15 minutes. Awaiting user card authorization.',
        status: 'pending_approval',
        badge: 'Action Requiring Approval',
        badgeType: 'primary',
        priority: 'high',
        actionRequired: true
      },
      {
        id: 't2',
        title: 'Task 2: Heathrow Airport Hotel Booking',
        description: 'Hilton London Heathrow Airport Terminal 5. Complimentary transit voucher staged. Queued for final flight ticket issue.',
        status: 'hold_confirmed',
        badge: 'Hold Confirmed',
        badgeType: 'tertiary'
      },
      {
        id: 't3',
        title: 'Task 3: UK/EU261 Compensation Claim (£520 / ~$650)',
        description: 'Formal statutory packet assembled with MET radar weather proof (clear conditions) refuting extraordinary circumstances.',
        status: 'staged',
        badge: 'Documentation Prepared',
        badgeType: 'secondary'
      },
      {
        id: 't4',
        title: 'Task 4: Automated Calendar & Family Notification',
        description: 'Updated calendar arrival time sent to UK Executive Host. SMS update drafted for emergency contact (Mark Jenkins).',
        status: 'staged',
        badge: 'Drafts Staged in Outlook',
        badgeType: 'secondary'
      }
    ],
    provenanceChain: [
      {
        id: 'p1',
        label: 'Decision Point',
        value: 'BA178 Departure 20:40',
        subValue: 'Selected over BA182 (02:10 AM departure)'
      },
      {
        id: 'p2',
        label: 'Decision Basis',
        value: 'Meeting Constraints',
        subValue: "Meets client's 10:00 AM London summit schedule"
      },
      {
        id: 'p3',
        label: 'Autonomous Action',
        value: 'Inventory Lock Placed',
        subValue: 'Via British Airways NDC direct connection'
      },
      {
        id: 'p4',
        label: 'Artifact / Result',
        value: 'PNR #X99KLR',
        subValue: 'Hold confirmed valid until 20:55 GMT'
      }
    ],
    targetOutcomes: [
      { text: 'British Airways rebooking confirmed on earliest flight', completed: true },
      { text: 'Heathrow hotel voucher & airport transfer secured', completed: true },
      { text: 'Statutory compensation claim £520 submitted to CAA', completed: false },
      { text: 'Meeting organizer and family SMS notification dispatched', completed: false }
    ],
    financialBalance: {
      recoveryAmount: '+$650.00',
      fareDelta: '$84.00',
      netBenefit: '+$566.00'
    },
    groundTruth: {
      passenger: 'Sarah Jenkins',
      route: 'JFK → LHR (London)',
      originalPnr: '#X89KL2 (Cancelled)',
      travelClass: 'Club World / Premium'
    },
    connectedSeals: [
      { name: 'British Airways Executive Club', icon: 'flight_takeoff', status: 'verified' },
      { name: 'Google Workspace Calendar', icon: 'calendar_month', status: 'synced' },
      { name: 'Chase Sapphire Reserve', icon: 'credit_card', status: 'connected' }
    ],
    activityFeed: [
      {
        id: 'act-5',
        agentName: 'Verification Agent',
        timeString: '10:44:12',
        description: 'Verified EU261 eligibility: flight cancelled <14 days notice under carrier liability.'
      },
      {
        id: 'act-4',
        agentName: 'Action Agent',
        timeString: '10:43:08',
        description: 'Placed 15-minute provisional inventory hold on BA178 seat 14B.'
      },
      {
        id: 'act-3',
        agentName: 'Research Agent',
        timeString: '10:42:40',
        description: 'Scanned 14 trans-Atlantic flights; filtered to 2 viable options respecting arrival window.'
      },
      {
        id: 'act-2',
        agentName: 'Planning Agent',
        timeString: '10:41:15',
        description: 'Decomposed situation into 4 parallel workstreams: Rebook, Lodging, Claim, Logistics.'
      },
      {
        id: 'act-1',
        agentName: 'Situation Agent',
        timeString: '10:40:02',
        description: 'Confirmed cancellation of BA112 via live flight radar and airline dispatch email hook.'
      }
    ],
    documentsCount: 4,
    dossierReady: true
  },

  '1049': {
    id: '1049',
    caseNumber: '1049',
    title: 'Homeowner insurance claim for burst pipe emergency',
    originalRequest: 'A water pipe burst in the upstairs bathroom causing ceiling collapse in the kitchen. Need emergency mitigation coverage and insurance claim submitted.',
    status: 'planning',
    statusLabel: 'PLANNING',
    updatedAt: 'Updated 18m ago',
    autonomousLead: 'Legal & Claims Pod',
    totalTasks: 4,
    completedTasks: 1,
    progressPercent: 25,
    stages: [
      { stage: 'understand', label: '1. UNDERSTAND', status: 'completed', summary: 'Analyzed plumber invoices & policy declarations' },
      { stage: 'plan', label: '2. PLAN', status: 'active', summary: 'Matching State Farm policy clause 4b' },
      { stage: 'execute', label: '3. EXECUTE', status: 'pending', summary: 'Awaiting loss adjuster inspection schedule' },
      { stage: 'verify', label: '4. VERIFY', status: 'pending', summary: 'Itemized damage proof verification' },
      { stage: 'resolved', label: '5. RESOLVED', status: 'pending', summary: 'Disbursement target $8,400' }
    ],
    tasks: [
      {
        id: 't1049-1',
        title: 'Task 1: Itemized plumber breakdown verification',
        description: 'Parsed emergency plumber receipt ($1,240) and verified license active with state board.',
        status: 'completed',
        badge: 'Itemized receipt verified',
        badgeType: 'tertiary'
      },
      {
        id: 't1049-2',
        title: 'Task 2: State Farm clause 4b deductible matching',
        description: 'Correlating sudden and accidental discharge limits against policy deductible ($1,000).',
        status: 'in_progress',
        badge: 'Policy Matching',
        badgeType: 'primary'
      }
    ],
    provenanceChain: [],
    targetOutcomes: [
      { text: 'Emergency mitigation invoice verified', completed: true },
      { text: 'State Farm claim opened and adjuster assigned', completed: false },
      { text: 'Initial reimbursement payout secured', completed: false }
    ],
    groundTruth: {
      passenger: 'Sarah Jenkins',
      route: 'N/A (Property Claim)',
      originalPnr: 'Claim #SF-889104',
      travelClass: 'Homeowner Platinum'
    },
    connectedSeals: [
      { name: 'State Farm Insurance Vault', icon: 'shield', status: 'verified' },
      { name: 'Chase Checking', icon: 'account_balance', status: 'connected' }
    ],
    activityFeed: [
      {
        id: 'act-1049-1',
        agentName: 'Intake Agent',
        timeString: '09:44:00',
        description: 'Ingested 3 plumber photos and itemized service invoice.'
      }
    ],
    documentsCount: 3
  },

  '1039': {
    id: '1039',
    caseNumber: '1039',
    title: 'Medical out-of-network reimbursement appeal',
    originalRequest: 'Hospital billed $1,800 for outpatient anesthesia; insurance only covered $380 under out-of-network tier. File an ERISA appeal under section 503.',
    status: 'waiting_approval',
    statusLabel: 'APPROVAL REQUIRED',
    updatedAt: 'Drafted by Healthcare Pod B',
    autonomousLead: 'Healthcare Pod B',
    totalTasks: 3,
    completedTasks: 1,
    progressPercent: 33,
    stages: [
      { stage: 'understand', label: '1. UNDERSTAND', status: 'completed', summary: 'Identified wrongful tier classification' },
      { stage: 'plan', label: '2. PLAN', status: 'completed', summary: 'Prepared ERISA formal appeal brief' },
      { stage: 'execute', label: '3. EXECUTE', status: 'active', summary: 'Awaiting digital authorization signature' },
      { stage: 'verify', label: '4. VERIFY', status: 'pending', summary: 'Postal courier tracking' },
      { stage: 'resolved', label: '5. RESOLVED', status: 'pending', summary: 'Target recovery $1,420.00' }
    ],
    approval: {
      id: 'appr-1039',
      caseId: '1039',
      title: 'Authorize Digital Signature & Patient Release Form',
      subTitle: 'Statutory Appeal Filing Deadline in 4 Hours',
      expiresInSeconds: 14400,
      claimDetails: {
        discrepancyAmount: '+$1,420.00 under Sec 503',
        insurerPayout: '$380.00 (Denied Tier 2)',
        statutorySection: 'ERISA Section 503 / 29 C.F.R. § 2560.503-1'
      },
      rationale: 'Hospital surgeon was in-network; facility contracted out-of-network anesthesiologist without informed consent. Fully recoverable under No Surprises Act.',
      confidenceScore: '98.8%',
      provenanceHash: '0x44ab..8819ef',
      status: 'pending'
    },
    tasks: [
      {
        id: 't1039-1',
        title: 'Task 1: Draft formal ERISA claim appeal',
        description: 'Drafted legal brief challenging $1,420 surgical billing discrepancy. Requires digital signature.',
        status: 'pending_approval',
        badge: 'Signature Staged',
        badgeType: 'error',
        actionRequired: true
      }
    ],
    provenanceChain: [],
    targetOutcomes: [
      { text: 'Billing discrepancy documented', completed: true },
      { text: 'Appeal signed and dispatched', completed: false },
      { text: 'Restitution of $1,420 credited', completed: false }
    ],
    groundTruth: {
      passenger: 'Sarah Jenkins',
      route: 'Healthcare Claim',
      originalPnr: 'Member #UHC-849102',
      travelClass: 'Choice Plus PPO'
    },
    connectedSeals: [
      { name: 'UnitedHealthcare Portal', icon: 'local_hospital', status: 'verified' }
    ],
    activityFeed: [
      {
        id: 'act-1039-1',
        agentName: 'Legal Agent',
        timeString: '08:12:00',
        description: 'Cross-referenced surgeon NPI with network roster. Confirmed lack of consent disclosure.'
      }
    ],
    documentsCount: 2
  },

  '1018': {
    id: '1018',
    caseNumber: '1018',
    title: 'Hotel booking rate parity adjustment — Zurich',
    originalRequest: 'Secured 3 nights at The Dolder Grand Zurich. Observed rate drop on partner portal for identical junior suite. Enforce price match guarantee.',
    status: 'needs_attention',
    statusLabel: 'NEEDS ATTENTION',
    updatedAt: 'Paused • Awaiting 2FA token',
    autonomousLead: 'Travel Rate Ops',
    totalTasks: 2,
    completedTasks: 0,
    progressPercent: 10,
    stages: [
      { stage: 'understand', label: '1. UNDERSTAND', status: 'completed', summary: 'Rate diff identified ($210/night)' },
      { stage: 'plan', label: '2. PLAN', status: 'active', summary: 'Blocked at portal 2FA authentication' },
      { stage: 'execute', label: '3. EXECUTE', status: 'pending', summary: 'Rate modification submission' },
      { stage: 'verify', label: '4. VERIFY', status: 'pending', summary: 'Updated folio verification' },
      { stage: 'resolved', label: '5. RESOLVED', status: 'pending', summary: 'Savings: $630 total' }
    ],
    tasks: [
      {
        id: 't1018-1',
        title: 'Task 1: Pass-through 2FA authentication',
        description: 'Automated booking adjustment stalled due to 2FA prompt on partner hotel portal. Awaiting SMS verification code.',
        status: 'blocked',
        badge: 'Paused (2FA required)',
        badgeType: 'error',
        actionRequired: true
      }
    ],
    provenanceChain: [],
    targetOutcomes: [
      { text: 'Rate parity claim filed with Dolder Grand', completed: false },
      { text: 'Folio adjusted by $630', completed: false }
    ],
    groundTruth: {
      passenger: 'Sarah Jenkins',
      route: 'Zurich, Switzerland',
      originalPnr: 'Folio #DG-91028',
      travelClass: 'Junior Suite Lake View'
    },
    connectedSeals: [
      { name: 'The Leading Hotels of the World', icon: 'hotel', status: 'connected' }
    ],
    activityFeed: [
      {
        id: 'act-1018-1',
        agentName: 'Action Agent',
        timeString: 'Yesterday',
        description: 'Encountered SMS 2FA checkpoint during login session.'
      }
    ],
    documentsCount: 1
  },

  '1027': {
    id: '1027',
    caseNumber: '1027',
    title: 'Apartment security deposit return negotiation',
    originalRequest: 'Landlord improperly withheld $2,400 of my security deposit for normal wear and tear painting. Recover full amount.',
    status: 'resolved',
    statusLabel: 'RESOLVED',
    updatedAt: 'Completed yesterday at 16:42',
    autonomousLead: 'Tenancy Rights Pod',
    totalTasks: 3,
    completedTasks: 3,
    progressPercent: 100,
    stages: [
      { stage: 'understand', label: '1. UNDERSTAND', status: 'completed', summary: 'Assessed move-in/out inspection photo diffs' },
      { stage: 'plan', label: '2. PLAN', status: 'completed', summary: 'Drafted statutory demand letter cite clause 4b' },
      { stage: 'execute', label: '3. EXECUTE', status: 'completed', summary: 'Served certified electronic demand to landlord' },
      { stage: 'verify', label: '4. VERIFY', status: 'completed', summary: 'Direct wire transfer verified ($2,400.00)' },
      { stage: 'resolved', label: '5. RESOLVED', status: 'completed', summary: 'Closed with full recovery' }
    ],
    tasks: [
      {
        id: 't1027-1',
        title: 'Task 1: Image diff inspection matching',
        description: 'Compared 42 move-in photos against move-out condition report to prove zero structural defects.',
        status: 'completed',
        badge: 'Defect Analysis Verified',
        badgeType: 'tertiary'
      },
      {
        id: 't1027-2',
        title: 'Task 2: Tenancy Ordinance Notice Clause 4b',
        description: 'Formal legal demand delivered via registered courier.',
        status: 'completed',
        badge: 'Legal Notice Delivered',
        badgeType: 'tertiary'
      },
      {
        id: 't1027-3',
        title: 'Task 3: Bank wire transfer confirmation',
        description: 'Wire of $2,400 received into account ••4012.',
        status: 'completed',
        badge: 'Wire Settled',
        badgeType: 'tertiary'
      }
    ],
    provenanceChain: [],
    targetOutcomes: [
      { text: 'Defective deduction refuted with photos', completed: true },
      { text: 'Landlord signed concession agreement', completed: true },
      { text: 'Full $2,400 refunded via electronic wire', completed: true }
    ],
    financialBalance: {
      recoveryAmount: '+$2,400.00',
      fareDelta: '$0.00',
      netBenefit: '+$2,400.00'
    },
    groundTruth: {
      passenger: 'Sarah Jenkins',
      route: 'Tenancy Case',
      originalPnr: 'Lease #409-West',
      travelClass: 'Residential'
    },
    connectedSeals: [
      { name: 'Chase Wire Service', icon: 'account_balance', status: 'verified' }
    ],
    activityFeed: [
      {
        id: 'act-1027-1',
        agentName: 'Settlement Agent',
        timeString: 'Yesterday 16:42',
        description: 'Received bank Fedwire confirmation reference #WF-091823901.'
      }
    ],
    documentsCount: 4,
    dossierReady: true
  }
};

// Initial Case Outcome matching Screen 5 Outcome Dossier
const INITIAL_OUTCOMES: Record<string, CaseOutcome> = {
  '1048': {
    caseId: '1048',
    title: 'Flight cancellation & full statutory compensation',
    status: 'resolved',
    resolvedAt: 'Completed today at 10:48 EST',
    headline: 'Your problem is handled.',
    supportingText: 'RELAY completed the requested work and cryptographically verified all outcomes across airline, hospitality, and statutory authorities.',
    masterLedgerHash: 'SHA-256: 8f4e…c90a1b',
    metrics: {
      netFinancialBenefit: '+$566.00',
      netBenefitSubtext: '$650.00 EU261 statutory claim recovery vs $84.00 expedited fare delta',
      timeSaved: '4h 40m',
      timeSavedSubtext: 'Administrative friction eliminated across booking desks and CAA forms',
      scheduleSlippage: '3h 15m',
      scheduleSlippageSubtext: 'Minimized to 3h 15m arrival variance via immediate JFK direct re-slotting',
      artifactsCount: 4,
      artifactsSubtext: '4 cryptographic receipts sealed to case audit ledger with immutable provenance'
    },
    outcomes: [
      {
        id: 'out-1',
        title: 'British Airways rebooking confirmed on earliest flight',
        code: 'FLIGHT-REBOOK',
        primaryDetail: 'BA178 (JFK → LHR)',
        statusDetail: 'Departs 8:40 PM tonight',
        secondaryDetail: 'Arrival: 8:45 AM GMT (+1d) · Seat: 14B (Club World / World Traveller Plus)',
        artifactLabel: 'Artifact:',
        artifactValue: 'PNR #X99KLR (Confirmed & Ticketed)',
        verificationLabel: 'Verification:',
        verificationValue: 'NDC direct API token 10:44:12',
        footerHash: 'GDS Hash: e0a1…99fc',
        ctaText: 'View E-Ticket',
        documentType: 'ticket'
      },
      {
        id: 'out-2',
        title: 'Heathrow airport hotel accommodation confirmed',
        code: 'HOTEL-VOUCHER',
        primaryDetail: 'Hilton London Heathrow Airport T5',
        statusDetail: '$0.00 Out of Pocket',
        secondaryDetail: 'Complimentary transit accommodation voucher applied under statutory duty of care.',
        artifactLabel: 'Artifact:',
        artifactValue: 'Voucher #HTL-88291-LHR',
        verificationLabel: 'Status:',
        verificationValue: 'Pre-checked in, digital key ready',
        footerHash: 'CRS Auth: hlt_55941',
        ctaText: 'View Voucher',
        documentType: 'voucher'
      },
      {
        id: 'out-3',
        title: 'UK/EU261 statutory compensation claim submitted',
        code: '£520 / ~$650',
        primaryDetail: 'Civil Aviation Authority & BA Claims',
        statusDetail: 'Claim #CLM-2024-9104',
        secondaryDetail: 'MET radar weather report attached refuting extraordinary circumstances claim. Automated denial counter-filed.',
        artifactLabel: 'Disbursement:',
        artifactValue: 'Accepted for automated direct deposit',
        verificationLabel: 'Expected Settlement:',
        verificationValue: '3–5 business days',
        footerHash: 'CAA Seal: UK-261-REV',
        ctaText: 'View Filing Packet',
        documentType: 'claim'
      },
      {
        id: 'out-4',
        title: 'Calendar & family notifications dispatched',
        code: 'COMMS-SYNC',
        primaryDetail: 'Google Workspace Calendar',
        statusDetail: 'Auto-Rescheduled',
        secondaryDetail: 'SMS updates delivered to UK Executive Host and family emergency contact (Mark Jenkins).',
        artifactLabel: 'Host Contact:',
        artifactValue: 'Acknowledged 10:46 EST',
        verificationLabel: 'Emergency Channel:',
        verificationValue: 'Delivered via Telco SS7 signed receipt',
        footerHash: 'Receipt: msg_883012',
        ctaText: 'View Comms Trail',
        documentType: 'comms'
      }
    ],
    verificationProofs: [
      {
        id: 'proof-1',
        title: 'Flight E-Ticket Dossier (#X99KLR)',
        type: 'flight',
        verificationText: 'Verified by British Airways NDC Authority • Token 9f82…31c0',
        icon: 'flight_takeoff',
        downloadable: true
      },
      {
        id: 'proof-2',
        title: 'Heathrow Transit Hotel Voucher (#HTL-8829)',
        type: 'hotel',
        verificationText: 'Direct CRS Confirmation • Hilton LHR Terminal 5 Duty of Care',
        icon: 'hotel',
        downloadable: true
      },
      {
        id: 'proof-3',
        title: 'CAA Statutory Claim Submission Packet',
        type: 'claim',
        verificationText: 'UK CAA Gateway Timestamped: 10:45:11 EST • Case Ref #CLM-2024-9104',
        icon: 'gavel',
        downloadable: true
      },
      {
        id: 'proof-4',
        title: 'Notification Delivery Receipts & Signatures',
        type: 'signature',
        verificationText: 'Signed Webhook Handshakes • Google Workspace & Twilio Telemetry',
        icon: 'mark_email_read',
        downloadable: false
      }
    ]
  }
};

// Initial Documents
const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    filename: 'e-ticket_BA112_cancellation.pdf',
    fileType: 'PDF Document',
    caseId: '1048',
    caseNumber: '#1048',
    caseTitle: 'Flight cancellation and full compensation',
    date: 'Today, 10:39 EST',
    size: '1.2 MB',
    processingState: 'verified',
    evidenceRelevance: 'Primary intake evidence. Confirmed cancelled flight status & booking class.',
    signature: 'SHA256: 3c9b..881a',
    previewSnippet: 'PASSENGER TICKET & BAGGAGE CHECK - BRITISH AIRWAYS. FLIGHT BA112 NEW YORK JFK TO LONDON HEATHROW. STATUS: CANCELLED. FARE BASIS: J2BAUS.'
  },
  {
    id: 'doc-2',
    filename: 'BA178_eTicket_receipt_confirmed.pdf',
    fileType: 'Electronic Ticket / NDC',
    caseId: '1048',
    caseNumber: '#1048',
    caseTitle: 'Flight cancellation and full compensation',
    date: 'Today, 10:44 EST',
    size: '840 KB',
    processingState: 'verified',
    evidenceRelevance: 'Executed replacement booking. British Airways confirmed PNR #X99KLR.',
    signature: 'NDC-TOKEN: 9f82..31c0',
    previewSnippet: 'ELECTRONIC TICKET RECEIPT - REBOOKING AUTHORIZED. BA178 DEPARTURE JFK 20:40 SEAT 14B WORLD TRAVELLER PLUS.'
  },
  {
    id: 'doc-3',
    filename: 'Hilton_LHR_T5_Voucher_88291.pdf',
    fileType: 'Accommodation Voucher',
    caseId: '1048',
    caseNumber: '#1048',
    caseTitle: 'Flight cancellation and full compensation',
    date: 'Today, 10:45 EST',
    size: '412 KB',
    processingState: 'verified',
    evidenceRelevance: 'Complimentary transit lodging under statutory airline duty of care.',
    signature: 'CRS: hlt_55941',
    previewSnippet: 'HILTON HEATHROW TERMINAL 5 - PASSENGER DISTRESS VOUCHER #HTL-88291-LHR. 1 NIGHT COMPLIMENTARY ROOM & SHUTTLE.'
  },
  {
    id: 'doc-4',
    filename: 'UK261_CAA_Statutory_Claim_Packet.pdf',
    fileType: 'Legal / Regulatory Claim',
    caseId: '1048',
    caseNumber: '#1048',
    caseTitle: 'Flight cancellation and full compensation',
    date: 'Today, 10:46 EST',
    size: '2.4 MB',
    processingState: 'verified',
    evidenceRelevance: 'Statutory compensation submission package refuting extraordinary weather delay.',
    signature: 'CAA-SEAL: UK-261-REV',
    previewSnippet: 'CIVIL AVIATION AUTHORITY PASSENGER RIGHTS DISPUTE FORM. FLIGHT BA112 DELAY IN EXCESS OF 4 HOURS. RECOVERY SUM: £520.'
  },
  {
    id: 'doc-5',
    filename: 'state_farm_homeowner_policy_dec.pdf',
    fileType: 'Insurance Policy',
    caseId: '1049',
    caseNumber: '#1049',
    caseTitle: 'Homeowner insurance claim for burst pipe emergency',
    date: 'Today, 09:40 EST',
    size: '3.8 MB',
    processingState: 'processing',
    evidenceRelevance: 'Policy declaration pages used to confirm Section 4b burst pipe water hazard clause.',
    previewSnippet: 'STATE FARM PREMIER HOMEOWNERS POLICY - CLAUSE 4B DISCHARGE OF WATER OR STEAM COVERAGE.'
  },
  {
    id: 'doc-6',
    filename: 'emergency_plumber_itemized_receipt.pdf',
    fileType: 'Invoice / Service Bill',
    caseId: '1049',
    caseNumber: '#1049',
    caseTitle: 'Homeowner insurance claim for burst pipe emergency',
    date: 'Today, 09:42 EST',
    size: '980 KB',
    processingState: 'verified',
    evidenceRelevance: 'Emergency mitigation fee of $1,240 payable under insurer duty to mitigate.',
    previewSnippet: 'ALL-HOURS PLUMBING SERVICES - EMERGENCY SHUTOFF, PIPE REPLACEMENT, SUBFLOOR DRYING. TOTAL: $1,240.00.'
  },
  {
    id: 'doc-7',
    filename: 'apartment_lease_deposit_rider_clause4b.pdf',
    fileType: 'Tenancy Contract',
    caseId: '1027',
    caseNumber: '#1027',
    caseTitle: 'Apartment security deposit return negotiation',
    date: 'Yesterday, 14:15 EST',
    size: '1.6 MB',
    processingState: 'archived',
    evidenceRelevance: 'Lease clause 4b precluding wear-and-tear deductions for wall repaint.',
    signature: 'NOTARIZED-SEAL-NY',
    previewSnippet: 'RESIDENTIAL LEASE AGREEMENT RIDER - SECTION 4B: ORDINARY WEAR AND TEAR REPAINTING SOLELY LANDLORD RESPONSIBILITY.'
  }
];

// Initial Connected Services
const INITIAL_CONNECTIONS: ConnectionItem[] = [
  {
    id: 'conn-ba',
    name: 'British Airways Executive Club',
    category: 'Travel & Airlines',
    status: 'connected',
    icon: 'flight_takeoff',
    description: 'Direct NDC booking authority, frequent flyer tier benefits, and automatic re-routing permissions.',
    lastSynced: '2 mins ago',
    permissions: ['Read itinerary status', 'Hold seat allocations', 'Auto-submit passenger duty claims']
  },
  {
    id: 'conn-gcal',
    name: 'Google Workspace Calendar',
    category: 'Calendar & Comms',
    status: 'connected',
    icon: 'calendar_month',
    description: 'Real-time schedule awareness for meeting conflicts, auto-rescheduling, and arrival notifications.',
    lastSynced: 'Just now',
    permissions: ['View calendar events', 'Update arrival event blocks', 'Dispatch stakeholder notifications']
  },
  {
    id: 'conn-chase',
    name: 'Chase Sapphire Reserve',
    category: 'Financial & Cards',
    status: 'connected',
    icon: 'credit_card',
    description: 'Automated travel protection claim matching, fare diff pre-authorization, and wire recovery verification.',
    lastSynced: '14 mins ago',
    permissions: ['Verify settlement transfers', 'Authorize pre-approved travel deltas up to $150']
  },
  {
    id: 'conn-outlook',
    name: 'Microsoft 365 / Outlook',
    category: 'Calendar & Comms',
    status: 'connected',
    icon: 'mail',
    description: 'Drafted notification staging and dispatch for corporate calendar hosts.',
    lastSynced: '18 mins ago',
    permissions: ['Draft outgoing status emails', 'Read airline confirmation dispatches']
  },
  {
    id: 'conn-hilton',
    name: 'Hilton Honors & Partner CRS',
    category: 'Hospitality',
    status: 'connected',
    icon: 'hotel',
    description: 'Transit voucher direct redemption and airport hotel digital key delivery.',
    lastSynced: '1 hour ago',
    permissions: ['Redeem airline distress vouchers', 'Execute digital check-in']
  },
  {
    id: 'conn-uber',
    name: 'Uber for Business',
    category: 'Travel & Airlines',
    status: 'not_connected',
    icon: 'directions_car',
    description: 'Automated airport transfer dispatch for missed connection airport switches.',
    permissions: ['Dispatch airport ride vouchers', 'Itemize ground transit for carrier reimbursement']
  },
  {
    id: 'conn-statefarm',
    name: 'State Farm Claims Vault',
    category: 'Government & Legal',
    status: 'needs_attention',
    icon: 'shield',
    description: 'Automated policy declaration lookup and adjuster meeting scheduling.',
    lastSynced: 'Yesterday',
    permissions: ['Submit documentation evidence packets', 'Track loss adjuster assignments']
  }
];

// In-Memory mutable storage for demo state continuity
class RelayApiService {
  private cases: Record<string, CaseData> = { ...INITIAL_CASES };
  private outcomes: Record<string, CaseOutcome> = { ...INITIAL_OUTCOMES };
  private documents: DocumentItem[] = [...INITIAL_DOCUMENTS];
  private connections: ConnectionItem[] = [...INITIAL_CONNECTIONS];

  // List all cases
  async listCases(): Promise<CaseData[]> {
    return Object.values(this.cases);
  }

  // Get specific case by id
  async getCase(id: string): Promise<CaseData | null> {
    return this.cases[id] || null;
  }

  // Create a new case from intake
  async createCase(input: {
    problemStatement: string;
    attachments?: string[];
    objectives?: string[];
  }): Promise<CaseData> {
    const nextId = String(1050 + Math.floor(Math.random() * 100));
    
    const newCase: CaseData = {
      id: nextId,
      caseNumber: nextId,
      title: input.problemStatement.slice(0, 60) + (input.problemStatement.length > 60 ? '...' : ''),
      originalRequest: input.problemStatement,
      status: 'in_progress',
      statusLabel: 'IN PROGRESS',
      updatedAt: 'Just now',
      autonomousLead: 'Relay Autonomous Pod 1',
      totalTasks: 4,
      completedTasks: 1,
      progressPercent: 25,
      stages: [
        { stage: 'understand', label: '1. UNDERSTAND', status: 'completed', summary: 'Deconstructed real-world problem and objectives' },
        { stage: 'plan', label: '2. PLAN', status: 'active', summary: 'Execution plan generated' },
        { stage: 'execute', label: '3. EXECUTE', status: 'pending', summary: 'Awaiting scheduled sub-routines' },
        { stage: 'verify', label: '4. VERIFY', status: 'pending', summary: 'Targeting cryptographic proof' },
        { stage: 'resolved', label: '5. RESOLVED', status: 'pending', summary: 'Pending final outcome' }
      ],
      tasks: (input.objectives || [
        'Analyze statutory rights and claim prerequisites',
        'Coordinate replacement services',
        'Submit formal documentation packet',
        'Verify confirmed outcome'
      ]).map((obj, idx) => ({
        id: `t-new-${idx + 1}`,
        title: `Task ${idx + 1}: ${obj}`,
        description: `Autonomous agent working on: ${obj}`,
        status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'queued',
        badge: idx === 0 ? 'Verified' : idx === 1 ? 'Active' : 'Queued',
        badgeType: idx === 0 ? 'tertiary' : idx === 1 ? 'primary' : 'secondary'
      })),
      provenanceChain: [
        { id: 'p1', label: 'Intake Source', value: 'Multi-Modal Web Console', subValue: 'Verified user input' },
        { id: 'p2', label: 'Execution Intent', value: 'Autonomous Delegation', subValue: 'Human guardrails enforced' }
      ],
      targetOutcomes: (input.objectives || ['Problem completely resolved']).map(obj => ({
        text: obj,
        completed: false
      })),
      groundTruth: {
        passenger: 'Sarah Jenkins',
        route: 'Direct Delegation',
        originalPnr: `#RLY-${nextId}`,
        travelClass: 'Standard Executive'
      },
      connectedSeals: [
        { name: 'Google Workspace Calendar', icon: 'calendar_month', status: 'synced' }
      ],
      activityFeed: [
        {
          id: `act-${Date.now()}-1`,
          agentName: 'Intake Agent',
          timeString: 'Just now',
          description: 'Problem received, parsed constraints, initialized autonomous execution pipeline.'
        }
      ],
      documentsCount: input.attachments ? input.attachments.length : 0
    };

    this.cases[nextId] = newCase;
    return newCase;
  }

  // Get case activity feed
  async getCaseActivity(caseId: string): Promise<ActivityEvent[]> {
    const c = this.cases[caseId];
    return c ? c.activityFeed : [];
  }

  // Get case tasks
  async getCaseTasks(caseId: string): Promise<Task[]> {
    const c = this.cases[caseId];
    return c ? c.tasks : [];
  }

  // Get case outcome
  async getCaseOutcome(caseId: string): Promise<CaseOutcome | null> {
    return this.outcomes[caseId] || this.outcomes['1048'] || null;
  }

  // Approve consequential action
  async approveAction(caseId: string, approvalId: string): Promise<CaseData> {
    const c = this.cases[caseId];
    if (!c) throw new Error(`Case #${caseId} not found`);

    if (c.approval) {
      c.approval.status = 'approved';
    }

    // Advance tasks
    c.tasks = c.tasks.map(t => {
      if (t.status === 'pending_approval') {
        return {
          ...t,
          status: 'completed' as const,
          badge: 'Approved & Ticketed',
          badgeType: 'tertiary' as const,
          actionRequired: false
        };
      }
      if (t.status === 'hold_confirmed') {
        return {
          ...t,
          status: 'completed' as const,
          badge: 'Confirmed & Checked In',
          badgeType: 'tertiary' as const
        };
      }
      return t;
    });

    c.completedTasks = Math.min(c.totalTasks, c.completedTasks + 1);
    c.progressPercent = Math.round((c.completedTasks / c.totalTasks) * 100);

    c.activityFeed.unshift({
      id: `act-${Date.now()}`,
      agentName: 'Human Authorization Gate',
      timeString: 'Just now',
      description: `User authorized consequential action (Fare delta +$84.00 approved). Signed to Case #${caseId} ledger.`
    });

    return c;
  }

  // Pause case
  async pauseCase(caseId: string): Promise<CaseData> {
    const c = this.cases[caseId];
    if (!c) throw new Error(`Case #${caseId} not found`);
    c.status = 'paused';
    c.statusLabel = 'PAUSED';
    c.activityFeed.unshift({
      id: `act-${Date.now()}`,
      agentName: 'Operations Controller',
      timeString: 'Just now',
      description: 'Autonomous execution paused by user.'
    });
    return c;
  }

  // Resume case
  async resumeCase(caseId: string): Promise<CaseData> {
    const c = this.cases[caseId];
    if (!c) throw new Error(`Case #${caseId} not found`);
    c.status = 'in_progress';
    c.statusLabel = 'IN PROGRESS';
    c.activityFeed.unshift({
      id: `act-${Date.now()}`,
      agentName: 'Operations Controller',
      timeString: 'Just now',
      description: 'Autonomous execution resumed. Dispatching agents.'
    });
    return c;
  }

  // Get all documents
  async getDocuments(): Promise<DocumentItem[]> {
    return [...this.documents];
  }

  // Upload document
  async uploadDocument(file: { name: string; size: string; caseId?: string }): Promise<DocumentItem> {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      filename: file.name,
      fileType: 'Uploaded Evidence',
      caseId: file.caseId || '1048',
      caseNumber: file.caseId ? `#${file.caseId}` : '#1048',
      caseTitle: 'Flight cancellation and full compensation',
      date: 'Just now',
      size: file.size,
      processingState: 'verified',
      evidenceRelevance: 'User uploaded context file. Cryptographically digested into ledger.',
      signature: `SHA-256: ${Math.random().toString(16).slice(2, 10)}...`
    };
    this.documents.unshift(newDoc);
    return newDoc;
  }

  // Get connections
  async getConnections(): Promise<ConnectionItem[]> {
    return [...this.connections];
  }

  // Toggle connection status
  async toggleConnection(id: string): Promise<ConnectionItem> {
    const item = this.connections.find(c => c.id === id);
    if (!item) throw new Error(`Connection ${id} not found`);
    item.status = item.status === 'connected' ? 'not_connected' : 'connected';
    item.lastSynced = 'Just now';
    return item;
  }
}

export const relayApi = new RelayApiService();
