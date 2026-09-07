import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateHCP } from "../../redux/slices/hcpSlice";
import { SPECIALTIES, HOSPITALS, PRODUCTS_CATALOG } from "../../constants/mockData";
import Modal from "../common/Modal";
import Button from "../common/Button";
import toast from "react-hot-toast";

export default function EditHCPModal({ isOpen, onClose, doctor }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (doctor) {
      setFormData({
        ...doctor,
        productsOfInterest: doctor.productsOfInterest || [],
      });
    }
  }, [doctor]);

  if (!formData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Doctor Name is required.");
      return;
    }

    dispatch(updateHCP(formData));
    toast.success(`Updated profile for ${formData.name}`);
    onClose();
  };

  const toggleProduct = (prodName) => {
    setFormData((prev) => {
      const current = prev.productsOfInterest || [];
      const exists = current.includes(prodName);
      return {
        ...prev,
        productsOfInterest: exists
          ? current.filter((p) => p !== prodName)
          : [...current, prodName],
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile: ${formData.name}`}
      subtitle="Update doctor details, affiliation, and prescribing tier"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor Full Name
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qualifications & Degrees
            </label>
            <input
              type="text"
              value={formData.qualification || ""}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specialization
            </label>
            <select
              value={formData.specialty || SPECIALTIES[0]}
              onChange={(e) =>
                setFormData({ ...formData, specialty: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
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
              Hospital / Institution
            </label>
            <select
              value={formData.hospital || HOSPITALS[0]}
              onChange={(e) =>
                setFormData({ ...formData, hospital: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              {HOSPITALS.map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Tier
            </label>
            <select
              value={formData.tier || "Tier 1"}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="KOL">KOL (Key Opinion Leader)</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority || "Medium"}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || "Active"}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Active">Active</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Products of Interest */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Key Products of Interest
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS_CATALOG.map((prod) => {
              const isSelected = (formData.productsOfInterest || []).includes(
                prod.name
              );
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Notes
          </label>
          <textarea
            rows="2"
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
