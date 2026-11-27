"""Load the demo organization's HCPs, products and interactions.

Usage (from backend/, after `alembic upgrade head`):
    python seed.py           # seeds once; skips if the demo org already has data
    python seed.py --reset   # deletes the demo org's data and seeds again

Demo logins (password for both: Demo@123):
    rep@demo.com       field rep, sees the HCPs assigned to them
    manager@demo.com   manager, sees the whole organization
"""

import argparse
import sys
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core import config
from app.core.security import hash_password
from app.database.database import get_engine
from app.models import HCP, FollowUp, Interaction, Organization, Product, User

IST = timezone(timedelta(hours=5, minutes=30))

DEMO_PASSWORD = "Demo@123"

USERS = [
    {"full_name": "Arjun Rao", "email": "rep@demo.com", "role": "rep"},
    {"full_name": "Kavita Nair", "email": "manager@demo.com", "role": "manager"},
]

# HCPs left unassigned are visible to the manager only.
UNASSIGNED_HCPS = {"hcp-7", "hcp-8"}

PRODUCTS = [
    {"name": "CardioPlus 50mg", "category": "Cardiovascular", "indication": "Hypertension & Heart Failure", "formula": "Metoprolol Succinate + Telmisartan", "status": "Primary Focus"},
    {"name": "NeuroGuard XR", "category": "Neurology", "indication": "Neuropathic Pain & Post-Stroke Recovery", "formula": "Pregabalin + Methylcobalamin XR", "status": "Growth Driver"},
    {"name": "OrthoFlex Plus", "category": "Orthopedics", "indication": "Osteoarthritis & Joint Mobility", "formula": "Glucosamine Sulfate + Collagen Peptides", "status": "Mature"},
    {"name": "OncoShield 250", "category": "Oncology", "indication": "Targeted Oncology Therapy", "formula": "Erlotinib Hydrochloride 250mg", "status": "High Priority"},
    {"name": "GlucoCare Duo", "category": "Endocrinology", "indication": "Type 2 Diabetes Mellitus", "formula": "Dapagliflozin + Metformin SR", "status": "Growth Driver"},
    {"name": "RespiraEase Inhaler", "category": "Pulmonology", "indication": "Asthma & Severe COPD", "formula": "Budesonide + Formoterol Fumarate", "status": "Standard"},
    {"name": "GastroShield 40mg", "category": "Gastroenterology", "indication": "GERD & Gastric Ulcers", "formula": "Esomeprazole Magnesium 40mg", "status": "Standard"},
]

