import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { doctorService } from "../services/doctorService";
import { appointmentService } from "../services/appointmentService";
import { assets } from "../assets/assets";
import RelatedAttendee from "../components/RelatedAttendee";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState({});

  const fetchDocInfo = async () => {
    try {
      const { data } = await doctorService.getDoctorById(docId);
      if (data.success) {
        setDocInfo(data.data.doctor);
      } else {
        toast.error("Doctor not found");
      }
    } catch (error) {
      toast.error("Failed to load doctor info");
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId]);

  // Generate slot times for 7 days
  useEffect(() => {
    if (!docInfo) return;

    const getAvailableSlots = () => {
      const slots = [];
      let today = new Date();

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        let endTime = new Date(currentDate);
        endTime.setHours(21, 0, 0, 0);

        if (today.getDate() === currentDate.getDate()) {
          const hours = currentDate.getHours();
          const minutes = currentDate.getMinutes();
          currentDate.setHours(hours > 10 ? hours + 1 : 10);
          currentDate.setMinutes(minutes > 30 ? 30 : 0);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        let timeSlots = [];
        while (currentDate < endTime) {
          let formattedTime = currentDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }

        slots.push(timeSlots);
      }
      setDocSlots(slots);
    };

    getAvailableSlots();
  }, [docInfo]);

  // Fetch booked slots for this doctor (public endpoint - no token needed)
  const fetchBookedSlots = async () => {
    try {
      const { data } = await doctorService.getDoctorSlots(docId);
      if (data.success) {
        setBookedSlots(data.data.slots_booked || {});
      }
    } catch {
      // Silently fail — slots will just show unblocked
    }
  };

  useEffect(() => {
    if (docInfo) {
      fetchBookedSlots();
    }
  }, [docInfo]);

  const isSlotBooked = (date, time) => {
    const dateStr = date.toISOString().split("T")[0];
    return Boolean(bookedSlots[dateStr]?.[time]);
  };

  const handleBooking = async () => {
    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to book an appointment");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const slotDate = docSlots[slotIndex][0].datetime.toISOString().split("T")[0];
      const { data } = await appointmentService.bookAppointment({
        docId,
        slotDate,
        slotTime,
        amount: docInfo.fees,
      });

      if (data.success) {
        toast.success("Appointment booked!");
        // Update booked slots locally
        setBookedSlots((prev) => ({ ...prev, [`${slotDate}_${slotTime}`]: true }));
        setSlotTime("");
        fetchBookedSlots();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!docInfo) {
    return <div className="flex justify-center items-center h-64"><p>Loading...</p></div>;
  }

  return (
    <div>
      {/* Doctor details */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt={docInfo.name} />
        </div>
        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium text-gray-900 mt-3">
            <p className="flex gap-1">About <img src={assets.info_icon} alt="" /></p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
          </div>
          <p className="text-gray-500 font-medium mt-4">
            Appointment fee: <span className="text-gray-600">{currencySymbol}{docInfo.fees}</span>
          </p>
          {docInfo.address && (
            <p className="text-gray-500 text-sm mt-2">
              {docInfo.address.line1}, {docInfo.address.line2}
            </p>
          )}
        </div>
      </div>

      {/* Booking Slots */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking Slots</p>
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
          {docSlots.map((item, index) => (
            <div
              onClick={() => { setSlotIndex(index); setSlotTime(""); }}
              key={index}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                slotIndex === index ? "bg-primary text-white" : "border border-gray-200"
              }`}
            >
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
          {docSlots[slotIndex]?.map((item, index) => {
            const booked = isSlotBooked(item.datetime, item.time);
            return (
              <p
                onClick={() => !booked && setSlotTime(item.time)}
                key={index}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                  item.time === slotTime
                    ? "bg-primary text-white"
                    : booked
                    ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                    : "text-gray-400 border border-gray-300"
                }`}
              >
                {item.time.toLowerCase()}
              </p>
            );
          })}
        </div>
        <button
          onClick={handleBooking}
          disabled={loading || !slotTime}
          className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 disabled:opacity-50"
        >
          {loading ? "Booking..." : "Book an appointment"}
        </button>
      </div>

      {/* Related Doctors */}
      <RelatedAttendee docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
