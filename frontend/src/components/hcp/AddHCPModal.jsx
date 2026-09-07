import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addHCP } from "../../redux/slices/hcpSlice";
import { SPECIALTIES, HOSPITALS, PRODUCTS_CATALOG } from "../../constants/mockData";
import Modal from "../common/Modal";
import Button from "../common/Button";
import toast from "react-hot-toast";

export default function AddHCPModal({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    qualification: "MBBS, MD",
    specialty: SPECIALTIES[0],
    hospital: HOSPITALS[0],
    department: "",
    city: "New Delhi",
    state: "Delhi",
    tier: "Tier 1",
    priority: "High",
    email: "",
    phone: "",
    preferredTime: "Tuesdays & Thursdays, 2:00 PM - 4:00 PM",
    prescribingPotential: "High (₹15L+/month)",
    productsOfInterest: ["CardioPlus 50mg"],
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Doctor Name is required";
    if (!formData.specialty) errs.specialty = "Specialty is required";
    if (!formData.hospital) errs.hospital = "Hospital is required";
    if (!formData.city.trim()) errs.city = "City is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in required fields.");
      return;
    }

    dispatch(addHCP(formData));
    toast.success(`${formData.name} added to HCP Directory!`);
    onClose();
  };

  const toggleProduct = (prodName) => {
    setFormData((prev) => {
      const exists = prev.productsOfInterest.includes(prodName);
      return {
        ...prev,
        productsOfInterest: exists
          ? prev.productsOfInterest.filter((p) => p !== prodName)
          : [...prev.productsOfInterest, prodName],
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Healthcare Professional"
      subtitle="Register a new doctor, key opinion leader, or hospital account"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Ramesh Gupta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full text-xs sm:text-sm p-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.name ? "border-rose-400" : "border-slate-300"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qualifications & Degrees
            </label>
            <input
              type="text"
              placeholder="e.g. MD (Cardiology), DM, FACC"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Specialty & Hospital */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specialization <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.specialty}
              onChange={(e) =>
                setFormData({ ...formData, specialty: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {SPECIALTIES.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hospital / Institution <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.hospital}
              onChange={(e) =>
                setFormData({ ...formData, hospital: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {HOSPITALS.map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tier & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Tier
            </label>
            <select
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="KOL">KOL (Key Opinion Leader)</option>
              <option value="Tier 1">Tier 1 (High Potential)</option>
              <option value="Tier 2">Tier 2 (Standard)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City / Territory <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. New Delhi"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="doctor@hospital.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone / WhatsApp
            </label>
            <input
              type="text"
              placeholder="+91 98000 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Products of Interest */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Key Pharma Products of Interest
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS_CATALOG.map((prod) => {
              const isSelected = formData.productsOfInterest.includes(prod.name);
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => toggleProduct(prod.name)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {prod.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Background / Detailing Notes
          </label>
          <textarea
            rows="2"
            placeholder="Clinical trial interests, publication history, preferred days for visits..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Healthcare Professional
          </Button>
        </div>
      </form>
    </Modal>
  );
}
