import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { doctorService } from "../services/doctorService";

const specialties = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

const Attendee = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDoctors = async (spec) => {
    setLoading(true);
    try {
      const { data } = await doctorService.getDoctors(spec || "");
      if (data.success) {
        setFilterDoc(data.data.doctors);
      }
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(speciality);
  }, [speciality]);

  return (
    <div>
      <p className="text-gray-600 text-sm mb-4">Browse through the doctors specialist.</p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-3">
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? "bg-primary text-white" : ""}`}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          Filters
        </button>

        <div className={`flex-col gap-2 text-sm text-gray-600 ${showFilter ? "flex" : "hidden sm:flex"}`}>
          <p
            onClick={() => {
              navigate("/doctors");
            }}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${!speciality ? "bg-indigo-100 text-black" : ""}`}
          >
            All
          </p>
          {specialties.map((spec) => (
            <p
              key={spec}
              onClick={() => {
                navigate(`/doctors/${encodeURIComponent(spec)}`);
              }}
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === spec ? "bg-indigo-100 text-black" : ""}`}
            >
              {spec}
            </p>
          ))}
        </div>

        <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
          {loading ? (
            <p className="text-gray-500">Loading doctors...</p>
          ) : filterDoc.length === 0 ? (
            <p className="text-gray-500">No doctors found.</p>
          ) : (
            filterDoc.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/appointment/${item._id}`)}
                className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              >
                <img className="bg-blue-50" src={item.image} alt={item.name} />
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-center text-green-500">
                    <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                    <p>Available</p>
                  </div>
                  <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                  <p className="text-gray-680 text-sm">{item.speciality}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendee;
