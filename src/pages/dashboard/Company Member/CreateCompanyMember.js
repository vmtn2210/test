import React, { useState } from "react";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import "../../../assets/css/ticket.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Close,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { genderOptions } from "../../helpers/tableComlumn";
import zxcvbn from "zxcvbn";
import { createCompanyMember } from "../../../app/api/companyMember";
import Gallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const CreateCompanyMember = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    user: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      email: "",
      gender: 0,
      avatarUrl: "",
      phoneNumber: "",
      dateOfBirth: "",
    },
    isCompanyAdmin: false,
    memberPosition: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [DateBirth, setDateBirth] = useState(moment());
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState([]);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    memberPosition: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const images = imagePreviewUrl.map((url, index) => ({
    original: url,
    thumbnail: url,
    description: `Attachment Preview ${index + 1}`,
  }));

  const handleDateBirthChange = (newDate) => {
    const formattedDate = moment(newDate).format("YYYY-MM-DDTHH:mm:ss");
    setDateBirth(newDate);
    setData((prevInputs) => ({
      ...prevInputs,
      user: {
        ...prevInputs.user,
        dateOfBirth: formattedDate,
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; 
    if (!file) return; 
  
    setSelectedFile([file]);
  
    const reader = new FileReader();
  
    reader.onloadend = () => {
      setImagePreviewUrl([reader.result]);
    };
  
    reader.readAsDataURL(file);
    setIsImagePreviewOpen(true);
  };

  const getPasswordStrength = () => {
    const passwordStrength = zxcvbn(data.password);
    const score = passwordStrength.score;

    switch (score) {
      case 0:
        return { label: "Weak", color: "red" };
      case 1:
        return { label: "Fair", color: "orange" };
      case 2:
        return { label: "Good", color: "yellow" };
      case 3:
        return { label: "Strong", color: "green" };
      case 4:
        return { label: "Very Strong", color: "blue" };
      default:
        return { label: "", color: "" };
    }
  };

  const handleIsCompanyAdminChange = (newValue) => {
    setData((prevData) => ({
      ...prevData,
      isCompanyAdmin: newValue,
    }));
  };

  const handleMemberPositionChange = (newValue) => {
    setData((prevData) => ({
      ...prevData,
      memberPosition: newValue,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name in data.member) {
      setData((prevData) => ({
        ...prevData,
        user: {
          ...prevData.user,
          [name]: value,
        },
      }));
    } else {
      setData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          email: "Invalid email format",
        }));
      }
    }

    if (name === "username" && value.length < 6) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        username: "Username must be at least 6 characters",
      }));
    }
    if (name === "firstName" && value.length < 2) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        firstName: "First Name must be at least 2 characters",
      }));
    }

    if (name === "lastName" && value.length < 2) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        lastName: "Last Name must be at least 2 characters",
      }));
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!data.user.firstName) {
      errors.firstName = "First Name is required";
    }
    if (!data.user.lastName) {
      errors.lastName = "Last Name is required";
    }
    if (!data.user.username) {
      errors.username = "User Name is required";
    }
    if (!data.user.password) {
      errors.password = "Password is required";
    }
    if (!data.user.email) {
      errors.email = "Email is required";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = data.avatarUrl;

      if (selectedFile) {
        const storage = getStorage();
        const storageRef = ref(storage, "images/" + selectedFile.name);
        await uploadBytes(storageRef, selectedFile);
        avatarUrl = await getDownloadURL(storageRef);
      }
      const updatedData = {
        user: {
          ...data.user,
          avatarUrl: avatarUrl,
          dateOfBirth: data.user.dateOfBirth
            ? moment(data.user.dateOfBirth).format("YYYY-MM-DDTHH:mm:ss")
            : null,
        },
        isCompanyAdmin: data.isCompanyAdmin,
        memberPosition: data.memberPosition,
      };
      setData(updatedData);
      await createCompanyMember({
        user: {
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          username: data.user.username,
          password: data.user.password,
          email: data.user.email,
          gender: data.user.gender,
          avatarUrl: data.user.avatarUrl,
          phoneNumber: data.user.phoneNumber,
          dateOfBirth: data.user.dateOfBirth,
        },
        isCompanyAdmin: data.isCompanyAdmin,
        memberPosition: data.memberPosition,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    const isFormFilled =
      data.user.firstName.trim() !== "" ||
      data.user.lastName.trim() !== "" ||
      data.user.username.trim() !== "" ||
      data.user.password.trim() !== "" ||
      data.user.email.trim() !== "";
    if (isFormFilled) {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave? Your changes may not be saved."
      );
      if (!confirmLeave) {
        return;
      }
    }
    navigate(`/home/companyMember`);
  };

  return (
    <Grid
      container
      style={{
        border: "1px solid #ccc",
        paddingRight: "10px",
        paddingLeft: "10px",
      }}
    >
      <Grid item xs={12}>
        <MDBCol md="12">
          <MDBRow className="border-box">
            <MDBCol md="5" className="mt-2">
              <div className="d-flex align-items-center">
                <button type="button" className="btn btn-link icon-label">
                  <ArrowBack
                    onClick={handleGoBack}
                    className="arrow-back-icon"
                  />
                </button>

                <div
                  style={{
                    marginLeft: "40px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "30px",
                      fontWeight: "bold",
                      marginRight: "10px",
                    }}
                  >
                    Create Customer
                  </h2>
                  <span style={{ fontSize: "18px", color: "#888" }}>
                    Create a customer for assistance.
                  </span>
                </div>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCol>
        <MDBRow className="mb-4">
          <MDBCol
            md="12"
            className="mt-4"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Grid container justifyContent="flex-end">
              <Grid
                container
                justifyContent="flex-end"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span>First Name
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        className="form-control-text input-field"
                        value={data.firstName}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.firstName && (
                        <div style={{ color: "red" }}>
                          {fieldErrors.firstName}
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                          marginBottom: "40px",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span>Last Name
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        className="form-control-text input-field"
                        value={data.lastName}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.lastName && (
                        <div style={{ color: "red" }}>
                          {fieldErrors.lastName}
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                container
                justifyContent="flex-end"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span>User Name
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        className="form-control-text input-field"
                        value={data.username}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.username && (
                        <div style={{ color: "red" }}>
                          {fieldErrors.username}
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                          marginBottom: "60px",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span>Password
                        <IconButton onClick={togglePasswordVisibility}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control-text input-field"
                        value={data.password}
                        onChange={handleInputChange}
                        style={{
                          marginBottom: "50px",
                        }}
                      />
                      {fieldErrors.password && (
                        <div style={{ color: "red" }}>
                          {fieldErrors.password}
                        </div>
                      )}
                      {data.password && (
                        <div
                          style={{
                            color: getPasswordStrength().color,
                          }}
                        >
                          Password Seem: {getPasswordStrength().label}
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={3}>
                <h2
                  className="align-right"
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  Attachment
                </h2>
              </Grid>
              <Grid item xs={9}>
                <input
                  type="file"
                  name="file"
                  className="form-control input-field"
                  id="attachmentUrls"
                  onChange={handleFileChange}
                />
                {imagePreviewUrl && (
                  <div
                    className="image-preview"
                    onClick={() => setIsImagePreviewOpen(true)}
                  >
                    <p className="preview-text">
                      Click here to view attachment
                    </p>
                  </div>
                )}
              </Grid>

              <Grid
                container
                justifyContent="flex-end"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span>email
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        className="form-control-text input-field"
                        value={data.email}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.email && (
                        <div style={{ color: "red" }}>{fieldErrors.email}</div>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        Gender
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <select
                        id="gender"
                        name="gender"
                        className="form-select-custom"
                        value={data.gender}
                        onChange={handleInputChange}
                      >
                        {genderOptions
                          .filter((gender) => gender.id !== "")
                          .map((gender) => (
                            <option key={gender.id} value={gender.id}>
                              {gender.name}
                            </option>
                          ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                container
                justifyContent="flex-end"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span>phone number
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <input
                        id="phoneNumber"
                        type="text"
                        name="phoneNumber"
                        className="form-control-text input-field"
                        value={data.phoneNumber}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.phoneNumber && (
                        <div style={{ color: "red" }}>
                          {fieldErrors.phoneNumber}
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                          marginBottom: "40px",
                        }}
                      >
                        Date Customer
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                          slotProps={{
                            textField: {
                              helperText: `${DateBirth}`,
                            },
                          }}
                          value={DateBirth}
                          onChange={(newValue) =>
                            handleDateBirthChange(newValue)
                          }
                          renderInput={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                container
                justifyContent="flex-end"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span>Member Position
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <input
                        id="memberPosition"
                        type="text"
                        name="memberPosition"
                        className="form-control-text input-field"
                        value={data.memberPosition}
                        onChange={(e) =>
                          handleMemberPositionChange(e.target.value)
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2
                        className="align-right"
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        Company Admin
                      </h2>
                    </Grid>
                    <Grid item xs={6}>
                      <select
                        id="isCompanyAdmin"
                        name="isCompanyAdmin"
                        className="form-select-custom"
                        value={data.isCompanyAdmin}
                        onChange={(e) =>
                          handleIsCompanyAdminChange(e.target.value === "true")
                        }
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBCol>
        </MDBRow>

        <MDBCol md="12">
          <MDBRow className="border-box">
            <MDBCol md="12" className="mt-2 mb-2">
              <div className="d-flex justify-content-center align-items-center">
                <button
                  type="button"
                  className="btn btn-primary custom-btn-margin"
                  onClick={handleSubmitUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary custom-btn-margin"
                >
                  Cancel
                </button>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCol>
      </Grid>

      <Dialog
        open={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Image Preview
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setIsImagePreviewOpen(false)}
            aria-label="close"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Gallery items={images} />
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default CreateCompanyMember;