HCPS = [
    {
        "key": "hcp-1", "name": "Dr. Rahul Sharma", "qualification": "MD, DM (Cardiology), FACC",
        "specialty": "Cardiology", "hospital": "Apollo Hospital", "department": "Department of Interventional Cardiology",
        "city": "New Delhi", "state": "Delhi", "tier": "KOL", "priority": "High", "status": "Active",
        "email": "dr.rahul.sharma@apollohospitals.com", "phone": "+91 98112 34567",
        "preferred_time": "Tuesdays & Thursdays, 2:00 PM - 4:00 PM", "prescribing_potential": "Very High (₹25L+/month)",
        "products_of_interest": ["CardioPlus 50mg", "GlucoCare Duo"], "last_visit": date(2026, 7, 14),
        "notes": "Key opinion leader for cardiovascular clinical trials. Very receptive to new clinical trial data on CardioPlus outcome studies. Prefers concise scientific abstracts.",
        "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    },
    {
        "key": "hcp-2", "name": "Dr. Priya Mehta", "qualification": "MBBS, MD (Neurology), DNB",
        "specialty": "Neurology", "hospital": "Fortis Memorial Research Institute", "department": "Neurosciences & Stroke Unit",
        "city": "Gurugram", "state": "Haryana", "tier": "Tier 1", "priority": "High", "status": "Active",
        "email": "priya.mehta@fortishealthcare.com", "phone": "+91 98234 56789",
        "preferred_time": "Mondays & Wednesdays, 11:00 AM - 1:00 PM", "prescribing_potential": "High (₹18L+/month)",
        "products_of_interest": ["NeuroGuard XR"], "last_visit": date(2026, 7, 12),
        "notes": "Focuses on post-stroke neurological rehabilitation and epilepsy management. Requested comparative bio-availability study for NeuroGuard XR.",
        "avatar": "https://images.unsplash.com/photo-1594824813591-9657b98ec517?w=150&auto=format&fit=crop&q=80",
    },
    {
        "key": "hcp-3", "name": "Dr. Amit Verma", "qualification": "MS (Orthopaedics), M.Ch (Joint Replacement)",
        "specialty": "Orthopedics", "hospital": "Medanta - The Medicity", "department": "Orthopedic & Joint Reconstruction",
        "city": "Gurugram", "state": "Haryana", "tier": "Tier 1", "priority": "High", "status": "Active",
        "email": "amit.verma@medanta.org", "phone": "+91 98450 12345",
        "preferred_time": "Fridays, 3:00 PM - 5:30 PM", "prescribing_potential": "High (₹15L+/month)",
        "products_of_interest": ["OrthoFlex Plus"], "last_visit": date(2026, 7, 10),
        "notes": "High-volume robotic joint surgeon. Currently prescribing competitor brand OrthoMax but noted excellent patient feedback on OrthoFlex Plus recovery times.",
        "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    },
    {
        "key": "hcp-4", "name": "Dr. Sneha Kapoor", "qualification": "MD (Pediatrics), FIAP",
        "specialty": "Pediatrics", "hospital": "Max Super Speciality Hospital", "department": "Pediatric Critical Care & Neonatology",
        "city": "New Delhi", "state": "Delhi", "tier": "Tier 2", "priority": "Medium", "status": "Active",
        "email": "dr.sneha@maxhealthcare.com", "phone": "+91 97123 45678",
        "preferred_time": "Saturdays, 10:00 AM - 12:00 PM", "prescribing_potential": "Medium (₹8L+/month)",
        "products_of_interest": ["RespiraEase Inhaler", "GlucoCare Duo"], "last_visit": date(2026, 7, 8),
        "notes": "Interested in pediatric dosage guidelines and palatable syrup formulations. Requested 20 starter patient kits.",
        "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    },
    {
        "key": "hcp-5", "name": "Dr. Rajesh Kulkarni", "qualification": "MD, DM (Medical Oncology)",
        "specialty": "Oncology", "hospital": "AIIMS (All India Institute of Medical Sciences)", "department": "Department of Medical Oncology",
        "city": "New Delhi", "state": "Delhi", "tier": "KOL", "priority": "High", "status": "Active",
        "email": "rajesh.kulkarni@aiims.edu", "phone": "+91 98333 11223",
        "preferred_time": "Wednesdays, 4:00 PM - 5:00 PM", "prescribing_potential": "Very High (₹35L+/month)",
        "products_of_interest": ["OncoShield 250"], "last_visit": date(2026, 7, 6),
        "notes": "Head of AIIMS Thoracic Oncology division. Key committee member for institutional procurement. Strongly interested in our patient assistance program.",
        "avatar": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80",
    },
    {
        "key": "hcp-6", "name": "Dr. Ananya Sengupta", "qualification": "MD (Endocrinology), FACE",
        "specialty": "Endocrinology", "hospital": "Manipal Hospital", "department": "Diabetes & Endocrine Sciences",
        "city": "Bengaluru", "state": "Karnataka", "tier": "Tier 1", "priority": "High", "status": "Active",
        "email": "ananya.sengupta@manipalhospitals.com", "phone": "+91 99001 23456",
        "preferred_time": "Thursdays, 1:00 PM - 3:00 PM", "prescribing_potential": "High (₹16L+/month)",
        "products_of_interest": ["GlucoCare Duo"], "last_visit": date(2026, 7, 5),
        "notes": "Active speaker in South Asia Diabetes Summit. Emphasizes HbA1c reduction without hypoglycemia risk.",
        "avatar": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&auto=format&fit=crop&q=80",
    },
    {
        "key": "hcp-7", "name": "Dr. Vikramaditya Rao", "qualification": "MD, DNB (Gastroenterology)",
        "specialty": "Gastroenterology", "hospital": "Apollo Hospital", "department": "Institute of Liver & Digestive Sciences",
        "city": "Chennai", "state": "Tamil Nadu", "tier": "Tier 2", "priority": "Medium", "status": "Active",
        "email": "v.rao@apollohospitals.com", "phone": "+91 98400 98765",
        "preferred_time": "Mondays, 2:30 PM - 4:00 PM", "prescribing_potential": "Medium (₹10L+/month)",
        "products_of_interest": ["GastroShield 40mg"], "last_visit": date(2026, 6, 28),
        "notes": "Specializes in acid-peptic disorders and GERD management. Requested patient education brochures for GastroShield.",
        "avatar": "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=150&auto=format&fit=crop&q=80",
    },
    {
        "key": "hcp-8", "name": "Dr. Meenakshi Iyer", "qualification": "MD (Pulmonology), FCCP",
        "specialty": "Pulmonology", "hospital": "Fortis Hospital", "department": "Chest Medicine & Sleep Disorders",
        "city": "Mumbai", "state": "Maharashtra", "tier": "Tier 2", "priority": "Medium", "status": "Follow-up",
        "email": "meenakshi.iyer@fortis.in", "phone": "+91 98200 54321",
        "preferred_time": "Tuesdays, 12:00 PM - 2:00 PM", "prescribing_potential": "Medium (₹11L+/month)",
        "products_of_interest": ["RespiraEase Inhaler"], "last_visit": date(2026, 6, 25),
        "notes": "Interested in device ergonomics and inhaler dosage counter visibility for elderly COPD patients.",
        "avatar": "https://images.unsplash.com/photo-1594824813636-f0f37aa5905d?w=150&auto=format&fit=crop&q=80",
    },
]

INTERACTIONS = [
    {
        "hcp": "hcp-1", "occurred_at": datetime(2026, 7, 14, 14, 30, tzinfo=IST),
        "channel": "In-Person Detailing", "products": ["CardioPlus 50mg", "GlucoCare Duo"], "sentiment": "Positive",
        "notes": "Detailed the Phase-3 REDUCE-HF trial data showing 24% reduction in CV re-hospitalizations. Dr. Sharma expressed high satisfaction with tolerability profile. Requested 15 patient trial packs and invited us to sponsor a hospital CME in August.",
        "summary": "Detailed the Phase-3 REDUCE-HF trial data showing significant CV hospitalization reduction. Doctor expressed positive reception regarding tolerability and asked for patient samples.",
        "follow_up_action": "Deliver 15 CardioPlus trial samples by Friday and draft sponsorship proposal for August cardiology CME.",
        "follow_up_date": date(2026, 7, 21),
    },
    {
        "hcp": "hcp-2", "occurred_at": datetime(2026, 7, 12, 11, 45, tzinfo=IST),
        "channel": "Clinic Round", "products": ["NeuroGuard XR"], "sentiment": "Neutral",
        "notes": "Discussed NeuroGuard XR once-daily dosing advantages over immediate-release generics. Dr. Mehta raised concerns about patient compliance with bedtime dosing and price differential.",
        "objections": "Patient compliance with bedtime dosing; price differential vs generics.",
        "summary": "Reviewed sustained-release formulation benefits for diabetic neuropathy patients. Discussed pricing concerns and bedtime tolerability.",
        "follow_up_action": "Provide comparative pharmacokinetics paper and price-per-day patient savings breakdown.",
        "follow_up_date": date(2026, 7, 19),
    },
    {
        "hcp": "hcp-5", "occurred_at": datetime(2026, 7, 6, 16, 15, tzinfo=IST),
        "channel": "Grand Round / Scientific Exchange", "products": ["OncoShield 250"], "sentiment": "Positive",
        "notes": "Presented 5-year overall survival Kaplan-Meier curves for OncoShield in EGFR-mutant NSCLC. Dr. Kulkarni confirmed that our drug is being added to the institutional formulary review agenda next month.",
        "summary": "High-impact scientific exchange on 5-year OS data. Key institutional approval milestone achieved with formulary inclusion pending.",
        "follow_up_action": "Submit formal dossier to AIIMS Pharmacy and Therapeutics (P&T) committee by July 20.",
        "follow_up_date": date(2026, 7, 20),
    },
]


def reset_org_data(db: Session, org_id: int) -> None:
    for model in (FollowUp, Interaction, HCP, Product, User):
        db.execute(delete(model).where(model.org_id == org_id))


def seed(db: Session, reset: bool) -> None:
    org = db.scalar(select(Organization).where(Organization.slug == config.DEMO_ORG_SLUG))
    if org is None:
        org = Organization(name="OmniHealth Demo", slug=config.DEMO_ORG_SLUG)
        db.add(org)
        db.flush()
    elif reset:
        reset_org_data(db, org.id)
    elif db.scalar(select(func.count()).select_from(HCP).where(HCP.org_id == org.id)):
        print(f"Org '{org.slug}' already has data; nothing to do (use --reset to reseed).")
        return

    password_hash = hash_password(DEMO_PASSWORD)
    users = [User(org_id=org.id, password_hash=password_hash, **u) for u in USERS]
    db.add_all(users)
    db.add_all(Product(org_id=org.id, **p) for p in PRODUCTS)
    db.flush()

    rep = users[0]
    hcps = {
        h["key"]: HCP(
            org_id=org.id,
            assigned_user_id=None if h["key"] in UNASSIGNED_HCPS else rep.id,
            **{k: v for k, v in h.items() if k != "key"},
        )
        for h in HCPS
    }
    db.add_all(hcps.values())
    db.flush()

    for item in INTERACTIONS:
        data = {k: v for k, v in item.items() if k != "hcp"}
        hcp = hcps[item["hcp"]]
        interaction = Interaction(org_id=org.id, hcp_id=hcp.id, user_id=rep.id, **data)
        db.add(interaction)
        db.flush()
        db.add(
            FollowUp(
                org_id=org.id,
                hcp_id=hcp.id,
                interaction_id=interaction.id,
                user_id=rep.id,
                due_date=item["follow_up_date"],
                action=item["follow_up_action"],
            )
        )
    print(
        f"Seeded org '{org.slug}': {len(users)} users, {len(PRODUCTS)} products, "
        f"{len(hcps)} HCPs, {len(INTERACTIONS)} interactions, {len(INTERACTIONS)} follow-ups."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reset", action="store_true", help="delete the demo org's data first")
    args = parser.parse_args()
    with Session(get_engine()) as db, db.begin():
        seed(db, reset=args.reset)
    return 0


if __name__ == "__main__":
    sys.exit(main())
