export const PRODUCTS_CATALOG = [
  { id: "prod-1", name: "CardioPlus 50mg", category: "Cardiovascular", indication: "Hypertension & Heart Failure", formula: "Metoprolol Succinate + Telmisartan", status: "Primary Focus" },
  { id: "prod-2", name: "NeuroGuard XR", category: "Neurology", indication: "Neuropathic Pain & Post-Stroke Recovery", formula: "Pregabalin + Methylcobalamin XR", status: "Growth Driver" },
  { id: "prod-3", name: "OrthoFlex Plus", category: "Orthopedics", indication: "Osteoarthritis & Joint Mobility", formula: "Glucosamine Sulfate + Collagen Peptides", status: "Mature" },
  { id: "prod-4", name: "OncoShield 250", category: "Oncology", indication: "Targeted Oncology Therapy", formula: "Erlotinib Hydrochloride 250mg", status: "High Priority" },
  { id: "prod-5", name: "GlucoCare Duo", category: "Endocrinology", indication: "Type 2 Diabetes Mellitus", formula: "Dapagliflozin + Metformin SR", status: "Growth Driver" },
  { id: "prod-6", name: "RespiraEase Inhaler", category: "Pulmonology", indication: "Asthma & Severe COPD", formula: "Budesonide + Formoterol Fumarate", status: "Standard" },
  { id: "prod-7", name: "GastroShield 40mg", category: "Gastroenterology", indication: "GERD & Gastric Ulcers", formula: "Esomeprazole Magnesium 40mg", status: "Standard" }
];

export const HOSPITALS = [
  "Apollo Hospital",
  "Fortis Memorial Research Institute",
  "Medanta - The Medicity",
  "Max Super Speciality Hospital",
  "AIIMS (All India Institute of Medical Sciences)",
  "Manipal Hospital"
];

export const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Oncology",
  "Endocrinology",
  "Gastroenterology",
  "Pulmonology"
];

export const TODAY_SCHEDULE = [
  {
    id: "sch-1",
    hcpId: "hcp-1",
    doctorName: "Dr. Rahul Sharma",
    specialty: "Cardiology",
    hospital: "Apollo Hospital, Room 304",
    time: "10:30 AM",
    type: "In-Person Detailing",
    objective: "Deliver requested CardioPlus 50mg trial packs and confirm CME sponsorship dates.",
    priority: "High",
    status: "Completed"
  },
  {
    id: "sch-2",
    hcpId: "hcp-3",
    doctorName: "Dr. Amit Verma",
    specialty: "Orthopedics",
    hospital: "Medanta - The Medicity, OPD Block B",
    time: "01:15 PM",
    type: "In-Person Detailing",
    objective: "Present OrthoFlex Plus patient mobility recovery index vs competitor standard.",
    priority: "High",
    status: "In Progress"
  },
  {
    id: "sch-3",
    hcpId: "hcp-4",
    doctorName: "Dr. Sneha Kapoor",
    specialty: "Pediatrics",
    hospital: "Max Super Speciality Hospital",
    time: "03:45 PM",
    type: "Virtual Tele-detail",
    objective: "Review pediatric RespiraEase dosage titration chart and deliver starter kits.",
    priority: "Medium",
    status: "Upcoming"
  },
  {
    id: "sch-4",
    hcpId: "hcp-8",
    doctorName: "Dr. Meenakshi Iyer",
    specialty: "Pulmonology",
    hospital: "Fortis Hospital, Chest Clinic",
    time: "05:30 PM",
    type: "Phone Follow-up",
    objective: "Check patient feedback on inhaler counter readability and schedule next clinic visit.",
    priority: "Medium",
    status: "Upcoming"
  }
];

export const NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Urgent Follow-up Due Today",
    description: "Dr. Rahul Sharma requested sample delivery and CME sponsorship details.",
    time: "15m ago",
    type: "alert",
    read: false
  },
  {
    id: "notif-2",
    title: "AI CRM Insight Generated",
    description: "New prescribing pattern detected: 28% increase in GlucoCare inquiries across South Delhi territory.",
    time: "1h ago",
    type: "ai",
    read: false
  },
  {
    id: "notif-3",
    title: "Formulary Agenda Update",
    description: "OncoShield 250 scheduled for AIIMS P&T committee review on July 20.",
    time: "4h ago",
    type: "success",
    read: true
  }
];