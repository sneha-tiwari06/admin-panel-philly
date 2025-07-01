import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { BASE_IMAGE_URL } from "../../utils/axiosInstnace";

const AddGallery = () => {
  const { tourId, galleryId } = useParams();

  // console.log(tourId, "tourId");
  const navigate = useNavigate();

  const [galleryFields, setGalleryFields] = useState([
    { galleryAltText: "", file: null, imageUrl: "" },
  ]);

  useEffect(() => {
    if (galleryId) {
      const fetchGallery = async () => {
        try {
          const response = await axiosInstance.get(
            `/gallery/single/${galleryId}`
          );
          const data = response.data;
          // console.log("Fetched gallery data:", data);

          const initialData = [
            {
              galleryAltText: data.galleryAltText,
              file: null,
              imageUrl: `${BASE_IMAGE_URL}${data.imagePath}`,
            },
          ];

          setGalleryFields(initialData);
        } catch (err) {
          console.error("Error fetching gallery data:", err);
        }
      };
      fetchGallery();
    }
  }, [galleryId]);

  const handleInputChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedFields = [...galleryFields];

    if (name === "file") {
      updatedFields[index][name] = files[0];
      // Create a preview URL for the selected file
      updatedFields[index]["imageUrl"] = URL.createObjectURL(files[0]);
    } else {
      updatedFields[index][name] = value;
    }

    setGalleryFields(updatedFields);
  };

  const handleAddField = () => {
    setGalleryFields([
      ...galleryFields,
      { galleryAltText: "", file: null, imageUrl: "" },
    ]);
  };

  const handleRemoveField = (index) => {
    const updatedFields = galleryFields.filter((_, i) => i !== index);
    setGalleryFields(updatedFields);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("tourId", tourId);

      // Append gallery data (as JSON string)
      formData.append(
        "galleryData",
        JSON.stringify(
          galleryFields.map((field) => ({
            galleryAltText: field.galleryAltText,
          }))
        )
      );

      // Append all files
      galleryFields.forEach((field) => {
        if (field.file) {
          formData.append("files", field.file);
        }
      });

      if (galleryId) {
        // Edit mode (update one gallery item)
        await axiosInstance.post(`/gallery/update/${galleryId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create mode (upload multiple gallery items)
        await axiosInstance.post("/gallery", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Redirect after success
      if (tourId) {
        navigate(`/manage-gallery/${tourId}`);
      } else {
        console.error("tourId is undefined!");
      }
    } catch (err) {
      console.error("Error submitting gallery:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{galleryId ? "Edit" : "Add"} Gallery for Tour</h2>
            <Link to={`/manage-gallery/${tourId}`}>
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {galleryFields.map((gallery, index) => (
              <div className="row gx-3 gy-4 mb-3" key={index}>
                <div className="col-md-4">
                  <label>Gallery Alt Text</label>
                  <input
                    type="text"
                    className="form-control"
                    name="galleryAltText"
                    value={gallery.galleryAltText}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label>Image File</label>
                  <input
                    type="file"
                    className="form-control"
                    name="file"
                    accept="image/*"
                    onChange={(e) => handleInputChange(index, e)}
                    required={!galleryId} // If editing, don't require file
                  />
                  {gallery.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={gallery.imageUrl}
                        alt="Preview"
                        className="img-fluid"
                        style={{
                          width: "100px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemoveField(index)}
                    disabled={galleryFields.length === 1}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            {!galleryId && (
              <div>
                <button
                  type="button"
                  className="btn btn-secondary mb-3"
                  onClick={handleAddField}
                >
                  + Add More
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              {galleryId ? "Update" : "Add"} Gallery
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGallery;
