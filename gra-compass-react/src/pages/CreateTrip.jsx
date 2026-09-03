import { useState } from "react";
import "../components/CreateTrip.css";
import { useNavigate } from "react-router-dom";

const CreateTrip = ({ setTrips }) => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripImage, setTripImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!tripName.trim() || !destination.trim() || !startDate || !endDate) {
      alert("Trip name, destination, start date, and end date are required.");
      return;
    }

    const newTrip = {
      id: Date.now(),
      name: tripName.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      registrationCount: 0,
      imagePreview,
    };

    setTrips((currentTrips) => [...currentTrips, newTrip]);

    navigate("/");
  };

  return (
    <main className="create-trip-page">
      <h1>Create Trip</h1>
      <p>Enter the details for the new trip.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tripName">Trip Name</label>

          <input
            id="tripName"
            type="text"
            value={tripName}
            onChange={(event) => setTripName(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="destination">Destination</label>

          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="startDate">Start Date</label>

          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="endDate">End Date</label>

          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tripImage">Trip Image</label>

          <input
            id="tripImage"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files[0];

              setTripImage(file);

              if (file) {
                setImagePreview(URL.createObjectURL(file));
              } else {
                setImagePreview("");
              }
            }}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Trip preview"
              className="trip-image-preview"
            />
          )}
        </div>

        <button type="submit">Create Trip</button>
      </form>
    </main>
  );
};

export default CreateTrip;
