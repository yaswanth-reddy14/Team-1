import {useState,useRef} from 'react';
import AuroraBackground from '../components/AuroraBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';
import axios from 'axios';
// Leaflet map imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix missing Leaflet marker icons (use local assets)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


//Capture map click location
function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
}

export default function ReportIssue() {
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [priority, setPriority] = useState('Select Priority');
  const [issueType, setIssueType] = useState('Select Issue Type');
  const fileInputRef = useRef(null);


  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  //Remove image from preview
    const removeImage = (index) => {
    setImages((prev) => {
       const updated = prev.filter((_, i) => i !== index);

    // Reset file input if no images left
      if (updated.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return updated;
    });
   };

   // Handle form submission
   const handleSubmit = async (e) => {
      e.preventDefault();

     const formData = new FormData();
     formData.append('title', e.target.title.value);
     formData.append('priority', priority);
     formData.append('issueType', issueType);
     formData.append('address', e.target.address.value);
     formData.append('description', e.target.description.value);
     formData.append('location', JSON.stringify(location));
     //append images
      images.forEach((img) => {
        formData.append('images', img);
      });
      //submit form data to backend
      try {
        const res= await axios.post(
          'http://localhost:4000/api/issues/create',formData,{
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        alert('Issue reported successfully!');
        console.log(res.data);
      }
      catch (err) {
        console.error(err);
        alert('Error reporting issue. Please try again.');
      }

   };

  return (
   <div className=" flex flex-col"> 
     {/* Aurora Background */}
     <AuroraBackground/>
      {/* Navbar */}
      <Navbar/>
      {/* Page Container */}
       <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
        <div className="max-w-300 mx-auto">


        <h1 className="text-3xl font-bold mb-8 text-gray-800">Report an Issue</h1>

        {/* Main Card */}
        <form
          onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ">

          {/* Left Side - Form */}
          <div className="space-y-5">
            <h2 className= "text-xl font-semibold text-gray-700">
              Issue Details 
            </h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Issue Title *
              </label>
              <input
                name="title"
                type="text"
                placeholder='Eg: Garbage not collected'
                className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 
                focus:border-cyan-400 
                focus: ring-cyan-100 outline-none transition"
              />
            </div>

            {/*Priority */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority *
              </label>
              <CustomSelect
                value={priority}
                onChange={setPriority}
                options={['Low', 'Medium', 'High']}
              />
            </div>
            {/* Issue Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Issue Type *
              </label>
              <CustomSelect
                value={issueType}
                onChange={setIssueType}
                options={['Garbage', 'Road Damage', 'Water Leakage', 'Street Light', 'Other']}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Address *
              </label>
              <input
                name="address"
                type="text"
                placeholder='street/area, city, state, zip code'
                className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 
                focus:border-cyan-400 
                focus: ring-cyan-100 outline-none transition"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">
                  Choose Images *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0"
                id="imageUpload"
              />

              {/* Image Previews */}
              {images.length > 0 && (
                <div className= "flex gap-3 mt-3 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} 
                      className="w-24 h-24 rounded-xl overflow-hidden border relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    

                       {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white 
                            rounded-full w-6 h-6 flex items-center 
                            justify-center text-sm hover:bg-black"
                          >
                            ✕
                          </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
                
          </div>

             {/* Right Side */}
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-700">
              Description and Location
            </h2>

            {/* Description */}
            <textarea
              name="description"
              rows="5"
              placeholder="Describe the issue in detail..."
              className="w-full border-2 p-3 rounded-2xl input-glow hover:border-cyan-200 
                focus:border-cyan-400 
                focus: ring-cyan-100 outline-none transition"
              />

            {/* Map */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Location on Map
              </label>
              <div className="h-65 rounded-2xl overflow-hidden border shadow-sm">
                <MapContainer
                  center={[13.6288, 79.4192]} //Tirupati coordinates
                  zoom={12}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                  />
                  <LocationPicker setLocation={setLocation} />
                  {location && <Marker position={location} />}
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click on the map to mark the exact location of the issue.
              </p>
            </div>
          </div>
           {/* Submit Button */}
               <div className="col-span-full flex justify-center mt-6">
                <button
                 type="submit"
                 className="w-full sm:w-auto sm:min-w-75 px-10
                  bg-blue-700 text-white py-3 rounded-xl font-semibold
                   hover:bg-blue-800 transition">
                  Submit Issue
                 </button>
               </div>
        </form>
        </div>
       </div>
       
        {/*Footer */}
        <Footer/>
         
      
   </div>
  );
}